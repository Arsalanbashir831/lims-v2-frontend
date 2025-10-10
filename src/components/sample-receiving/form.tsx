"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon, ChevronDown } from "lucide-react"
import type { SampleReceiving, SampleItem, TestMethodRef } from "@/lib/sample-receiving"
import { createSampleItem, generateSampleCode } from "@/lib/sample-receiving"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ClientSelector } from "@/components/common/client-selector"
import { Client, clientService } from "@/services/clients.service"

export interface SampleReceivingFormData extends Omit<SampleReceiving, "id" | "createdAt" | "updatedAt"> {}

interface Props {
  initialData?: Partial<SampleReceivingFormData>
  onSubmit: (data: SampleReceivingFormData) => void
  readOnly?: boolean
}

// Dummy options in the requested shape
const DUMMY_METHOD_OPTIONS: { id: string; test_name: string }[] = [
  { id: "metallography", test_name: "Metallography Test" },
  { id: "tensile", test_name: "Tensile Test" },
  { id: "hardness", test_name: "Hardness Test" },
  { id: "impact", test_name: "Charpy Impact Test" },
]

export function SampleReceivingForm({ initialData, onSubmit, readOnly = false }: Props) {
  const { state } = useSidebar()
  const [projectName, setProjectName] = useState(initialData?.projectName ?? "")
  const [sampleId] = useState(initialData?.sampleId ?? generateSampleCode())
  const [clientId, setClientId] = useState(initialData?.clientId ?? "")
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const [endUser, setEndUser] = useState(initialData?.endUser ?? "")
  const [receiveDate, setReceiveDate] = useState(initialData?.receiveDate ?? "")
  const [storageLocation, setStorageLocation] = useState(initialData?.storageLocation ?? "")
  const [remarks, setRemarks] = useState(initialData?.remarks ?? "")
  const [items, setItems] = useState<SampleItem[]>(initialData?.items ?? [createSampleItem({ indexNo: 1 })])

  const numItems = useMemo(() => items.length, [items])
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-24.5rem)]" : "lg:max-w-screen"), [state])

  // Load selected client when clientId is available (for edit mode)
  useEffect(() => {
    const loadSelectedClient = async () => {
      if (clientId && !selectedClient) {
        try {
          const client = await clientService.getById(clientId)
          if (client) {
            setSelectedClient(client)
          }
        } catch (error) {
          console.error("Failed to load client:", error)
        }
      }
    }

    loadSelectedClient()
  }, [clientId, selectedClient])

  const addItem = useCallback(() => {
    setItems(prev => [...prev, createSampleItem({ indexNo: prev.length + 1 })])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, indexNo: idx + 1 })))
  }, [])

  const updateItemField = useCallback((id: string, key: keyof SampleItem, value: unknown) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [key]: value } : i)))
  }, [])

  const toggleMethodById = useCallback((itemId: string, methodId: string) => {
    const opt = DUMMY_METHOD_OPTIONS.find(o => o.id === methodId)
    if (!opt) return
    const asRef: TestMethodRef = { id: opt.id, name: opt.test_name }
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i
      const exists = i.testMethods.some(tm => tm.id === methodId)
      if (exists) {
        return { ...i, testMethods: i.testMethods.filter(tm => tm.id !== methodId) }
      }
      return { ...i, testMethods: [...i.testMethods, asRef] }
    }))
  }, [])

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ sampleId, projectName, clientId, endUser, receiveDate, numItems, storageLocation, items, remarks })
  }

  return (
    <form onSubmit={onFormSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Sample Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Basic details to identify and track the incoming sample batch.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Project Name</Label>
            <Input placeholder="e.g., MICROSTRUCTURE UNIFORMITY OF HEAT TREATED BOLT" value={projectName} onChange={(e) => setProjectName(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Client</Label>
            <ClientSelector
              value={clientId}
              onValueChange={(selectedClientId, client) => {
                setClientId(selectedClientId || "")
                setSelectedClient(client)
              }}
              placeholder="Select a client..."
              disabled={readOnly}
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone No.</Label>
            <Input 
              placeholder="Contact number" 
              value={selectedClient?.phone || ""} 
              disabled={true}
              className="bg-muted/50"
            />
          </div>
          <div className="grid gap-2">
            <Label>End User</Label>
            <Input placeholder="End user organization" value={endUser} onChange={(e) => setEndUser(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Receive Date</Label>
            <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Storage Location</Label>
            <Input placeholder="e.g., RACK D" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label>Remarks</Label>
            <Textarea placeholder="Additional notes about the batch or handling" value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={readOnly} />
          </div>
        </CardContent>
      </Card>

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
                  const selectedIds = item.testMethods.map(tm => tm.id)
                  const selectedObjects = DUMMY_METHOD_OPTIONS.filter(o => selectedIds.includes(o.id))
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between" disabled={readOnly}>
                              <ScrollArea className="w-[260px]">
                                <div className="flex flex-nowrap items-center gap-1">
                                  {selectedObjects.length > 0 ? (
                                    selectedObjects.map((s) => (
                                      <span key={s.id} className="rounded bg-primary px-2 py-1 text-xs whitespace-nowrap text-primary-foreground">
                                        {s.test_name}
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
                                  checked={selectedIds.includes(opt.id)}
                                  onCheckedChange={() => toggleMethodById(item.id, opt.id)}
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
                      </TableCell>
                      <TableCell>{item.testMethods.length}</TableCell>
                      <TableCell className="text-right">
                        {!readOnly && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
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

      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initialData ? "Update Sample" : "Save Sample"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}
