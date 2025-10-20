"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { sampleLotService, CreateSampleLotData } from "@/services/sample-lots.service"
import { SampleLot } from "@/lib/schemas/sample-lot"
import { SampleInformationResponse } from "@/services/sample-information.service"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"
import { JobSelector } from "@/components/common/job-selector"
import { TestMethodsSelector } from "@/components/common/test-methods-selector"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrashIcon, Plus as PlusIcon } from "lucide-react"
import { ConfirmPopover } from "@/components/ui/confirm-popover"

type CompleteSampleInformation = {
  job: SampleInformationResponse
  lots: SampleLot[]
}

interface Props {
  initial?: CompleteSampleInformation
  readOnly?: boolean
  editJobId?: string
}


export function SampleDetailForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { state } = useSidebar()
  const [jobDocumentId, setJobDocumentId] = useState(initial?.job?.id ?? "")
  const [selectedJobData, setSelectedJobData] = useState<SampleInformationResponse | null>(initial?.job || null)
  
  const selectedJob = useMemo(() => {
    return selectedJobData ? {
      job_id: selectedJobData.job_id,
      project_name: selectedJobData.project_name || "",
      client_name: selectedJobData.client_name || "",
    } : {
      job_id: "",
      project_name: "",
      client_name: "",
    }
  }, [selectedJobData])

  // Tabular items state
  type TableItem = {
    id: string
    indexNo: number
    itemNo: string
    description: string
    mtcNo: string
    sampleType: string
    materialType: string
    heatNo: string
    storageLocation: string
    condition: string
    testMethods: string[]
  }
  const [items, setItems] = useState<TableItem[]>([])
  const [duplicateItemNumbers, setDuplicateItemNumbers] = useState<Set<string>>(new Set())

  // Function to validate all item numbers for uniqueness
  const validateItemNumbers = (items: TableItem[]) => {
    const duplicates = new Set<string>();
    const seen = new Set<string>();

    items.forEach(item => {
      if (seen.has(item.itemNo)) {
        duplicates.add(item.id);
      } else {
        seen.add(item.itemNo);
      }
    });

    setDuplicateItemNumbers(duplicates);
  }

  const updateItemField = (id: string, key: keyof TableItem, value: string | number | string[]) => {
    setItems(prev => {
      const updatedItems = prev.map(it => it.id === id ? { ...it, [key]: value } : it);

      // Validate all item numbers after update
      if (key === 'itemNo') {
        validateItemNumbers(updatedItems);
      }

      return updatedItems;
    });
  }
  const setRowMethods = (itemId: string, methodIds: string[]) => {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, testMethods: methodIds } : it))
  }
  const addItem = () => {
    setItems(prev => {
      // Find the highest existing item number to continue sequence
      const existingNumbers = prev
        .map(item => {
          const match = item.itemNo.match(/-(\d{3})$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);

      // Find the next available number, ensuring uniqueness
      let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const baseItemNo = selectedJobData?.job_id ? `${selectedJobData.job_id}-` : `ITEM-`;

      // Ensure the generated item number is unique
      while (prev.some(item => item.itemNo === `${baseItemNo}${String(nextNumber).padStart(3, '0')}`)) {
        nextNumber++;
      }

      const nextItemNo = String(nextNumber).padStart(3, '0')

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          indexNo: prev.length + 1,
          itemNo: `${baseItemNo}${nextItemNo}`,
          description: "",
          mtcNo: "",
          sampleType: "",
          materialType: "",
          heatNo: "",
          storageLocation: "",
          condition: "",
          testMethods: [],
        },
      ]
    })
  }
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const isMongoObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test(value)
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id).map((it, idx) => ({ ...it, indexNo: idx + 1 })))
    if (isEditingLotsForJob && isMongoObjectId(id)) {
      setDeletedIds(prev => Array.from(new Set([...prev, id])))
    }
  }

  const isEditing = Boolean(initial)
  const isEditingLotsForJob = Boolean(initial?.job?.job_id)
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-24.5rem)]" : "lg:max-w-screen"), [state])

  // Update form when initial data changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setJobDocumentId(initial.job.id ?? "")
      setSelectedJobData(initial.job)
    }
  }, [initial])

  // When editing lots for a job, load existing lots into table rows
  useEffect(() => {
    if (initial?.lots) {
      const rows = initial.lots.map((lot, idx: number) => {
        const itemNo = String(idx + 1).padStart(3, '0');
        return {
          id: (lot as any).id ?? (lot as any)._id ?? crypto.randomUUID(),
          indexNo: idx + 1,
          itemNo: lot.item_no ?? (selectedJobData?.job_id ? `${selectedJobData.job_id}-${itemNo}` : `ITEM-${itemNo}`),
          description: lot.description ?? "",
          mtcNo: lot.mtc_no ?? "",
          sampleType: lot.sample_type ?? "",
          materialType: lot.material_type ?? "",
          heatNo: lot.heat_no ?? "",
          storageLocation: lot.storage_location ?? "",
          condition: lot.condition ?? "",
          testMethods: (lot.test_method_oids || []).map((tm: string) => tm),
        }
      })
      setItems(rows)
    }
  }, [initial?.lots, selectedJobData])

  // Validate item numbers whenever items change
  useEffect(() => {
    validateItemNumbers(items);
  }, [items]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!jobDocumentId.trim()) {
      toast.error("Job ID is required")
      return
    }

    // Check for duplicate item numbers
    if (duplicateItemNumbers.size > 0) {
      toast.error("Please fix duplicate item numbers before submitting")
      return
    }

    if (items.length === 0) {
      toast.error("At least one sample detail is required")
      return
    }

    // If there are table items, create one sample lot per row using new API
    if (items.length > 0) {
      const toCreate: CreateSampleLotData[] = items
        .filter((row) => !isMongoObjectId(row.id))
        .map((row) => ({
          job_id: jobDocumentId,
          item_no: row.itemNo.trim() || undefined,
          description: row.description.trim() || undefined,
          mtc_no: row.mtcNo.trim() || undefined,
          sample_type: row.sampleType.trim() || undefined,
          material_type: row.materialType.trim() || undefined,
          heat_no: row.heatNo.trim() || undefined,
          storage_location: row.storageLocation.trim() || undefined,
          condition: row.condition.trim() || undefined,
          test_method_oids: row.testMethods,
        }))

      // If editing lots for a job, update existing rows; otherwise create
      if (isEditingLotsForJob) {
        const updates = items
          .filter((row) => isMongoObjectId(row.id))
          .map((row) => sampleLotService.update(row.id, {
            item_no: row.itemNo || undefined,
            description: row.description || undefined,
            mtc_no: row.mtcNo || undefined,
            sample_type: row.sampleType || undefined,
            material_type: row.materialType || undefined,
            heat_no: row.heatNo || undefined,
            storage_location: row.storageLocation || undefined,
            condition: row.condition || undefined,
            test_method_oids: row.testMethods,
          }))
        const creates = toCreate.map((payload) => sampleLotService.create(payload))
        const deletions = deletedIds.map((id) => sampleLotService.delete(id))

        Promise.all([...updates, ...creates, ...deletions])
          .then(() => {
             queryClient.invalidateQueries({ queryKey: ['sample-lots', jobDocumentId] })
            toast.success("Sample lots updated")
            router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT)
          })
          .catch((error) => {
            console.error("Failed to update sample lots:", error)
            toast.error("Failed to update sample lots")
          })
        return
      } else {
        Promise.all(toCreate.map((payload) => sampleLotService.create(payload)))
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['sample-lots'] })
            toast.success("Sample lots created")
            router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT)
          })
          .catch((error) => {
            console.error("Failed to create sample lots:", error)
            toast.error("Failed to create sample lots")
          })
        return
      }
    }


    if (isEditing && initial) {
      // This is now handled by the sample lots API, not the legacy sample detail service
      toast.success("Sample lots updated")
      router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT)
      return
    }

  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Sample Detail</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Individual sample item details and test methods.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Job ID</Label>
            <JobSelector
              value={jobDocumentId}
              onValueChange={(documentId) => {
                setJobDocumentId(documentId)
              }}
              onJobSelect={(job) => {
                setSelectedJobData(job as SampleInformationResponse)
              }}
              placeholder="Select job..."
              disabled={readOnly || isEditingLotsForJob}
              selectedJob={selectedJob}
            />
          </div>
        </CardContent>
      </Card>

      {jobDocumentId ? (
        <Card className="border-muted/40">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Sample Details</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Tabular view for quick entry across multiple items.</p>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <ScrollArea className={cn("w-full max-w-screen", maxWidth)}>
              <Table className="min-w-[1320px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px]">#</TableHead>
                    <TableHead className="w-[120px]">Item No</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead>MTC No</TableHead>
                    <TableHead>Sample Type</TableHead>
                    <TableHead>Material Type</TableHead>
                    <TableHead>Heat No</TableHead>
                    <TableHead>Storage Location</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Test Methods</TableHead>
                    <TableHead>Total Tests</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const selectedIds = item.testMethods
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.indexNo}</TableCell>
                        <TableCell>
                          <Input
                            className={`w-[120px] ${duplicateItemNumbers.has(item.id) ? 'border-red-500 focus:border-red-500' : ''}`}
                            placeholder="Item No"
                            value={item.itemNo}
                            onChange={(e) => updateItemField(item.id, "itemNo", e.target.value)}
                            disabled={readOnly}
                          />
                          {duplicateItemNumbers.has(item.id) && (
                            <p className="text-xs text-red-500 mt-1">Item number must be unique</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Textarea className="min-h-[40px] w-[200px]" placeholder="Item description" value={item.description} onChange={(e) => updateItemField(item.id, "description", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="N/A" value={item.mtcNo} onChange={(e) => updateItemField(item.id, "mtcNo", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="round" value={item.sampleType} onChange={(e) => updateItemField(item.id, "sampleType", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="carbon steel" value={item.materialType} onChange={(e) => updateItemField(item.id, "materialType", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="Heat no." value={item.heatNo} onChange={(e) => updateItemField(item.id, "heatNo", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="RACK D" value={item.storageLocation} onChange={(e) => updateItemField(item.id, "storageLocation", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input placeholder="GOOD" value={item.condition} onChange={(e) => updateItemField(item.id, "condition", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <TestMethodsSelector
                            value={selectedIds}
                            onValueChange={(ids) => setRowMethods(item.id, ids)}
                            placeholder="Select test methods..."
                            disabled={readOnly}
                          />
                        </TableCell>
                        <TableCell>{item.testMethods.length}</TableCell>
                        <TableCell className="text-right">
                          {!readOnly && (
                            <ConfirmPopover
                              trigger={
                                <Button type="button" variant="ghost" size="sm">
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              }
                              title="Delete this row?"
                              description="This will remove the sample lot from the table."
                              confirmText="Delete"
                              onConfirm={() => removeItem(item.id)}
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
            {!readOnly && (
              <div className="flex justify-end p-3">
                <Button type="button" variant="outline" size="sm" onClick={addItem}><PlusIcon className="w-4 h-4 mr-1" />Add Row</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{isEditing ? "Update Sample Detail" : "Save Sample Detail"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}
