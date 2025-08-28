"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { TestReportForm, type TestReportFormData } from "@/components/test-reports/form"
import { getTestReport, updateTestReport } from "@/lib/test-reports"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"

export default function EditTestReportPage() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<TestReportFormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!id) return
    const rec = getTestReport(id)
    if (rec) setInitial(rec as any)
  }, [id])

  const handleSubmit = (data: TestReportFormData) => {
    if (!id) return
    updateTestReport(id, data)
    toast.success("Report updated")
    setIsEditing(false)
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Test Report</h1>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </div>
      {initial ? (
        <TestReportForm initialData={initial} onSubmit={handleSubmit} readOnly={!isEditing} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  )
}


