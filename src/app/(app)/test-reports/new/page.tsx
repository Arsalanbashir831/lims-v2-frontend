"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TestReportForm, type TestReportFormData } from "@/components/test-reports/form"
import { createTestReport } from "@/lib/test-reports"

export default function NewTestReportPage() {
  const router = useRouter()

  const handleSubmit = (data: TestReportFormData) => {
    createTestReport(data)
    toast.success("Report saved")
    router.push("/test-reports")
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">New Test Report</h1>
      <TestReportForm onSubmit={handleSubmit} />
    </div>
  )
}


