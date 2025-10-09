"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PlusIcon, TrashIcon, XIcon } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { generateStableId } from "@/utils/hydration-fix"
import { samplePreparationService } from "@/services/sample-preparation.service"
import { CreateSamplePreparationData } from "@/lib/schemas/sample-preparation"
import { sampleInformationService } from "@/services/sample-information.service"
import { SpecimenBadge } from "./specimen-badge"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"
import { JobSelector } from "../common/job-selector"

export interface SamplePreparationFormData {
  id?: string
  job?: string
  request_id?: string // Single sample lot ID
  test_items?: PreparationItem[]
}

// Local types for UI editing (since service module does not export these)
interface SpecimenDraft {
  id?: string
  specimen_id: string
  isFromInitialData?: boolean
}

interface PreparationItem {
  id?: string
  indexNo?: number
  test_method: string
  dimensions?: string
  item_description?: string
  no_of_specimens: number
  requested_by?: string
  remarks?: string
  planned_test_date?: string
  specimens: SpecimenDraft[]
}

interface SampleSummary {
  id: number
  sample_id: string
  description: string
  test_methods: string[]
  test_method_names: string[]
}

interface CompleteJob {
  job_id: string
  project_name: string
  client: { id: number; name: string; is_active: boolean }
  end_user?: string
  received_date: string
  remarks?: string
  is_active: boolean
  created_at: string
  updated_at: string
  samples: SampleSummary[]
  sample_count: number
}

function createPreparationItem(data: Partial<PreparationItem>): PreparationItem {
  return {
    id: generateStableId('item'),
    test_method: data.test_method ?? "",
    dimensions: data.dimensions ?? "",
    item_description: data.item_description ?? "",
    no_of_specimens: data.no_of_specimens ?? 0,
    requested_by: data.requested_by,
    remarks: data.remarks,
    planned_test_date: data.planned_test_date,
    specimens: data.specimens ?? [],
  }
}

interface Props {
  initialData?: Partial<SamplePreparationFormData>
  readOnly?: boolean
}

