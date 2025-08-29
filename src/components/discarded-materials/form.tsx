"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreateDiscardedMaterialData, DiscardedItem } from "@/lib/discarded-materials"
import { listSamplePreparations } from "@/lib/sample-preparation"
import { listSampleReceivings } from "@/lib/sample-receiving"

interface Props {
  initialData?: Partial<CreateDiscardedMaterialData>
  onSubmit: (data: CreateDiscardedMaterialData) => void
  readOnly?: boolean
}

export function DiscardedMaterialForm({ initialData, onSubmit, readOnly = false }: Props) {
  const [jobId, setJobId] = useState(initialData?.jobId ?? "")
  const [discardReason, setDiscardReason] = useState(initialData?.discardReason ?? "")
  const [discardDate, setDiscardDate] = useState(initialData?.discardDate ?? new Date().toISOString().split('T')[0])
  const [selectedSpecimens, setSelectedSpecimens] = useState<string[]>(initialData?.items?.map(item => item.specimenId) ?? [])
  const [openSpecimenSelect, setOpenSpecimenSelect] = useState(false)

  const allPreps = useMemo(() => listSamplePreparations(), [])
  const recMap = useMemo(() => new Map(listSampleReceivings().map(r => [r.id, r])), [])
  
  const selectedPrep = useMemo(() => allPreps.find(p => p.id === jobId), [allPreps, jobId])
  const selectedRec = useMemo(() => selectedPrep ? recMap.get(selectedPrep.sampleReceivingId) : null, [selectedPrep, recMap])

  // Get all available specimen IDs from the selected preparation
  const availableSpecimens = useMemo(() => {
    if (!selectedPrep) return []
    
    const specimens: Array<{
      specimenId: string
      itemNo: number
      itemDescription: string
      testMethod: string
      testConductedDate: string
    }> = []
    
    selectedPrep.items.forEach(item => {
      item.specimenIds.forEach(specimenId => {
        specimens.push({
          specimenId,
          itemNo: item.indexNo,
          itemDescription: item.description,
          testMethod: item.testMethodName,
          testConductedDate: item.plannedTestDate || new Date().toISOString().split('T')[0],
        })
      })
    })
    
    return specimens
  }, [selectedPrep])

  // Get selected items data for review
  const selectedItems = useMemo(() => {
    return availableSpecimens.filter(spec => selectedSpecimens.includes(spec.specimenId))
  }, [availableSpecimens, selectedSpecimens])

  const toggleSpecimen = useCallback((specimenId: string) => {
    setSelectedSpecimens(prev => 
      prev.includes(specimenId) 
        ? prev.filter(id => id !== specimenId)
        : [...prev, specimenId]
    )
  }, [])

  const removeSpecimen = useCallback((specimenId: string) => {
    setSelectedSpecimens(prev => prev.filter(id => id !== specimenId))
  }, [])

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobId || selectedSpecimens.length === 0 || !discardReason) return
    
    const items: DiscardedItem[] = selectedItems.map(item => ({
      itemNo: item.itemNo,
      itemDescription: item.itemDescription,
      testMethod: item.testMethod,
      specimenId: item.specimenId,
      testConductedDate: item.testConductedDate,
    }))

    onSubmit({
      jobId,
      sampleId: selectedRec?.sampleId ?? "",
      discardReason,
      discardDate,
      items,
    })
  }

  return (
    <form onSubmit={onFormSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Select Job & Items</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Job ID / Sample ID</Label>
            <Select value={jobId} onValueChange={setJobId} disabled={readOnly}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {allPreps.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">No jobs available</div>
                ) : (
                  allPreps.map(prep => (
                    <SelectItem key={prep.id} value={prep.id}>
                      {prep.prepNo} - {recMap.get(prep.sampleReceivingId)?.sampleId}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Specimen IDs to Discard</Label>
            <Popover open={openSpecimenSelect} onOpenChange={setOpenSpecimenSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSpecimenSelect}
                  className="justify-between h-10"
                  disabled={!selectedPrep || readOnly}
                >
                  {selectedSpecimens.length === 0
                    ? "Select specimens..."
                    : `${selectedSpecimens.length} specimen(s) selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search specimens..." />
                  <CommandList>
                    <CommandEmpty>No specimens found.</CommandEmpty>
                    <CommandGroup>
                      {availableSpecimens.map((spec) => (
                        <CommandItem
                          key={spec.specimenId}
                          onSelect={() => toggleSpecimen(spec.specimenId)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSpecimens.includes(spec.specimenId) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{spec.specimenId}</span>
                            <span className="text-sm text-muted-foreground">
                              Item {spec.itemNo}: {spec.itemDescription}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedSpecimens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSpecimens.map(specimenId => (
                  <Badge key={specimenId} variant="secondary" className="gap-1">
                    {specimenId}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeSpecimen(specimenId)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedItems.length > 0 && (
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="text-xl">Review Items Selected for Discard</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item No.</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Test Method</TableHead>
                    <TableHead>Specimen ID</TableHead>
                    <TableHead>Test Conducted Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.map((item) => (
                    <TableRow key={item.specimenId}>
                      <TableCell className="font-medium">{item.itemNo}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.itemDescription}>
                        {item.itemDescription}
                      </TableCell>
                      <TableCell>{item.testMethod}</TableCell>
                      <TableCell className="font-mono">{item.specimenId}</TableCell>
                      <TableCell>{item.testConductedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl">Discard Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Discard Date</Label>
            <Input
              type="date"
              value={discardDate}
              onChange={(e) => setDiscardDate(e.target.value)}
              disabled={readOnly}
            />
          </div>
          
          <div className="grid gap-2 md:col-span-2">
            <Label>Reason for Discard</Label>
            <Textarea
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              placeholder="Enter the reason for discarding these materials..."
              disabled={readOnly}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="px-6"
              disabled={!jobId || selectedSpecimens.length === 0 || !discardReason}
            >
              {initialData ? "Update Discard Record" : "Create Discard Record"}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
