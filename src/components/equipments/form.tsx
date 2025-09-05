"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Equipment, equipmentService, CreateEquipmentData, UpdateEquipmentData } from "@/lib/equipments"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"

type Props = { initial?: Equipment, readOnly?: boolean }

export function EquipmentForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditing = useMemo(() => Boolean(initial), [initial])

  const [name, setName] = useState((initial as any)?.equipmentName ?? "")
  const [serial, setSerial] = useState((initial as any)?.equipmentSerial ?? "")
  const [status, setStatus] = useState(initial?.status ?? "")
  const [lastInternalVerificationDate, setLastInternalVerificationDate] = useState((initial as any)?.lastVerification ?? "")
  const [internalVerificationDueDate, setInternalVerificationDueDate] = useState((initial as any)?.verificationDue ?? "")
  const [createdBy, setCreatedBy] = useState(initial?.createdBy ?? "")
  const [updatedBy, setUpdatedBy] = useState(initial?.updatedBy ?? "")
  const [remarks, setRemarks] = useState(initial?.remarks ?? "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Equipment Name is required")
      return
    }
    const payload: CreateEquipmentData = {
      equipmentName: name.trim(),
      equipmentSerial: serial.trim() || undefined,
      status: status.trim() || undefined,
      lastVerification: lastInternalVerificationDate || undefined,
      verificationDue: internalVerificationDueDate || undefined,
      createdBy: createdBy.trim() || undefined,
      updatedBy: updatedBy.trim() || undefined,
      remarks: remarks.trim() || undefined,
    }

    if (isEditing && initial) {
      equipmentService.update((initial as any).id, payload as UpdateEquipmentData)
        .then(() => { 
          queryClient.invalidateQueries({ queryKey: ['equipments'] })
          toast.success("Record updated"); 
          router.push(ROUTES.APP.LAB_EQUIPMENTS.ROOT) 
        })
        .catch(() => toast.error("Failed to update"))
      return
    }

    equipmentService.create(payload)
      .then(() => { 
        queryClient.invalidateQueries({ queryKey: ['equipments'] })
        toast.success("Record created"); 
        router.push(ROUTES.APP.LAB_EQUIPMENTS.ROOT) 
      })
      .catch(() => toast.error("Failed to create"))
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Equipment Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="serial">Equipment Serial</Label>
              <Input id="serial" value={serial} onChange={(e) => setSerial(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g., Active, Inactive" disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastIVD">Last Internal Verification Date</Label>
              <Input id="lastIVD" type="date" value={lastInternalVerificationDate} onChange={(e) => setLastInternalVerificationDate(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="dueIVD">Internal Verification Due Date</Label>
              <Input id="dueIVD" type="date" value={internalVerificationDueDate} onChange={(e) => setInternalVerificationDueDate(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="createdBy">Created By</Label>
              <Input id="createdBy" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="updatedBy">Updated By</Label>
              <Input id="updatedBy" value={updatedBy} onChange={(e) => setUpdatedBy(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} disabled={readOnly} />
          </div>
        </CardContent>
      </Card>
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initial ? "Update Equipment" : "Save Equipment"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


