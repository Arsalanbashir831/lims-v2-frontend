"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon, XIcon } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// removed DropdownMenu in favor of Select for method selection
import type { SampleReceiving, SampleItem, TestMethodRef } from "@/lib/sample-receiving"
import { listSampleReceivings } from "@/lib/sample-receiving"
import type { SamplePreparation, PreparationItem } from "@/lib/sample-preparation"
import { createPreparationItem, generatePrepNo } from "@/lib/sample-preparation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"

export interface SamplePreparationFormData extends Omit<SamplePreparation, "id" | "createdAt" | "updatedAt"> {}

interface Props {
  initialData?: Partial<SamplePreparationFormData>
  onSubmit: (data: SamplePreparationFormData) => void
  readOnly?: boolean
}

export function SamplePreparationForm({ initialData, onSubmit, readOnly = false }: Props) {
    const {state} = useSidebar();
  const [prepNo, setPrepNo] = useState(initialData?.prepNo ?? generatePrepNo())
  const [sampleReceivingId, setSampleReceivingId] = useState(initialData?.sampleReceivingId ?? "")
  const [items, setItems] = useState<PreparationItem[]>(initialData?.items ?? [])
  const [specimenInputByRow, setSpecimenInputByRow] = useState<Record<string, string>>({})

  const allReceivings = useMemo(() => listSampleReceivings(), [])
  const selectedReceiving = useMemo(() => allReceivings.find(r => r.id === sampleReceivingId) ?? null, [allReceivings, sampleReceivingId])
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-21.5rem)]" : "lg:max-w-screen"), [state])

  // Auto-create first row when sample is selected and no items exist
  const ensureFirstRow = useCallback(() => {
    if (!selectedReceiving) return
    setItems(prev => (prev.length === 0 ? [createPreparationItem({ indexNo: 1, sampleReceivingId })] : prev))
  }, [selectedReceiving, sampleReceivingId])

  // Run on sample select
  useMemo(() => { ensureFirstRow() }, [ensureFirstRow])

  const addItem = useCallback(() => {
    if (!selectedReceiving) return
    setItems(prev => [...prev, createPreparationItem({ indexNo: prev.length + 1, sampleReceivingId })])
  }, [selectedReceiving, sampleReceivingId])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, indexNo: idx + 1 })))
  }, [])

  const updateItemField = useCallback((id: string, key: keyof PreparationItem, value: any) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [key]: value } : i)))
  }, [])

  const commitSpecimenToken = useCallback((rowId: string, rawToken?: string) => {
    const token = (rawToken ?? specimenInputByRow[rowId] ?? "").trim()
    if (!token) return
    setItems(prev => prev.map(i => {
      if (i.id !== rowId) return i
      const exists = i.specimenIds.includes(token)
      const cap = i.numSpecimens > 0 ? i.numSpecimens : Infinity
      if (exists || i.specimenIds.length >= cap) return i
      return { ...i, specimenIds: [...i.specimenIds, token] }
    }))
    setSpecimenInputByRow(prev => ({ ...prev, [rowId]: "" }))
  }, [specimenInputByRow])

  const removeSpecimenId = useCallback((rowId: string, idToRemove: string) => {
    setItems(prev => prev.map(i => (i.id === rowId ? { ...i, specimenIds: i.specimenIds.filter(sid => sid !== idToRemove) } : i)))
  }, [])

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ prepNo, sampleReceivingId, items })
  }

  const jobItemLabelFor = useCallback((si: SampleItem) => `${selectedReceiving?.sampleId} / Item ${si.indexNo} - ${si.description.slice(0,40)}`, [selectedReceiving])

  return (
    <form onSubmit={onFormSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Select Sample</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Sample Receiving</Label>
            <Select value={sampleReceivingId} onValueChange={setSampleReceivingId} disabled={readOnly}>
              <SelectTrigger className="w-full h-10" disabled={readOnly}>
                <SelectValue placeholder="Select a sample..." />
              </SelectTrigger>
              <SelectContent>
                {allReceivings.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No samples available
                  </div>
                ) : (
                  allReceivings.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.sampleId} — {r.projectName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedReceiving && (
        <Card className="border-muted/40">
          <CardHeader className="grid grid-cols-2">
            <div>
              <CardTitle className="text-xl">Testing Items</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Add one row per distinct test setup.</p>
            </div>
            {!readOnly && (
              <Button type="button" size="sm" onClick={addItem} className="max-w-[120px] justify-self-end"><PlusIcon className="w-4 h-4 mr-1" />Add Row</Button>
            )}
          </CardHeader>
          <CardContent className="px-2">
          <ScrollArea className={cn("w-full max-w-screen", maxWidth)}>
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead className="w-[220px]">Job Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Heat #</TableHead>
                    <TableHead>Test Method</TableHead>
                    <TableHead>Dimension/Spec & Location</TableHead>
                    <TableHead>No. of Specimens</TableHead>
                    <TableHead>Planned Test Date</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Specimen IDs</TableHead>
                    <TableHead className="w-[200px]">Remarks</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const sampleItems = selectedReceiving.items
                    const selectedItem = sampleItems.find(si => si.id === row.sampleItemId)
                    const availableMethods = selectedItem ? selectedItem.testMethods : []
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.indexNo}</TableCell>
                        <TableCell>
                          <Select value={row.sampleItemId} onValueChange={(val) => {
                            const si = sampleItems.find(s => s.id === val)
                            updateItemField(row.id, "sampleItemId", val)
                            if (si) {
                              updateItemField(row.id, "jobItemLabel", jobItemLabelFor(si))
                              updateItemField(row.id, "description", si.description)
                              updateItemField(row.id, "heatNo", si.heatNo)
                              updateItemField(row.id, "testMethodId", "")
                              updateItemField(row.id, "testMethodName", "")
                            }
                          }} disabled={readOnly}>
                            <SelectTrigger className="w-[270px] h-10" disabled={readOnly}>
                              <SelectValue placeholder="Select sample item..." />
                            </SelectTrigger>
                            <SelectContent>
                              {sampleItems.map(si => (
                                <SelectItem key={si.id} value={si.id}>
                                  {selectedReceiving.sampleId} / Item {si.indexNo} — {si.description.slice(0,60)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input className="w-[200px]" placeholder="Item description" value={row.description} onChange={(e) => updateItemField(row.id, "description", e.target.value)} disabled />
                        </TableCell>
                        <TableCell>
                          <Input className="w-[100px]" placeholder="Heat no." value={row.heatNo} onChange={(e) => updateItemField(row.id, "heatNo", e.target.value)} disabled />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.testMethodId}
                            onValueChange={(val) => {
                              const m = availableMethods.find(mm => mm.id === val)
                              updateItemField(row.id, "testMethodId", val)
                              updateItemField(row.id, "testMethodName", m?.name ?? "")
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger className="w-56 h-10" disabled={readOnly}>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                const filtered = availableMethods.filter(m => m.id === row.testMethodId || !items.some(other => other.id !== row.id && other.testMethodId === m.id))
                                return filtered.length > 0 ? (
                                  filtered.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">No methods available</div>
                                )
                              })()}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input placeholder="Dimensions/spec & location" value={row.dimensionSpecLocation} onChange={(e) => updateItemField(row.id, "dimensionSpecLocation", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} value={row.numSpecimens} onChange={(e) => updateItemField(row.id, "numSpecimens", Number(e.target.value))} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input type="date" value={row.plannedTestDate} onChange={(e) => updateItemField(row.id, "plannedTestDate", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <Input className="w-[120px]" placeholder="Requested by" value={row.requestedBy} onChange={(e) => updateItemField(row.id, "requestedBy", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {row.specimenIds.map((sid) => (
                              <Badge key={sid} variant="secondary" className="flex items-center gap-1">
                                <span>{sid}</span>
                                {!readOnly && (
                                  <button type="button" onClick={() => removeSpecimenId(row.id, sid)} className="inline-flex items-center justify-center">
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                            <Input
                              className="h-8 w-56"
                              placeholder="Type ID, press comma/space/Enter"
                              value={specimenInputByRow[row.id] ?? ""}
                              onChange={(e) => setSpecimenInputByRow(prev => ({ ...prev, [row.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "," || e.key === " " || e.key === "Enter") {
                                  e.preventDefault()
                                  commitSpecimenToken(row.id)
                                } else if (e.key === "Backspace" && (specimenInputByRow[row.id] ?? "") === "" && row.specimenIds.length > 0) {
                                  removeSpecimenId(row.id, row.specimenIds[row.specimenIds.length - 1])
                                }
                              }}
                              onBlur={() => commitSpecimenToken(row.id)}
                              onPaste={(e) => {
                                const txt = e.clipboardData.getData("text")
                                if (!txt) return
                                e.preventDefault()
                                const tokens = txt.split(/[\,\s]+/).map(s => s.trim()).filter(Boolean)
                                for (const t of tokens) commitSpecimenToken(row.id, t)
                              }}
                              disabled={readOnly}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Max {row.numSpecimens} unique IDs</div>
                        </TableCell>
                        <TableCell>
                          <Input className="w-[120px]" placeholder="Remarks" value={row.remarks} onChange={(e) => updateItemField(row.id, "remarks", e.target.value)} disabled={readOnly} />
                        </TableCell>
                        <TableCell className="text-right">
                          {!readOnly && (
                            <ConfirmPopover
                              title="Delete this testing item?"
                              confirmText="Delete"
                              onConfirm={() => removeItem(row.id)}
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
          </CardContent>
        </Card>
      )}
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initialData ? "Update Preparation" : "Save Preparation"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


