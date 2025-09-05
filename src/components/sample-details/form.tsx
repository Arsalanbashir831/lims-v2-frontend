"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SampleDetail, CreateSampleDetailData, UpdateSampleDetailData, TestMethodRef, sampleDetailService } from "@/lib/sample-details"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
  initial?: SampleDetail
  readOnly?: boolean
}

// Dummy options in the requested shape
const DUMMY_METHOD_OPTIONS: { id: string; test_name: string }[] = [
  { id: "metallography", test_name: "Metallography Test" },
  { id: "tensile", test_name: "Tensile Test" },
  { id: "hardness", test_name: "Hardness Test" },
  { id: "impact", test_name: "Charpy Impact Test" },
]

export function SampleDetailForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { state } = useSidebar()
  const [sampleInformationId, setSampleInformationId] = useState(initial?.sampleInformationId ?? "")
  const [indexNo, setIndexNo] = useState(initial?.indexNo ?? 1)
  const [description, setDescription] = useState(initial?.description ?? "")
  const [mtcNo, setMtcNo] = useState(initial?.mtcNo ?? "")
  const [sampleType, setSampleType] = useState(initial?.sampleType ?? "")
  const [materialType, setMaterialType] = useState(initial?.materialType ?? "")
  const [heatNo, setHeatNo] = useState(initial?.heatNo ?? "")
  const [storageLocation, setStorageLocation] = useState(initial?.storageLocation ?? "")
  const [condition, setCondition] = useState(initial?.condition ?? "")
  const [testMethods, setTestMethods] = useState<TestMethodRef[]>(initial?.testMethods ?? [])

  const isEditing = Boolean(initial)
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-24.5rem)]" : "lg:max-w-screen"), [state])

  const toggleMethodById = useCallback((methodId: string) => {
    const opt = DUMMY_METHOD_OPTIONS.find(o => o.id === methodId)
    if (!opt) return
    const asRef: TestMethodRef = { id: opt.id, name: opt.test_name }
    const exists = testMethods.some(tm => tm.id === methodId)
    if (exists) {
      setTestMethods(prev => prev.filter(tm => tm.id !== methodId))
    } else {
      setTestMethods(prev => [...prev, asRef])
    }
  }, [testMethods])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!sampleInformationId.trim()) {
      toast.error("Sample Information ID is required")
      return
    }
    
    if (!description.trim()) {
      toast.error("Description is required")
      return
    }

    const payload: CreateSampleDetailData = {
      sampleInformationId: sampleInformationId.trim(),
      indexNo,
      description: description.trim(),
      mtcNo: mtcNo.trim() || undefined,
      sampleType: sampleType.trim() || undefined,
      materialType: materialType.trim() || undefined,
      heatNo: heatNo.trim() || undefined,
      storageLocation: storageLocation.trim() || undefined,
      condition: condition.trim() || undefined,
      testMethods,
    }

    if (isEditing && initial) {
      sampleDetailService.update(initial.id, payload as UpdateSampleDetailData)
        .then(() => { 
          queryClient.invalidateQueries({ queryKey: ['sample-details'] })
          toast.success("Sample detail updated"); 
          router.push(ROUTES.APP.SAMPLE_DETAILS.ROOT) 
        })
        .catch(() => toast.error("Failed to update"))
      return
    }

    sampleDetailService.create(payload)
      .then(() => { 
        queryClient.invalidateQueries({ queryKey: ['sample-details'] })
        toast.success("Sample detail created"); 
        router.push(ROUTES.APP.SAMPLE_DETAILS.ROOT) 
      })
      .catch(() => toast.error("Failed to create"))
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
            <Label>Sample Information ID</Label>
            <Input placeholder="Enter sample information ID" value={sampleInformationId} onChange={(e) => setSampleInformationId(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Index No</Label>
            <Input type="number" placeholder="1" value={indexNo} onChange={(e) => setIndexNo(Number(e.target.value))} disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label>Description</Label>
            <Textarea placeholder="Item description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={readOnly} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label>MTC No</Label>
            <Input placeholder="N/A" value={mtcNo} onChange={(e) => setMtcNo(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Sample Type</Label>
            <Input placeholder="round" value={sampleType} onChange={(e) => setSampleType(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Material Type</Label>
            <Input placeholder="carbon steel" value={materialType} onChange={(e) => setMaterialType(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Heat No</Label>
            <Input placeholder="Heat no." value={heatNo} onChange={(e) => setHeatNo(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Storage Location</Label>
            <Input placeholder="RACK D" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Condition</Label>
            <Input placeholder="GOOD" value={condition} onChange={(e) => setCondition(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label>Test Methods</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={readOnly}>
                  <ScrollArea className="w-[260px]">
                    <div className="flex flex-nowrap items-center gap-1">
                      {testMethods.length > 0 ? (
                        testMethods.map((method) => (
                          <span key={method.id} className="rounded bg-primary px-2 py-1 text-xs whitespace-nowrap text-primary-foreground">
                            {method.name}
                          </span>
                        ))
                      ) : (
                        <span className="whitespace-nowrap text-muted-foreground">Select Test Methods</span>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 w-full" align="start" sideOffset={5}>
                {DUMMY_METHOD_OPTIONS.length > 0 ? (
                  DUMMY_METHOD_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.id}
                      checked={testMethods.some(tm => tm.id === opt.id)}
                      onCheckedChange={() => toggleMethodById(opt.id)}
                      onSelect={(event) => event.preventDefault()}
                      disabled={readOnly}
                    >
                      {opt.test_name}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">No test methods available</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

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
