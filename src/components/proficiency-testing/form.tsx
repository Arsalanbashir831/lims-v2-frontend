"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ProficiencyTest, createProficiencyTest, updateProficiencyTest } from "@/lib/proficiency-testing"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"

type Props = { initial?: ProficiencyTest }

export function ProficiencyTestingForm({ initial }: Props) {
  const router = useRouter()
  const isEditing = useMemo(() => Boolean(initial), [initial])

  const [description, setDescription] = useState(initial?.description ?? "")
  const [provider1, setProvider1] = useState(initial?.provider1 ?? "")
  const [provider2, setProvider2] = useState(initial?.provider2 ?? "")
  const [lastTestDate, setLastTestDate] = useState(initial?.lastTestDate ?? "")
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "")
  const [nextScheduledDate, setNextScheduledDate] = useState(initial?.nextScheduledDate ?? "")
  const [status, setStatus] = useState(initial?.status ?? "")
  const [remarks, setRemarks] = useState(initial?.remarks ?? "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error("Description is required")
      return
    }
    const payload = {
      description: description.trim(),
      provider1: provider1.trim() || undefined,
      provider2: provider2.trim() || undefined,
      lastTestDate: lastTestDate || undefined,
      dueDate: dueDate || undefined,
      nextScheduledDate: nextScheduledDate || undefined,
      status: status.trim() || undefined,
      remarks: remarks.trim() || undefined,
    }

    console.log("Submitting payload:", payload)

    if (isEditing && initial) {
      const updated = updateProficiencyTest(initial.id, payload)
      console.log("Updated record:", updated)
      toast.success("Record updated")
      router.push(ROUTES.APP.PROFICIENCY_TESTING.ROOT)
      return
    }

    const created = createProficiencyTest(payload)
    console.log("Created record:", created)
    toast.success("Record created")
    router.push(ROUTES.APP.PROFICIENCY_TESTING.ROOT)
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description of Testing Scope</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="provider1">PT Provider 1</Label>
              <Input id="provider1" value={provider1} onChange={(e) => setProvider1(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider2">PT Provider 2</Label>
              <Input id="provider2" value={provider2} onChange={(e) => setProvider2(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="lastTestDate">Last Test Date</Label>
              <Input id="lastTestDate" type="date" value={lastTestDate} onChange={(e) => setLastTestDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nextScheduledDate">Next Scheduled Date</Label>
              <Input id="nextScheduledDate" type="date" value={nextScheduledDate} onChange={(e) => setNextScheduledDate(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g., Pending, Completed" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
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


