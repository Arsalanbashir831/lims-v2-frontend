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
import { sampleLotService, CreateSampleLotData, SampleLot } from "@/lib/sample-lots"
import { SampleInformation } from "@/lib/sample-information"
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
  job: SampleInformation
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
  const [job, setJob] = useState(initial?.job?.job_id ?? "")
  // const [description, setDescription] = useState("")
  // const [mtcNo, setMtcNo] = useState("")
  // const [sampleType, setSampleType] = useState("")
  // const [materialType, setMaterialType] = useState("")
  // const [heatNo, setHeatNo] = useState("")
  // const [storageLocation, setStorageLocation] = useState("")
  // const [condition, setCondition] = useState("")
  // const [testMethods, setTestMethods] = useState<string[]>([])
  const selectedJob = useMemo(() => {
    return {
      job_id: job,
      project_name: "",
      client_name: "",
    }
  }, [job])

  // Tabular items state
  type TableItem = {
    id: string
    indexNo: number
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
  const updateItemField = (id: string, key: keyof TableItem, value: any) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: value } : it))
  }
  const setRowMethods = (itemId: string, methodIds: string[]) => {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, testMethods: methodIds } : it))
  }
  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        indexNo: prev.length + 1,
        description: "",
        mtcNo: "",
        sampleType: "",
        materialType: "",
        heatNo: "",
        storageLocation: "",
        condition: "",
        testMethods: [],
      },
    ])
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
      setJob(initial.job.job_id ?? "")
      // setDescription("")
      // setMtcNo("")
      // setSampleType("")
      // setMaterialType("")
      // setHeatNo("")
      // setStorageLocation("")
      // setCondition("")
      // setTestMethods([])
    }
  }, [initial])

  // When editing lots for a job, load existing lots into table rows
  useEffect(() => {
    if (initial?.lots) {
      const rows = initial.lots.map((lot: any, idx: number) => ({
        id: lot.id,
        indexNo: idx + 1,
        description: lot.description ?? "",
        mtcNo: lot.mtc_no ?? "",
        sampleType: lot.sample_type ?? "",
        materialType: lot.material_type ?? "",
        heatNo: lot.heat_no ?? "",
        storageLocation: lot.storage_location ?? "",
        condition: lot.condition ?? "",
        testMethods: lot.test_method_oids ?? [],
      }))
      setItems(rows)
    }
  }, [initial?.lots])


  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!job.trim()) {
      toast.error("Job ID is required")
      return
    }
    
    // Only require top-level description when no table rows are used
    // if (items.length === 0 && !description.trim()) {
    //   toast.error("Description is required")
    //   return
    // }
    if (items.length === 0) {
      toast.error("At least one sample detail is required")
      return
    }

    // If there are table items, create one sample lot per row using new API
    if (items.length > 0) {
      const toCreate: CreateSampleLotData[] = items
        .filter((row) => !isMongoObjectId(row.id))
        .map((row) => ({
        job_id: job.trim(),
        // item_no will be generated by API per job_id
        description: row.description.trim() || null,
        mtc_no: row.mtcNo.trim() || null,
        sample_type: row.sampleType.trim() || null,
        material_type: row.materialType.trim() || null,
        heat_no: row.heatNo.trim() || null,
        storage_location: row.storageLocation.trim() || null,
        condition: row.condition.trim() || null,
        test_method_oids: row.testMethods,
      }))

      // If editing lots for a job, update existing rows; otherwise create
      if (isEditingLotsForJob) {
        const updates = items
          .filter((row) => isMongoObjectId(row.id))
          .map((row) => sampleLotService.update(row.id, {
            description: row.description || null,
            mtc_no: row.mtcNo || null,
            sample_type: row.sampleType || null,
            material_type: row.materialType || null,
            heat_no: row.heatNo || null,
            storage_location: row.storageLocation || null,
            condition: row.condition || null,
            test_method_oids: row.testMethods,
          }))
        const creates = toCreate.map((payload) => sampleLotService.create(payload))
        const deletions = deletedIds.map((id) => sampleLotService.delete(id))

        Promise.all([...updates, ...creates, ...deletions])
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['sample-lots', job] })
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

    // Fallback: legacy single create path (no table rows)
    // const payload: CreateSampleDetailData = {
    //   job: job.trim(),
    //   description: description.trim(),
    //   mtc_no: mtcNo.trim() || undefined,
    //   sample_type: sampleType.trim() || undefined,
    //   material_type: materialType.trim() || undefined,
    //   heat_no: heatNo.trim() || undefined,
    //   material_storage_location: storageLocation.trim() || undefined,
    //   condition: condition.trim() || undefined,
    //   test_methods: testMethods,
    // }

    if (isEditing && initial) {
      // This is now handled by the sample lots API, not the legacy sample detail service
      toast.success("Sample lots updated")
      router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT)
      return
    }

    // sampleDetailService.create(payload)
    //   .then(() => { 
    //     queryClient.invalidateQueries({ queryKey: ['sample-details'] })
    //     toast.success("Sample detail created"); 
    //     router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT) 
    //   })
    //   .catch((error) => {
    //     console.error("Failed to create sample detail:", error)
    //     toast.error("Failed to create sample detail")
    //   })
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
              value={job}
              onValueChange={setJob}
              placeholder="Select job..."
              disabled={readOnly || isEditingLotsForJob}
              selectedJob={selectedJob}
            />
          </div>
        </CardContent>
      </Card>

      {job ? (
        <Card className="border-muted/40">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Sample Details</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Tabular view for quick entry across multiple items.</p>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <ScrollArea className={cn("w-full max-w-screen", maxWidth)}>
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px]">#</TableHead>
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
                            selectedMethods={item.testMethods.map((id: string) => {
                              // Find the test method name from the lots data
                              const lot = initial?.lots?.find((l: any) => l.id === item.id)
                              if (!lot) return { id, test_name: `Method ${id}` }
                              
                              const methodIndex = lot.test_method_oids?.indexOf(id) ?? -1
                              const methodName = (lot as any).test_method_names?.[methodIndex] ?? `Method ${id}`
                              return { id, test_name: methodName }
                            })}
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
