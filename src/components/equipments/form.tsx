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
import { Equipment, createEquipment, updateEquipment } from "@/lib/equipments"
import { ROUTES } from "@/constants/routes"

type Props = { initial?: Equipment }

export function EquipmentForm({ initial }: Props) {
  const router = useRouter()
  const isEditing = useMemo(() => Boolean(initial), [initial])

  const [name, setName] = useState(initial?.name ?? "")
  const [serial, setSerial] = useState(initial?.serial ?? "")
  const [status, setStatus] = useState(initial?.status ?? "")
  const [lastInternalVerificationDate, setLastInternalVerificationDate] = useState(initial?.lastInternalVerificationDate ?? "")
  const [internalVerificationDueDate, setInternalVerificationDueDate] = useState(initial?.internalVerificationDueDate ?? "")
  const [createdBy, setCreatedBy] = useState(initial?.createdBy ?? "")
  const [updatedBy, setUpdatedBy] = useState(initial?.updatedBy ?? "")
  const [remarks, setRemarks] = useState(initial?.remarks ?? "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Equipment Name is required")
      return
    }
    const payload = {
      name: name.trim(),
      serial: serial.trim() || undefined,
      status: status.trim() || undefined,
      lastInternalVerificationDate: lastInternalVerificationDate || undefined,
      internalVerificationDueDate: internalVerificationDueDate || undefined,
      createdBy: createdBy.trim() || undefined,
      updatedBy: updatedBy.trim() || undefined,
      remarks: remarks.trim() || undefined,
    }

    if (isEditing && initial) {
      updateEquipment(initial.id, payload)
      toast.success("Record updated")
      router.push(ROUTES.APP.LAB_EQUIPMENTS)
      return
    }

    createEquipment(payload)
    toast.success("Record created")
    router.push(ROUTES.APP.LAB_EQUIPMENTS)
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Equipment Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="serial">Equipment Serial</Label>
              <Input id="serial" value={serial} onChange={(e) => setSerial(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g., Active, Inactive" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastIVD">Last Internal Verification Date</Label>
              <Input id="lastIVD" type="date" value={lastInternalVerificationDate} onChange={(e) => setLastInternalVerificationDate(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="dueIVD">Internal Verification Due Date</Label>
              <Input id="dueIVD" type="date" value={internalVerificationDueDate} onChange={(e) => setInternalVerificationDueDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="createdBy">Created By</Label>
              <Input id="createdBy" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="updatedBy">Updated By</Label>
              <Input id="updatedBy" value={updatedBy} onChange={(e) => setUpdatedBy(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Button type="submit">{isEditing ? "Save changes" : "Add"}</Button>
            <Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}


