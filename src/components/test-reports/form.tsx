"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { TestReport } from "@/lib/test-reports"
import { generateReportNo, type CertificateDetails, type ReportItem } from "@/lib/test-reports"
import { samplePreparationService } from "@/lib/sample-preparation"
import { listSampleReceivings } from "@/lib/sample-receiving"
import { DynamicTable, type DynamicColumn, type DynamicRow } from "@/components/pqr/form/dynamic-table"

export interface TestReportFormData extends Omit<TestReport, "id" | "createdAt" | "updatedAt"> {}

interface Props {
  initialData?: Partial<TestReportFormData>
  onSubmit: (data: TestReportFormData) => void
  readOnly?: boolean
}

function fallbackColumns(): DynamicColumn[] {
  return [
    { id: "label", header: "Label", accessorKey: "label", type: "label" },
    { id: "result", header: "Result", accessorKey: "result", type: "input" },
    { id: "remarks", header: "Remarks", accessorKey: "remarks", type: "textarea" },
  ]
}

function genLocalId(): string { return `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}` }

export function TestReportForm({ initialData, onSubmit, readOnly = false }: Props) {
  const [reportNo, setReportNo] = useState(initialData?.reportNo ?? generateReportNo())
  const [preparationId, setPreparationId] = useState(initialData?.preparationId ?? "")
  const [certificate, setCertificate] = useState<CertificateDetails>(initialData?.certificate ?? {
    dateOfSampling: "", dateOfTesting: "", issueDate: "", gripcoRefNo: "", revisionNo: "",
    clientName: "", poNumber: "", customerNameAndNo: "", atten: "", customerPo: "",
    projectName: "", laboratoryName: "", address: "", sampleDescription: "", materialGrade: "",
    temperature: "", humidity: "", samplePreparationMethod: "", testEquipment: "", equipmentCalibration: "",
    equipmentExpiryDate: "", mtcNo: "", heatNo: "",
  })
  const [items, setItems] = useState<ReportItem[]>(initialData?.items ?? [])

  const [allPreps, setAllPreps] = useState<any[]>([])
  const prepsMap = useMemo(() => new Map(allPreps.map(p => [p.id, p])), [allPreps])
  const selectedPrep = useMemo(() => prepsMap.get(preparationId) ?? null, [preparationId, prepsMap])

  useEffect(() => {
    const loadPreps = async () => {
      try {
        const response = await samplePreparationService.getAll(1)
        setAllPreps(response.results)
      } catch (error) {
        console.error("Failed to load preparations:", error)
      }
    }
    loadPreps()
  }, [])
  const recMap = useMemo(() => new Map(listSampleReceivings().map(r => [r.id, r])), [])

  useEffect(() => {
    if (!selectedPrep) return
    const seeded: ReportItem[] = selectedPrep.items.map((pi) => ({
      id: genLocalId(),
      preparationItemId: pi.id,
      specimenId: pi.specimenIds[0] ?? "",
      testMethodId: pi.testMethodId,
      testMethodName: pi.testMethodName,
      columns: fallbackColumns(),
      data: [{ id: "row-1", label: "" } as DynamicRow],
    }))
    setItems(seeded)
  }, [selectedPrep])

  const updateCertificate = <K extends keyof CertificateDetails>(key: K, value: CertificateDetails[K]) => setCertificate(prev => ({ ...prev, [key]: value }))
  const updateItem = useCallback((id: string, payload: Partial<ReportItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...payload } : i))
  }, [])
  const removeItem = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), [])

  const addSectionFor = useCallback((base: ReportItem) => {
    if (!selectedPrep) return
    const pi = selectedPrep.items.find(p => p.id === base.preparationItemId)
    const used = new Set(items.filter(i => i.preparationItemId === base.preparationItemId).map(i => i.specimenId).filter(Boolean))
    const nextSpec = (pi?.specimenIds ?? []).find(sid => !used.has(sid)) ?? ""
    const clone: ReportItem = {
      id: genLocalId(),
      preparationItemId: base.preparationItemId,
      specimenId: nextSpec,
      testMethodId: base.testMethodId,
      testMethodName: base.testMethodName,
      columns: Array.isArray(base.columns) && base.columns.length ? base.columns : fallbackColumns(),
      data: Array.isArray(base.data) && base.data.length ? base.data : [{ id: "row-1", label: "" } as DynamicRow],
    }
    setItems(prev => [...prev, clone])
  }, [items, selectedPrep])

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!preparationId) return
    onSubmit({ reportNo, preparationId, certificate, items })
  }

  return (
    <form onSubmit={onFormSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Select Request</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Report No.</Label>
            <Input value={reportNo} onChange={(e) => setReportNo(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Preparation / Request #</Label>
            <Select value={preparationId} onValueChange={setPreparationId} disabled={readOnly}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select a request..." /></SelectTrigger>
              <SelectContent>
                {allPreps.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">No requests available</div>
                ) : (
                  allPreps.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.prepNo}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Certificate Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {([
            ["dateOfSampling", "Date of Sampling", "date"],
            ["dateOfTesting", "Date of Testing", "date"],
            ["issueDate", "Issue Date", "date"],
            ["gripcoRefNo", "Gripco Ref No", "text"],
            ["revisionNo", "Revision No", "text"],
            ["clientName", "Client Name", "text"],
            ["poNumber", "PO #", "text"],
            ["customerNameAndNo", "Customer’s Name & no.", "text"],
            ["atten", "Atten", "text"],
            ["customerPo", "CUSTOMER PO", "text"],
            ["projectName", "Project Name", "text"],
            ["laboratoryName", "Name of Laboratory", "text"],
            ["address", "Address", "text"],
            ["sampleDescription", "Sample Description", "text"],
            ["materialGrade", "Material Grade", "text"],
            ["temperature", "Temperature", "text"],
            ["humidity", "Humidity", "text"],
            ["samplePreparationMethod", "Sample Preparation Method", "text"],
            ["testEquipment", "Test Equipment", "text"],
            ["equipmentCalibration", "Equipment Calibration", "text"],
            ["equipmentExpiryDate", "Equipment Expiry Date", "date"],
            ["mtcNo", "MTC No.", "text"],
            ["heatNo", "Heat No.", "text"],
          ] as const).map(([key, label, type]) => (
            <div key={key} className="grid gap-2">
              <Label>{label}</Label>
              {type === "date" ? (
                <Input type="date" value={certificate[key]} onChange={(e) => updateCertificate(key, e.target.value)} disabled={readOnly} />
              ) : (
                <Input value={certificate[key]} onChange={(e) => updateCertificate(key, e.target.value)} disabled={readOnly} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedPrep && (
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="text-xl">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {items.map((it) => {
              const pi = selectedPrep.items.find(p => p.id === it.preparationItemId)
              const rec = recMap.get(selectedPrep.sampleReceivingId)
              const cols: DynamicColumn[] = Array.isArray(it.columns) && it.columns.length > 0 ? it.columns : fallbackColumns()
              const rows: DynamicRow[] = Array.isArray(it.data) && it.data.length > 0 ? it.data : [{ id: "row-1" } as DynamicRow]
              const used = new Set(items.filter(i => i.preparationItemId === it.preparationItemId).map(i => i.specimenId).filter(Boolean))
              const remaining = (pi?.specimenIds ?? []).filter(sid => !used.has(sid))
              return (
                <Card key={it.id} className="border-muted/50">
                  <CardHeader className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="grid gap-1">
                      <Label>Specimen ID</Label>
                      <Select value={it.specimenId} onValueChange={(val) => updateItem(it.id, { specimenId: val })} disabled={readOnly}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select specimen" /></SelectTrigger>
                        <SelectContent>
                          {(pi?.specimenIds ?? []).map(sid => (<SelectItem key={sid} value={sid}>{sid}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label>Test Method</Label>
                      <Input value={it.testMethodName} readOnly className="bg-muted/50" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <DynamicTable
                      initialColumns={cols}
                      initialData={rows}
                      onColumnsChange={(newCols) => updateItem(it.id, { columns: (newCols as DynamicColumn[]) ?? [] })}
                      onDataChange={(newRows) => updateItem(it.id, { data: (newRows as DynamicRow[]) ?? [] })}
                    />
                    <div className="flex justify-between mt-2">
                      {!readOnly && remaining.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => addSectionFor(it)}><PlusIcon className="w-4 h-4 mr-1" />Add Section</Button>
                      )}
                      {!readOnly && (
                        <ConfirmPopover title="Remove this result?" confirmText="Remove" onConfirm={() => removeItem(it.id)} trigger={<Button type="button" variant="ghost" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}

      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initialData ? "Update Report" : "Save Report"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


