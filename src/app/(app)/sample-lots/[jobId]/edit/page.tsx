"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { sampleInformationService } from "@/lib/sample-information"
import { sampleLotService, SampleLot } from "@/lib/sample-lots"
import { TestMethodsSelector } from "@/components/common/test-methods-selector"

export default function EditSampleLotsForJobPage() {
  const params = useParams() as { jobId: string }
  const jobId = params.jobId
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: job } = useQuery({
    queryKey: ['sample-information-detail', jobId],
    queryFn: () => sampleInformationService.getById(jobId),
    enabled: !!jobId,
  })

  const { data: lotsData, isFetching } = useQuery({
    queryKey: ['sample-lots', jobId],
    queryFn: () => sampleLotService.search(jobId, 1),
    enabled: !!jobId,
  })

  type Row = {
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

  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    const initial = (lotsData?.results ?? []).map((lot, idx) => ({
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
    setRows(initial)
  }, [lotsData])

  const updateField = (id: string, key: keyof Row, value: any) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r))
  }

  const setRowMethods = (id: string, methods: string[]) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, testMethods: methods } : r))
  }

  const { mutate: saveAll, isPending } = useMutation({
    mutationFn: async (payload: Row[]) => {
      await Promise.all(payload.map(r => sampleLotService.update(r.id, {
        description: r.description || null,
        mtc_no: r.mtcNo || null,
        sample_type: r.sampleType || null,
        material_type: r.materialType || null,
        heat_no: r.heatNo || null,
        storage_location: r.storageLocation || null,
        condition: r.condition || null,
        test_method_oids: r.testMethods,
      })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-lots', jobId] })
      toast.success('Sample lots updated')
      router.push(ROUTES.APP.SAMPLE_INFORMATION.ROOT)
    },
    onError: () => {
      toast.error('Failed to update sample lots')
    }
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    saveAll(rows)
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Edit Sample Lots</CardTitle>
              {job && (
                <p className="text-sm text-muted-foreground mt-1">{job.job_id} — {job.project_name || 'Untitled Project'}</p>
              )}
            </div>
            <div>
              <Button type="submit" disabled={isPending}>Save Changes</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2">
          <ScrollArea className="w-full">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.indexNo}</TableCell>
                    <TableCell>
                      <Textarea className="min-h-[40px] w-[200px]" value={row.description} onChange={(e) => updateField(row.id, 'description', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.mtcNo} onChange={(e) => updateField(row.id, 'mtcNo', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.sampleType} onChange={(e) => updateField(row.id, 'sampleType', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.materialType} onChange={(e) => updateField(row.id, 'materialType', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.heatNo} onChange={(e) => updateField(row.id, 'heatNo', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.storageLocation} onChange={(e) => updateField(row.id, 'storageLocation', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.condition} onChange={(e) => updateField(row.id, 'condition', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TestMethodsSelector value={row.testMethods} onValueChange={(v) => setRowMethods(row.id, v)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </form>
  )
}


