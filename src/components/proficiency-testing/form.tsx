"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProficiencyTesting, proficiencyTestingService, CreateProficiencyTestingData, UpdateProficiencyTestingData } from "@/services/proficiency-testing.service"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"

type Props = { initial?: ProficiencyTesting, readOnly?: boolean }

export function ProficiencyTestingForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  // Invalidate cache after save
  // We'll use the list key ['proficiency-tests']
  // Keep simple here using redirect then list refetch on mount
  const isEditing = useMemo(() => Boolean(initial), [initial])

  const [description, setDescription] = useState(initial?.description ?? "")
  const [provider1, setProvider1] = useState(initial?.provider1 ?? "")
  const [provider2, setProvider2] = useState(initial?.provider2 ?? "")
  const [lastTestDate, setLastTestDate] = useState(
    initial?.last_test_date ? String(initial.last_test_date).split('T')[0] : ""
  )
  const [dueDate, setDueDate] = useState(
    initial?.due_date ? String(initial.due_date).split('T')[0] : ""
  )
  const [nextScheduledDate, setNextScheduledDate] = useState(
    initial?.next_scheduled_date ? String(initial.next_scheduled_date).split('T')[0] : ""
  )
  const [status, setStatus] = useState(initial?.status ?? "")
  const [remarks, setRemarks] = useState(initial?.remarks ?? "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error("Description is required")
      return
    }
    
    // Validate status if provided
    if (status.trim() && !['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'].includes(status.trim())) {
      toast.error("Status must be one of: Scheduled, In Progress, Completed, Cancelled, Overdue")
      return
    }
    
    const payload: CreateProficiencyTestingData = {
      description: description.trim(),
      provider1: provider1.trim() || undefined,
      provider2: provider2.trim() || undefined,
      last_test_date: lastTestDate || undefined,
      due_date: dueDate || undefined,
      next_scheduled_date: nextScheduledDate || undefined,
      status: status.trim() || undefined,
      remarks: remarks.trim() || undefined,
      is_active: true,
    }

    if (isEditing && initial?.id) {
      proficiencyTestingService.update(initial.id, payload as UpdateProficiencyTestingData)
        .then(() => { 
          queryClient.invalidateQueries({ queryKey: ['proficiency-tests'] })
          toast.success("Record updated"); 
          router.push(ROUTES.APP.PROFICIENCY_TESTING.ROOT) 
        })
        .catch(() => toast.error("Failed to update"))
      return
    }

    proficiencyTestingService.create(payload)
      .then(() => { 
        queryClient.invalidateQueries({ queryKey: ['proficiency-tests'] })
        toast.success("Record created"); 
        router.push(ROUTES.APP.PROFICIENCY_TESTING.ROOT) 
      })
      .catch(() => toast.error("Failed to create"))
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description of Testing Scope</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="provider1">PT Provider 1</Label>
              <Input id="provider1" value={provider1} onChange={(e) => setProvider1(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider2">PT Provider 2</Label>
              <Input id="provider2" value={provider2} onChange={(e) => setProvider2(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="lastTestDate">Last Test Date</Label>
              <Input id="lastTestDate" type="date" value={lastTestDate.toString()} onChange={(e) => setLastTestDate(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate.toString()} onChange={(e) => setDueDate(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nextScheduledDate">Next Scheduled Date</Label>
              <Input id="nextScheduledDate" type="date" value={nextScheduledDate.toString()} onChange={(e) => setNextScheduledDate(e.target.value)} disabled={readOnly} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Input 
                id="status" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                placeholder="Scheduled, In Progress, Completed, Cancelled, or Overdue" 
                disabled={readOnly} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={readOnly} />
            </div>
          </div>
        </CardContent>
      </Card>
      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{initial ? "Update Proficiency Testing" : "Save Proficiency Testing"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}