export function SamplePreparationForm({ initialData, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { state } = useSidebar();
  const [jobId, setJobId] = useState(initialData && 'job' in initialData ? String(initialData.job) : "")
  const [requestId, setRequestId] = useState(initialData && 'request_id' in initialData ? String(initialData.request_id) : "")
  const [items, setItems] = useState<PreparationItem[]>(initialData && 'test_items' in initialData ? (initialData.test_items as PreparationItem[]) : [])
  
  // For edit mode, ensure jobId and requestId are set from initial data
  useEffect(() => {
    if (initialData && 'job' in initialData && initialData.job) {
      setJobId(String(initialData.job))
    }
    if (initialData && 'request_id' in initialData && initialData.request_id) {
      setRequestId(String(initialData.request_id))
    }
  }, [initialData])

  // Initialize item descriptions from initial data
  useEffect(() => {
    if (initialData && 'test_items' in initialData && initialData.test_items) {
      const descriptions: Record<string, string> = {}
      initialData.test_items.forEach((item: any) => {
        if (item.id && item.description) {
          descriptions[item.id] = item.description
        }
      })
      setItemDescriptionByRow(descriptions)
    }
  }, [initialData])

  const [specimenInputByRow, setSpecimenInputByRow] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [completeJob, setCompleteJob] = useState<CompleteJob | null>(null)
  const [sampleIdMap, setSampleIdMap] = useState<Record<number, string>>({})
  const [itemDescriptionByRow, setItemDescriptionByRow] = useState<Record<string, string>>({})
  const [deletedSpecimenOids, setDeletedSpecimenOids] = useState<string[]>([])
  const [testMethodNames, setTestMethodNames] = useState<Record<string, string>>({})
  const [loadingTestMethodNames, setLoadingTestMethodNames] = useState(false)
  const [itemsInitialized, setItemsInitialized] = useState(false)

  const isEditing = Boolean(initialData)

  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-21.5rem)]" : "lg:max-w-screen"), [state])

  // Optimized test method name fetching - only when both job and items are loaded
  useEffect(() => {
    if (completeJob && items.length > 0) {
      // Collect all unique test method IDs to fetch names
      const allTestMethodIds = new Set<string>()
      
      // Add test methods from current items
      items.forEach((item) => {
        if (item.test_method) {
          allTestMethodIds.add(item.test_method)
        }
      })
      
      // Add test methods from available samples
      completeJob.samples.forEach(sample => {
        sample.test_methods.forEach((methodId: string) => allTestMethodIds.add(methodId))
      })
    }
  }, [completeJob, items, testMethodNames])

  // Helper available via old lib for UI rows

  // Load complete job data when job is selected
  useEffect(() => {
    const loadCompleteJob = async () => {
      if (!jobId) {
        setCompleteJob(null)
        if (!isEditing) setItems([])
        return
      }

      try {
        setLoading(true)
        // Use Next.js aggregated endpoint to get job + lots + method names
        const agg = await sampleInformationService.getCompleteSampleInformation(jobId)

        // Build a CompleteJob-like object for the UI from aggregated data
        const localSamples = (agg.lots || []).map((lot: any, idx: number) => ({
          id: idx + 1, // local numeric id used for selection
          sample_id: lot.item_no || String(idx + 1),
          description: lot.description || "",
          mtc_no: undefined,
          sample_type: undefined,
          material_type: undefined,
          heat_no: undefined,
          material_storage_location: undefined,
          condition: undefined,
          status: "",
          test_methods: (lot.test_method_oids || []).map(String),
          test_method_names: (lot.test_method_names || []).map(String),
          is_active: true,
        }))

        const localJob: CompleteJob = {
          job_id: agg.job?.job_id || jobId,
          project_name: agg.job?.project_name || "",
          client: {
            id: 0,
            name: agg.job?.client_name || "",
            is_active: true,
          } as any,
          end_user: agg.job?.end_user || undefined,
          received_date: agg.job?.receive_date || new Date().toISOString(),
          remarks: agg.job?.remarks || undefined,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          samples: localSamples as any,
          sample_count: localSamples.length,
        }

        // Map local numeric sample id -> real lot id (ObjectId string)
        const idMap: Record<number, string> = {}
        ;(agg.lots || []).forEach((lot: any, idx: number) => { idMap[idx + 1] = String(lot.id) })

        setSampleIdMap(idMap)
        setCompleteJob(localJob)

        if (!isEditing) {
          // In create mode, don't auto-add items - wait for user to select sample lot and add manually
        } else {
          // In edit mode, items are already loaded from initialData
          console.log('Edit mode - items loaded from initial data')
        }
      } catch (error) {
        console.error("Failed to load complete job:", error)
        toast.error("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    loadCompleteJob()
  }, [jobId, isEditing])

  // Map initial data to form fields when component mounts
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('Setting initial data in edit mode:', initialData)
      if (initialData.job) setJobId(String(initialData.job))
      if (initialData.test_items) {
        const mapped = (initialData.test_items as PreparationItem[]).map((it, idx) => ({
          ...it,
          id: it.id || `${idx}`,
        }))
        console.log('Mapped test items:', mapped)
        setItems(mapped)
        setItemsInitialized(true)
      }
    }
  }, [initialData, isEditing])

  const addItem = useCallback(() => {
    if (!completeJob || !requestId) return
    const selectedSampleLot = completeJob.samples.find((s: SampleSummary) => 
      String(sampleIdMap[s.id] || s.id) === requestId
    )
    setItems(prev => [...prev, createPreparationItem({
      test_method: selectedSampleLot?.test_methods[0] || "",
      no_of_specimens: 1,
      specimens: [],
    })])
  }, [completeJob, requestId, sampleIdMap])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, indexNo: idx + 1 })))
  }, [])

  const updateItemField = useCallback((id: string, key: keyof PreparationItem, value: any) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [key]: value } : i)))
  }, [])

  const commitSpecimenToken = useCallback(async (rowId: string, rawToken?: string) => {
    const token = (rawToken ?? specimenInputByRow[rowId] ?? "").trim()
    if (!token) return

    // Defer creation to submit; just add locally without id
    setItems(prev => prev.map((item) => {
      if (item.id !== rowId) return item
      // prevent duplicates within row
      if (item.specimens.some(s => s.specimen_id === token)) return item
      return { ...item, specimens: [...item.specimens, { specimen_id: token }] }
    }))

    setSpecimenInputByRow(prev => ({ ...prev, [rowId]: "" }))
  }, [specimenInputByRow])

  const removeSpecimenId = useCallback(async (rowId: string, identifier: string) => {
    // Immediate UI removal; defer server delete to submit if identifier looks like ObjectId
    if (identifier && identifier.length >= 12) {
      setDeletedSpecimenOids(prev => Array.from(new Set([...prev, identifier])))
    }
    setItems(prev => prev.map((item) => {
      if (item.id !== rowId) return item
      return { ...item, specimens: item.specimens.filter(s => (s.id ? s.id !== identifier : s.specimen_id !== identifier)) }
    }))
  }, [])


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    if (!String(jobId).trim()) {
      toast.error("Job is required")
      return
    }

    if (!String(requestId).trim()) {
      toast.error("Sample lot is required")
      return
    }

    if (items.length === 0) {
      toast.error("At least one request item is required")
      return
    }

    // Validate required fields (using existing UI fields)
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!String(item.dimensions || '').trim()) {
        toast.error(`Dimensions are required for row ${i + 1}`)
        return
      }
      if (!String(item.requested_by || '').trim()) {
        toast.error(`Requested by is required for row ${i + 1}`)
        return
      }
    }

    const payload: CreateSamplePreparationData = {
      request_no: "",
      request_id: requestId, // Single request_id at top level
      request_items: items.map((i) => ({
        item_description: i.item_description || "",
        planned_test_date: i.planned_test_date || "",
        dimension_spec: i.dimensions || "",
        request_by: i.requested_by || "",
        remarks: i.remarks || "",
        test_method_oid: i.test_method || "",
        // pass specimen_ids tokens; keep specimen_oids empty (backend fills)
        specimen_oids: [],
        specimen_ids: i.specimens.map(s => s.specimen_id).filter(Boolean) as string[],
      }))
    }

    try {
      if (isEditing && initialData && 'id' in initialData && initialData.id) {
        // Update existing sample preparation; backend will create new specimens from specimen_ids and merge
        await samplePreparationService.update(initialData.id, payload)
        // After structure is updated, delete any pending specimen oids
        for (const oid of deletedSpecimenOids) {
          try { await samplePreparationService.deleteSpecimen(oid) } catch {}
        }
        queryClient.invalidateQueries({ queryKey: ['sample-preparations'] })
        toast.success("Sample preparation updated successfully")
      } else {
        // Create new sample preparation
        await samplePreparationService.create(payload)
        queryClient.invalidateQueries({ queryKey: ['sample-preparations'] })
        toast.success("Sample preparation created successfully")
      }
      
      router.push(ROUTES.APP.SAMPLE_PREPARATION.ROOT)
    } catch (error) {
      console.error('Submit failed:', error)
      toast.error("Failed to save sample preparation")
    }
  }


  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Select Job</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Job ID</Label>
            <JobSelector
              value={jobId}
              onValueChange={(selectedJobId) => {
                setJobId(selectedJobId || "")
                setRequestId("") // Clear sample lot when job changes
              }}
              placeholder="Select a job..."
              disabled={readOnly || isEditing}
            />
          </div>
          {jobId && completeJob && (
            <div className="grid gap-2">
              <Label>Sample Lot</Label>
              <Select 
                value={requestId} 
                onValueChange={setRequestId}
                disabled={readOnly || isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sample lot..." />
                </SelectTrigger>
                <SelectContent>
                  {completeJob.samples.map((sample) => (
                    <SelectItem key={sample.id} value={String(sampleIdMap[sample.id] || sample.id)}>
                      {sample.sample_id} — {sample.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {Boolean(jobId) && Boolean(requestId) && (
        <Card className="border-muted/40">
          <CardHeader className="grid grid-cols-2">
            <div>
              <CardTitle className="text-xl">Testing Items</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Add one row per distinct test setup.</p>
            </div>
            {!readOnly && (
            <Button type="button" size="sm" onClick={addItem} className="max-w-[120px] justify-self-end" disabled={!completeJob}>
              <PlusIcon className="w-4 h-4 mr-1" />Add Row
            </Button>
            )}
          </CardHeader>
          <CardContent className="px-2">
          {loading && !completeJob ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading job details...</div>
          ) : (
          <ScrollArea className={cn("w-full max-w-screen", maxWidth)}>
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Test Method</TableHead>
                    <TableHead className="w-[200px]">Dimensions</TableHead>
                    <TableHead className="w-[300px]">Item Description</TableHead>
                    <TableHead>No. of Specimens</TableHead>
                    <TableHead>Planned Test Date</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Specimen IDs</TableHead>
                    <TableHead className="w-[200px]">Remarks</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isEditing && !itemsInitialized ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-sm text-muted-foreground">Loading test items...</div>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-sm text-muted-foreground">No test items added yet</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row, index) => {
                    // Get the selected sample lot from requestId
                    const selectedSampleLot = completeJob?.samples.find((s: SampleSummary) => 
                      String(sampleIdMap[s.id] || s.id) === requestId
                    )
                    const availableMethods = selectedSampleLot ?
                      selectedSampleLot.test_methods.map((id: string, methodIndex: number) => ({
                        id,
                        name: selectedSampleLot.test_method_names[methodIndex] || `Method ${methodIndex + 1}`
                      })) : []

                    return (
                      <TableRow key={row.id || index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Select
                            value={row.test_method}
                            onValueChange={(val) => {
                              updateItemField(row.id || index.toString(), "test_method" as any, val)
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger className="w-56 h-10" disabled={readOnly}>
                              <SelectValue placeholder={
                                loadingTestMethodNames 
                                  ? "Loading names..." 
                                  : availableMethods.length > 0 
                                    ? "Select method" 
                                    : "Loading methods..."
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMethods.length > 0 ? (
                                availableMethods.map((method: { id: string; name: string }) => {
                                  const methodName = testMethodNames[method.id] || method.name || method.id
                                  return (
                                    <SelectItem key={method.id} value={method.id}>{methodName}</SelectItem>
                                  )
                                })
                                ) : (
                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                  {completeJob ? "No methods available" : "Loading methods..."}
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            placeholder="Dimensions" 
                            value={row.dimensions || ""} 
                            onChange={(e) => updateItemField(row.id || index.toString(), "dimensions" as any, e.target.value)} 
                            disabled={readOnly}
                            className="w-[180px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Item description"
                            value={row.item_description || ""}
                            onChange={(e) => updateItemField(row.id || index.toString(), "item_description" as any, e.target.value)}
                            disabled={readOnly}
                            className="w-[280px]"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Input type="number" min={0} value={row.no_of_specimens} onChange={(e) => updateItemField(row.id || index.toString(), "no_of_specimens" as any, Number(e.target.value))} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input type="date" value={row.planned_test_date || ""} onChange={(e) => updateItemField(row.id || index.toString(), "planned_test_date" as any, e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input className="w-[120px]" placeholder="Requested by" value={row.requested_by || ""} onChange={(e) => updateItemField(row.id || index.toString(), "requested_by" as any, e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {row.specimens.map((specimen: SpecimenDraft) => (
                              <SpecimenBadge
                                key={specimen.id || specimen.specimen_id}
                                specimen={specimen}
                                onDelete={(specimenId) => removeSpecimenId(row.id || index.toString(), specimenId)}
                                onUpdate={async (specimenId, newSpecimenId) => {
                                  try {
                                    await samplePreparationService.updateSpecimen(specimenId, { specimen_id: newSpecimenId })
                                    setItems(prev => prev.map(item => ({
                                      ...item,
                                      specimens: item.specimens.map((spec: SpecimenDraft) => spec.id === specimenId ? { ...spec, specimen_id: newSpecimenId } : spec)
                                    })))
                                    toast.success("Specimen updated successfully")
                                  } catch (e) {
                                    toast.error("Failed to update specimen")
                                  }
                                }}
                                disabled={readOnly}
                              />
                            ))}
                            <Input
                              className="h-8 w-56"
                              placeholder="Type ID, press comma/space/Enter"
                              value={specimenInputByRow[row.id || index.toString()] ?? ""}
                              onChange={(e) => setSpecimenInputByRow(prev => ({ ...prev, [row.id || index.toString()]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "," || e.key === " " || e.key === "Enter") {
                                  e.preventDefault()
                                  commitSpecimenToken(row.id || index.toString())
                                } else if (e.key === "Backspace" && (specimenInputByRow[row.id || index.toString()] ?? "") === "" && row.specimens.length > 0) {
                                  removeSpecimenId(row.id || index.toString(), row.specimens[row.specimens.length - 1]?.id || "")
                                }
                              }}
                              onBlur={() => commitSpecimenToken(row.id || index.toString())}
                              onPaste={(e) => {
                                const txt = e.clipboardData.getData("text")
                                if (!txt) return
                                e.preventDefault()
                                const tokens = txt.split(/[\,\s]+/).map(s => s.trim()).filter(Boolean)
                                for (const t of tokens) commitSpecimenToken(row.id || index.toString(), t)
                              }}
                              disabled={readOnly}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Max {row.no_of_specimens} unique IDs</div>
                        </TableCell>
                        <TableCell>
                          <Input className="w-[120px]" placeholder="Remarks" value={row.remarks || ""} onChange={(e) => updateItemField(row.id || index.toString(), "remarks" as any, e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell className="text-right">
                          {!readOnly && (
                            <ConfirmPopover
                              title="Delete this testing item?"
                              confirmText="Delete"
                              onConfirm={() => removeItem(row.id || index.toString())}
                              trigger={<Button type="button" variant="ghost" size="sm"><TrashIcon className="w-4 h-4" /></Button>}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
          </CardContent>
        </Card>
      )}
      
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button
              type="submit"
              className="px-6"
            >
              {initialData ? "Update Preparation" : "Save Preparation"}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}


