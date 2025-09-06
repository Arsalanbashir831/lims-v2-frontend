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
import { Badge } from "@/components/ui/badge"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { PreparationItem, createPreparationItem, samplePreparationService, CompleteJob, CompleteRequest } from "@/lib/sample-preparation"
import { JobSelectorForPreparation } from "@/components/common/job-selector-for-preparation"
import { SpecimenBadge } from "./specimen-badge"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

export interface SamplePreparationFormData extends Omit<CompleteRequest, "created_at" | "updated_at"> {
  id?: string
  job?: string
  test_items?: PreparationItem[]
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
  const [completeJob, setCompleteJob] = useState<CompleteJob | null>(null)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(initialData)

  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-21.5rem)]" : "lg:max-w-screen"), [state])

  // Load complete job data when job is selected
  useEffect(() => {
    const loadCompleteJob = async () => {
      if (!jobId) {
        setCompleteJob(null)
        if (!isEditing) {
          setItems([])
        }
        return
      }

      try {
        setLoading(true)
        const jobData = await samplePreparationService.getCompleteJob(jobId)
        setCompleteJob(jobData)

        // If we're in edit mode, convert sample IDs to proper IDs
        if (isEditing) {
          setItems(prevItems => {
            return prevItems.map(item => {
              // Find the sample by sample_id
              const sample = jobData.samples.find(s => String(s.sample_id) === String(item.sample))
              if (sample) {
                const convertedItem = {
                  ...item,
                  sample: sample.id, // Convert to number ID
                  // test_method is already the correct ID from test_method_details.id
                }
                return convertedItem
              }
              return item
            })
          })
        }

        // Auto-create first row if no items exist (only on initial load, not in edit mode)
        if (!isEditing) {
          setItems(prevItems => {
            if (prevItems.length === 0 && jobData.samples.length > 0) {
              const firstSample = jobData.samples[0]
              return [createPreparationItem({
                sample: firstSample.id,
                test_method: firstSample.test_methods[0] || "",
                no_of_samples: 1,
                no_of_specimens: 1,
                specimens: [],
              })]
            }
            return prevItems
          })
        }
      } catch (error) {
        console.error("Failed to load complete job:", error)
        toast.error("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    loadCompleteJob()
  }, [jobId, isEditing]) // Depend on jobId and isEditing

  // Map initial data to form fields when component mounts
  useEffect(() => {
    if (initialData && isEditing) {
      // Map job data if available
      if (initialData.job) {
        setJobId(String(initialData.job))
      }

      // Map test items if available
      if (initialData.test_items) {

        setItems(initialData.test_items as PreparationItem[])
      }
    }
  }, [initialData, isEditing])

  const addItem = useCallback(() => {
    if (!completeJob || completeJob.samples.length === 0) return
    setItems(prev => [...prev, createPreparationItem({
      sample: completeJob.samples[0].id,
      test_method: completeJob.samples[0].test_methods[0] || "",
      no_of_samples: 1,
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

  const commitSpecimenToken = useCallback((rowId: string, rawToken?: string) => {
    const token = (rawToken ?? specimenInputByRow[rowId] ?? "").trim()
    if (!token) return

    // Check for duplicate specimen IDs across all items (including current input)
    const allSpecimenIds = items.flatMap(item => item.specimens.map(s => s.specimen_id))
    if (allSpecimenIds.includes(token)) {
      toast.error(`Specimen ID "${token}" already exists. Please use a unique identifier.`)
      setSpecimenInputByRow(prev => ({ ...prev, [rowId]: "" }))
      return
    }

    // Check if the current row already has this specimen ID
    const currentRow = items.find(i => i.id === rowId)
    if (currentRow?.specimens.some(s => s.specimen_id === token)) {
      toast.error(`Specimen ID "${token}" already exists in this row.`)
      setSpecimenInputByRow(prev => ({ ...prev, [rowId]: "" }))
      return
    }

    setItems(prev => prev.map(i => {
      if (i.id !== rowId) return i
      const cap = i.no_of_specimens > 0 ? i.no_of_specimens : Infinity
      if (i.specimens.length >= cap) {
        toast.error(`Maximum ${cap} specimens allowed for this item.`)
        return i
      }
      const newSpecimen = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate temporary ID
        specimen_id: token,
        isFromInitialData: false
      }
      return { ...i, specimens: [...i.specimens, newSpecimen] }
    }))
    setSpecimenInputByRow(prev => ({ ...prev, [rowId]: "" }))
  }, [specimenInputByRow, items])

  const removeSpecimenId = useCallback((rowId: string, idToRemove: string) => {
    setItems(prev => prev.map(i => (i.id === rowId ? { ...i, specimens: i.specimens.filter(s => s.specimen_id !== idToRemove) } : i)))
  }, [])

  // Handle specimen deletion with conditional API call
  const handleSpecimenDelete = useCallback(async (specimenId: string, isFromInitialData?: boolean) => {

    try {
      // Only call API if specimen is from initial data (has a real ID from backend)
      if (isFromInitialData) {
        await samplePreparationService.deleteSpecimen(specimenId)
        toast.success("Specimen deleted successfully")
      } else {
        toast.success("Specimen removed")
      }

      // Remove from local state
      setItems(prev => prev.map(item => ({
        ...item,
        specimens: item.specimens.filter(spec => spec.id !== specimenId)
      })))
    } catch (error) {
      console.error("Failed to delete specimen:", error)
      toast.error("Failed to delete specimen")
    }
  }, [])

  // Handle specimen update with conditional API call
  const handleSpecimenUpdate = useCallback(async (specimenId: string, newSpecimenId: string, isFromInitialData?: boolean) => {
    try {
      // Only call API if specimen is from initial data (has a real ID from backend)
      if (isFromInitialData) {
        // Find the test item that contains this specimen
        const testItem = items.find(item => item.specimens.some(spec => spec.id === specimenId))
        if (!testItem) {
          toast.error("Test item not found")
          return
        }

        await samplePreparationService.updateSpecimen(specimenId, {
          test_item: testItem.id || '',
          specimen_id: newSpecimenId
        })

        toast.success("Specimen updated successfully")
      } else {
        toast.success("Specimen updated")
      }

      // Update local state
      setItems(prev => prev.map(item => ({
        ...item,
        specimens: item.specimens.map(spec =>
          spec.id === specimenId
            ? { ...spec, specimen_id: newSpecimenId }
            : spec
        )
      })))
    } catch (error) {
      console.error("Failed to update specimen:", error)
      toast.error("Failed to update specimen")
    }
  }, [items])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    if (!String(jobId).trim()) {
      toast.error("Job is required")
      return
    }

    if (items.length === 0) {
      toast.error("At least one test item is required")
      return
    }

    // Check for duplicate specimen IDs across all items
    const allSpecimenIds = items.flatMap(item => item.specimens.map(s => s.specimen_id))
    const duplicateIds = allSpecimenIds.filter((id, index) => allSpecimenIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateIds)]
      toast.error(`Duplicate specimen IDs found: ${uniqueDuplicates.join(', ')}. Each specimen ID must be unique.`)
      return
    }

    // Check for empty specimen IDs
    const emptySpecimenIds = items.some(item => item.specimens.some(specimen => !specimen.specimen_id.trim()))
    if (emptySpecimenIds) {
      toast.error("Please ensure all specimen IDs are filled in.")
      return
    }

    // Clean test items data - remove id field for new items and clean specimens
    const cleanedItems = items.map(item => {
      const { id, ...itemWithoutId } = item
      return {
        ...itemWithoutId,
        specimens: item.specimens.map(specimen => {
          const { id: specimenId, ...specimenWithoutId } = specimen
          return specimenWithoutId
        })
      }
    })

    const payload = {
      job: String(jobId).trim(),
      test_items: cleanedItems
    }

    // Handle create or update
    if (isEditing && initialData && 'id' in initialData && initialData.id) {
      // In edit mode, update each test item individually
      const updatePromises = items.map(async (item) => {
        if (!item.id) {
          return
        }

        const testItemData = {
          sample: item.sample.toString(),
          test_method: item.test_method,
          dimensions: item.dimensions || "",
          no_of_samples: item.no_of_samples.toString(),
          no_of_specimens: item.no_of_specimens.toString(),
          requested_by: item.requested_by || "",
          remarks: item.remarks || "",
          planned_test_date: item.planned_test_date || ""
        }

        return samplePreparationService.updateTestItem(item.id, testItemData)
      })

      try {
        await Promise.all(updatePromises.filter(Boolean))
        queryClient.invalidateQueries({ queryKey: ['sample-preparations'] })
        toast.success("Sample preparation updated")
        router.push(ROUTES.APP.SAMPLE_PREPARATION.ROOT)
      } catch (error) {
        console.error('Update failed:', error)
        toast.error("Failed to update sample preparation")
      }
    } else {
      samplePreparationService.create(payload)
        .then((response) => {
          queryClient.invalidateQueries({ queryKey: ['sample-preparations'] })
          toast.success("Sample preparation created");
          router.push(ROUTES.APP.SAMPLE_PREPARATION.ROOT)
        })
        .catch((error) => {
          console.error('Create failed:', error)

          // Check if this is a schema validation error but the API call was successful
          if (error.message && error.message.includes('API response validation failed')) {
            queryClient.invalidateQueries({ queryKey: ['sample-preparations'] })
            toast.success("Sample preparation created")
            router.push(ROUTES.APP.SAMPLE_PREPARATION.ROOT)
            return
          }

          // Handle backend validation errors with specific specimen ID errors
          if (error.response && error.response.data) {
            const errorData = error.response.data

            // Check for specimen ID validation errors in the specific format
            if (errorData.test_items && Array.isArray(errorData.test_items)) {
              const specimenErrors: string[] = []

              errorData.test_items.forEach((item: any, itemIndex: number) => {
                if (item.specimens && Array.isArray(item.specimens)) {
                  item.specimens.forEach((specimen: any, specIndex: number) => {
                    if (specimen.specimen_id && Array.isArray(specimen.specimen_id)) {
                      specimen.specimen_id.forEach((errorMsg: string) => {
                        if (errorMsg.includes('already exists')) {
                          specimenErrors.push(`Item ${itemIndex + 1}, Specimen ${specIndex + 1}: ${errorMsg}`)
                        }
                      })
                    }
                  })
                }
              })

              if (specimenErrors.length > 0) {
                toast.error(`Duplicate specimen IDs detected:\n${specimenErrors.join('\n')}`)
                return
              }
            }
          }

          // Handle other validation errors
          if (error.message && error.message.includes('specimen_id')) {
            toast.error("Duplicate specimen ID detected. Please use unique specimen IDs.")
          } else if (error.message && error.message.includes('Specimen ID already exists')) {
            toast.error("Specimen ID already exists. Please use a unique identifier.")
          } else if (error.message && error.message.includes('Invalid input')) {
            toast.error("Failed to create: Invalid data format")
          } else if (error.message && error.message.includes('ValidationError')) {
            toast.error("Validation error: Please check your input data")
          } else {
            toast.error("Failed to create: Please try again")
          }
        })
    }
  }

  // Helper function to check for duplicate specimen IDs
  const getDuplicateSpecimenIds = useCallback(() => {
    const allSpecimenIds = items.flatMap(item => item.specimens.map(s => s.specimen_id))
    const duplicates = allSpecimenIds.filter((id, index) => allSpecimenIds.indexOf(id) !== index)
    return [...new Set(duplicates)]
  }, [items])

  const duplicateSpecimenIds = getDuplicateSpecimenIds()

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
              onValueChange={(selectedJobId, selectedJob) => {
                setJobId(selectedJobId || "")
              }}
              placeholder="Select a job..."
              disabled={readOnly || isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {completeJob && (
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
          {duplicateSpecimenIds.length > 0 && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Duplicate Specimen IDs Detected
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>The following specimen IDs are duplicated: <strong>{duplicateSpecimenIds.join(', ')}</strong></p>
                    <p>Each specimen ID must be unique across all test items.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <CardContent className="px-2">
            {loading && !completeJob ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading job details...
              </div>
            ) : (
              <ScrollArea className={cn("w-full max-w-screen", maxWidth)}>
                <Table className="min-w-[1200px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead className="w-[220px]">Sample</TableHead>
                      <TableHead>Test Method</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>No. of Samples</TableHead>
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
                      const availableSamples = completeJob?.samples || []
                      const selectedSample = availableSamples.find(s => s.id === row.sample)
                      const availableMethods = selectedSample ?
                        selectedSample.test_methods.map((id, methodIndex) => ({
                          id,
                          name: selectedSample.test_method_names[methodIndex] || `Method ${methodIndex + 1}`
                        })) : []


                      return (
                        <TableRow key={row.id || index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <Select value={row.sample?.toString() || ""} onValueChange={(val) => {
                              const sample = availableSamples.find(s => s.id.toString() === val)
                              updateItemField(row.id || index.toString(), "sample", parseInt(val))
                              if (sample) {
                                updateItemField(row.id || index.toString(), "test_method", sample.test_methods[0] || "")
                              }
                            }} disabled={readOnly}>
                              <SelectTrigger className="w-[270px] h-10" disabled={readOnly}>
                                <SelectValue placeholder={availableSamples.length > 0 ? "Select sample..." : "Loading samples..."} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSamples.length > 0 ? (
                                  availableSamples.map(sample => (
                                    <SelectItem key={sample.id} value={sample.id.toString()}>
                                      {sample.sample_id} — {sample.description.slice(0, 60)}
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
                                updateItemField(row.id || index.toString(), "test_method", val)
                              }}
                              disabled={readOnly}
                            >
                              <SelectTrigger className="w-56 h-10" disabled={readOnly}>
                                <SelectValue placeholder={availableMethods.length > 0 ? "Select method" : "Loading methods..."} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableMethods.length > 0 ? (
                                  availableMethods.map((method) => (
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
                            <Input placeholder="Dimensions" value={row.dimensions || ""} onChange={(e) => updateItemField(row.id || index.toString(), "dimensions", e.target.value)} disabled={readOnly} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" min={0} value={row.no_of_samples} onChange={(e) => updateItemField(row.id || index.toString(), "no_of_samples", Number(e.target.value))} disabled={readOnly} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" min={0} value={row.no_of_specimens} onChange={(e) => updateItemField(row.id || index.toString(), "no_of_specimens", Number(e.target.value))} disabled={readOnly} />
                          </TableCell>
                          <TableCell>
                            <Input type="date" value={row.planned_test_date || ""} onChange={(e) => updateItemField(row.id || index.toString(), "planned_test_date", e.target.value)} disabled={readOnly} />
                          </TableCell>
                          <TableCell>
                            <Input className="w-[120px]" placeholder="Requested by" value={row.requested_by || ""} onChange={(e) => updateItemField(row.id || index.toString(), "requested_by", e.target.value)} disabled={readOnly} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {row.specimens.map((specimen) => (
                                <SpecimenBadge
                                  key={specimen.id || specimen.specimen_id}
                                  specimen={specimen}
                                  onDelete={handleSpecimenDelete}
                                  onUpdate={handleSpecimenUpdate}
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
                                    removeSpecimenId(row.id || index.toString(), row.specimens[row.specimens.length - 1].specimen_id)
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
                            <Input className="w-[120px]" placeholder="Remarks" value={row.remarks || ""} onChange={(e) => updateItemField(row.id || index.toString(), "remarks", e.target.value)} disabled={readOnly} />
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
              disabled={duplicateSpecimenIds.length > 0}
            >
              {initialData ? "Update Preparation" : "Save Preparation"}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}


