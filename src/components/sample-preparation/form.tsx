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
import { samplePreparationService } from "@/lib/sample-preparation-new"
import { CreateSamplePreparationData } from "@/lib/schemas/sample-preparation"
import { sampleInformationService } from "@/lib/sample-information"
import { JobSelectorForPreparation } from "@/components/common/job-selector-for-preparation"
import { SpecimenBadge } from "./specimen-badge"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

export interface SamplePreparationFormData {
  id?: string
  job?: string
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
  sample: number
  test_method: string
  dimensions?: string
  no_of_specimens: number
  requested_by?: string
  remarks?: string
  planned_test_date?: string
  specimens: SpecimenDraft[]
  request_id_for_edit?: string
}

interface SampleSummary {
  id: number
  sample_id: string
  item_description: string
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
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sample: data.sample ?? 0,
    test_method: data.test_method ?? "",
    dimensions: data.dimensions ?? "",
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
  const [items, setItems] = useState<PreparationItem[]>(initialData && 'test_items' in initialData ? (initialData.test_items as PreparationItem[]) : [])
  const [specimenInputByRow, setSpecimenInputByRow] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [completeJob, setCompleteJob] = useState<CompleteJob | null>(null)
  const [sampleIdMap, setSampleIdMap] = useState<Record<number, string>>({})
  const [itemDescriptionByRow, setItemDescriptionByRow] = useState<Record<string, string>>({})
  const [deletedSpecimenOids, setDeletedSpecimenOids] = useState<string[]>([])

  const isEditing = Boolean(initialData)

  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-21.5rem)]" : "lg:max-w-screen"), [state])

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
          item_description: lot.item_description || "",
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
          setItems(prev => {
            if (prev.length === 0 && localJob.samples.length > 0) {
              const firstSample = (localJob as any).samples[0]
              return [createPreparationItem({
                sample: firstSample.id,
                test_method: firstSample.test_methods[0] || "",
                no_of_specimens: 1,
                specimens: [],
              })]
            }
            return prev
          })
        } else {
          // In edit mode, convert stored request_id to local numeric sample index
          setItems(prev => prev.map(it => {
            if (it.sample && it.sample > 0) return it
            const entry = Object.entries(idMap).find(([, lotId]) => lotId === (it.request_id_for_edit || ""))
            if (entry) {
              const numericId = parseInt(entry[0], 10)
              return { ...it, sample: numericId }
            }
            return it
          }))
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
      if (initialData.job) setJobId(String(initialData.job))
      if (initialData.test_items) {
        const mapped = (initialData.test_items as PreparationItem[]).map((it, idx) => ({
          ...it,
          id: it.id || `${idx}`,
        }))
        setItems(mapped)
      }
    }
  }, [initialData, isEditing])

  const addItem = useCallback(() => {
    if (!completeJob || completeJob.samples.length === 0) return
    setItems(prev => [...prev, createPreparationItem({
      sample: completeJob.samples[0].id,
      test_method: completeJob.samples[0].test_methods[0] || "",
      no_of_specimens: 1,
      specimens: [],
    })])
  }, [completeJob])

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
      request_items: items.map((i) => ({
        item_description: itemDescriptionByRow[i.id || ""] || i.dimensions || "",
        planned_test_date: i.planned_test_date || "",
        dimension_spec: i.dimensions || "",
        request_by: i.requested_by || "",
        remarks: i.remarks || "",
        request_id: sampleIdMap[i.sample] ?? String(i.sample || ""),
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
            <JobSelectorForPreparation
              value={jobId}
              onValueChange={(selectedJobId) => {
                setJobId(selectedJobId || "")
              }}
              placeholder="Select a job..."
              disabled={readOnly || isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {Boolean(jobId) && (
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
                    <TableHead className="w-[220px]">Sample</TableHead>
                    <TableHead>Test Method</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Item Description</TableHead>
                    
                    <TableHead>No. of Specimens</TableHead>
                    <TableHead>Planned Test Date</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Specimen IDs</TableHead>
                    <TableHead className="w-[200px]">Remarks</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, index) => {
                    const availableSamples = (completeJob?.samples ?? []) as SampleSummary[]
                    const selectedSample = availableSamples.find((s: SampleSummary) => s.id === row.sample)
                    const availableMethods = selectedSample ?
                      selectedSample.test_methods.map((id: string, methodIndex: number) => ({
                        id,
                        name: selectedSample.test_method_names[methodIndex] || `Method ${methodIndex + 1}`
                      })) : []

                    return (
                      <TableRow key={row.id || index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Select value={row.sample?.toString() || ""} onValueChange={(val) => {
                            const sample = availableSamples.find((s: SampleSummary) => s.id.toString() === val)
                            updateItemField(row.id || index.toString(), "sample" as any, parseInt(val))
                            if (sample) {
                              updateItemField(row.id || index.toString(), "test_method" as any, sample.test_methods[0] || "")
                            }
                          }} disabled={readOnly}>
                            <SelectTrigger className="w-[270px] h-10" disabled={readOnly}>
                              <SelectValue placeholder={availableSamples.length > 0 ? "Select sample..." : "Loading samples..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSamples.length > 0 ? (
                                availableSamples.map((sample: SampleSummary) => (
                                  <SelectItem key={sample.id} value={sample.id.toString()}>
                                    {sample.sample_id} — {sample.item_description.slice(0, 60)}
                                </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-1 text-sm text-muted-foreground">Loading samples...</div>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.test_method}
                            onValueChange={(val) => {
                              updateItemField(row.id || index.toString(), "test_method" as any, val)
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger className="w-56 h-10" disabled={readOnly}>
                              <SelectValue placeholder={availableMethods.length > 0 ? "Select method" : "Loading methods..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMethods.length > 0 ? (
                                availableMethods.map((method: { id: string; name: string }) => (
                                  <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                                  ))
                                ) : (
                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                  {completeJob ? "No methods available" : "Loading methods..."}
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input placeholder="Dimensions" value={row.dimensions || ""} onChange={(e) => updateItemField(row.id || index.toString(), "dimensions" as any, e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Item description"
                            value={itemDescriptionByRow[row.id || index.toString()] ?? ""}
                            onChange={(e) => setItemDescriptionByRow(prev => ({ ...prev, [row.id || index.toString()]: e.target.value }))}
                            disabled={readOnly}
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
                  })}
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


