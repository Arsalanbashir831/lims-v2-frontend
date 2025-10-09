"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PlusIcon, TrashIcon } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { generateStableId } from "@/utils/hydration-fix"
import { NewSamplePreparation } from "@/lib/schemas/sample-preparation"
import { sampleLotService } from "@/services/sample-lots.service"
import { useParallelCreateSpecimens, useDeleteSpecimen, useUpdateSpecimen } from "@/hooks/use-specimens"
import { useCreateSamplePreparation, useUpdateSamplePreparation } from "@/hooks/use-sample-preparations"
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
  sample_lots_count: number
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
  const { state } = useSidebar();
  const queryClient = useQueryClient()
  const parallelCreateSpecimensMutation = useParallelCreateSpecimens()
  const createSamplePrepMutation = useCreateSamplePreparation()
  const updateSamplePrepMutation = useUpdateSamplePreparation()
  const deleteSpecimenMutation = useDeleteSpecimen()
  const updateSpecimenMutation = useUpdateSpecimen()

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
        // Use the new sample lots by job ID endpoint
        const response = await sampleLotService.getByJobDocumentId(jobId)

        // Build a CompleteJob-like object for the UI from the new API response
        const localSamples = (response.data || []).map((lot: any, idx: number) => ({
          id: idx + 1, // local numeric id used for selection
          sample_id: lot.item_no || String(idx + 1),
          description: lot.description || "",
          mtc_no: lot.mtc_no,
          sample_type: lot.sample_type,
          material_type: lot.material_type,
          heat_no: lot.heat_no,
          material_storage_location: lot.storage_location,
          condition: lot.condition,
          status: lot.is_active ? "active" : "inactive",
          test_methods: (lot.test_methods || []).map((tm: any) => tm.id),
          test_method_names: (lot.test_methods || []).map((tm: any) => tm.test_name),
          is_active: lot.is_active,
        }))

        const localJob: CompleteJob = {
          job_id: response.job_info?.job_id || jobId,
          project_name: response.job_info?.project_name || "",
          client: {
            id: 0,
            name: response.job_info?.client_name || "",
            is_active: true,
          } as any,
          end_user: response.job_info?.end_user || undefined,
          received_date: response.job_info?.receive_date || new Date().toISOString(),
          remarks: response.job_info?.remarks || undefined,
          is_active: true,
          created_at: response.job_info?.created_at || new Date().toISOString(),
          updated_at: response.job_info?.updated_at || new Date().toISOString(),
          samples: localSamples as any,
          sample_lots_count: response.total || localSamples.length,
        }

        // Map local numeric sample id -> real lot id (ObjectId string)
        const idMap: Record<number, string> = {}
          ; (response.data || []).forEach((lot: any, idx: number) => { idMap[idx + 1] = String(lot.id) })

        setSampleIdMap(idMap)
        setCompleteJob(localJob)
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

    console.log('commitSpecimenToken called with:', { rowId, token })

    // Defer creation to submit; just add locally without id
    setItems(prev => {
      console.log('Current items before update:', prev.map(i => ({ id: i.id, specimens: i.specimens.length })))
      const updated = prev.map((item) => {
        console.log('Processing item:', { itemId: item.id, rowId, matches: item.id === rowId })
        if (item.id !== rowId) return item
        // prevent duplicates within row
        if (item.specimens.some(s => s.specimen_id === token)) {
          console.log('Duplicate token found in row, skipping')
          return item
        }
        console.log('Adding token to row:', { itemId: item.id, token })
        return { ...item, specimens: [...item.specimens, { 
          specimen_id: token,
          _uniqueId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Add unique identifier
        }] }
      })
      console.log('Updated items after update:', updated.map(i => ({ id: i.id, specimens: i.specimens.length })))
      return updated
    })

    setSpecimenInputByRow(prev => ({ ...prev, [rowId]: "" }))
  }, [specimenInputByRow])

  const removeSpecimenId = useCallback(async (rowId: string, identifier: string) => {
    // For existing specimens (with document IDs), track for deletion
    if (identifier && identifier.length >= 12) {
      // Track deleted specimen IDs for submit
      setDeletedSpecimenOids(prev => Array.from(new Set([...prev, identifier])))
    }
    
    // Update UI - remove from specific row only
    setItems(prev => prev.map((item) => {
      if (item.id !== rowId) return item
      return { 
        ...item, 
        specimens: item.specimens.filter(s => {
          // For existing specimens, match by document ID
          if (s.id) return s.id !== identifier
          // For new specimens, match by specimen_id
          return s.specimen_id !== identifier
        })
      }
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

    try {
      // Step 1: Handle specimen creation for new specimens (existing specimens are already handled in real-time)
      let specimenIdToDocumentIdMap: Record<string, string> = {}
      
      // Build mapping for existing specimens (from initial data in edit mode)
      if (isEditing && initialData && 'test_items' in initialData && initialData.test_items) {
        const initialSpecimens = initialData.test_items.flatMap(item => item.specimens || [])
        initialSpecimens.forEach(spec => {
          if (spec.specimen_id && spec.id) {
            specimenIdToDocumentIdMap[spec.specimen_id] = spec.id
          }
        })
      }

      // Create new specimens (those without document IDs)
      const newSpecimens = items.flatMap(item => 
        item.specimens.filter(specimen => specimen.specimen_id && !specimen.id)
      )

      if (newSpecimens.length > 0) {
        const specimensData = newSpecimens.map(specimen => ({ specimen_id: specimen.specimen_id }))
        const specimensResponse = await parallelCreateSpecimensMutation.mutateAsync(specimensData)

        if (specimensResponse.errors.length > 0) {
          const errorMessages = specimensResponse.errors.map(err => `${err.specimen_id}: ${err.error}`).join(', ')
          toast.error(`Failed to create some specimens: ${errorMessages}`)
          return
        }

        specimensResponse.success.forEach(specimen => {
          specimenIdToDocumentIdMap[specimen.specimen_id] = specimen.id
        })
      }

      // Step 2: Delete specimens that were marked for deletion
      if (deletedSpecimenOids.length > 0) {
        for (const specimenId of deletedSpecimenOids) {
          try {
            await deleteSpecimenMutation.mutateAsync(specimenId)
            console.log(`Deleted specimen with document ID ${specimenId}`)
          } catch (error) {
            console.error(`Failed to delete specimen ${specimenId}:`, error)
            // Don't fail the entire operation for individual specimen deletion errors
          }
        }
      }

      // Step 3: Create sample preparation payload
      const payload: NewSamplePreparation = {
        sample_lots: items.map((item) => ({
          item_description: item.item_description || "",
          sample_lot_id: requestId,
          test_method_oid: item.test_method || "",
          specimen_oids: item.specimens
            .map(specimen => {
              // Use existing document ID or newly created one
              return specimen.id || specimenIdToDocumentIdMap[specimen.specimen_id]
            })
            .filter((id): id is string => Boolean(id)),
          planned_test_date: item.planned_test_date || undefined,
          dimension_spec: item.dimensions || undefined,
          request_by: item.requested_by || undefined,
          remarks: item.remarks || undefined,
        }))
      }

      if (isEditing && initialData && 'id' in initialData && initialData.id) {
        // Update existing sample preparation
        await updateSamplePrepMutation.mutateAsync({ id: initialData.id, data: payload as any })
        
        // Force cache invalidation for the specific item
        queryClient.invalidateQueries({ queryKey: ['sample-preparations', 'detail', initialData.id] })
        
        toast.success("Sample preparation updated successfully")
      } else {
        // Create new sample preparation
        await createSamplePrepMutation.mutateAsync(payload as any)
        toast.success("Sample preparation created successfully")
      }
      
      // Clear deleted specimen IDs after successful submission
      setDeletedSpecimenOids([])
      
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
                                {row.specimens.map((specimen: SpecimenDraft, specIndex: number) => {
                                  const uniqueKey = (specimen as any)._uniqueId || `${row.id || index.toString()}-${specIndex}-${specimen.specimen_id}`
                                  console.log('SpecimenBadge key:', { uniqueKey, rowId: row.id, index, specIndex, specimenId: specimen.specimen_id, uniqueId: (specimen as any)._uniqueId })
                                  return (
                                    <SpecimenBadge
                                      key={uniqueKey}
                                      specimen={specimen}
                                    onDelete={(identifier) => removeSpecimenId(row.id || index.toString(), identifier)}
                                    onUpdate={async (specimenId, newSpecimenId) => {
                                      try {
                                        // Real-time specimen update
                                        if (isEditing && specimenId && specimenId.length >= 12) {
                                          // This is an existing specimen - update it via API
                                          await updateSpecimenMutation.mutateAsync({
                                            id: specimenId,
                                            data: { specimen_id: newSpecimenId }
                                          })
                                          toast.success("Specimen updated successfully")
                                        } else {
                                          // This is a new specimen - just update the UI
                                          setItems(prev => prev.map(item => 
                                            item.id === (row.id || index.toString()) 
                                              ? {
                                                  ...item,
                                                  specimens: item.specimens.map((spec: SpecimenDraft) => 
                                                    spec.id === specimenId ? { ...spec, specimen_id: newSpecimenId } : spec
                                                  )
                                                }
                                              : item
                                          ))
                                          toast.success("Specimen updated successfully")
                                        }
                                      } catch (e) {
                                        console.error("Failed to update specimen:", e)
                                        toast.error("Failed to update specimen")
                                      }
                                    }}
                                    disabled={readOnly}
                                  />
                                  )
                                })}
                                <Input
                                  className="h-8 w-56"
                                  placeholder="Type ID, press comma/space/Enter"
                                  value={specimenInputByRow[row.id || index.toString()] ?? ""}
                                  onChange={(e) => setSpecimenInputByRow(prev => ({ ...prev, [row.id || index.toString()]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    const currentRowId = row.id || index.toString()
                                    console.log('Input onKeyDown for row:', { rowId: currentRowId, key: e.key, rowIndex: index })
                                    if (e.key === "," || e.key === " " || e.key === "Enter") {
                                      e.preventDefault()
                                      commitSpecimenToken(currentRowId)
                                    } else if (e.key === "Backspace" && (specimenInputByRow[currentRowId] ?? "") === "" && row.specimens.length > 0) {
                                      removeSpecimenId(currentRowId, row.specimens[row.specimens.length - 1]?.id || "")
                                    }
                                  }}
                                  onBlur={() => {
                                    const currentRowId = row.id || index.toString()
                                    console.log('Input onBlur for row:', { rowId: currentRowId, rowIndex: index })
                                    commitSpecimenToken(currentRowId)
                                  }}
                                  onPaste={(e) => {
                                    const txt = e.clipboardData.getData("text")
                                    if (!txt) return
                                    e.preventDefault()
                                    const tokens = txt.split(/[\,\s]+/).map(s => s.trim()).filter(Boolean)
                                    const currentRowId = row.id || index.toString()
                                    console.log('Input onPaste for row:', { rowId: currentRowId, tokens, rowIndex: index })
                                    for (const t of tokens) commitSpecimenToken(currentRowId, t)
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


