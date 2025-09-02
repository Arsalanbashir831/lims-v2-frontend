"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TestReportForm, type TestReportFormData } from "@/components/test-reports/form"
import { createTestReport } from "@/lib/test-reports"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewTestReportPage() {
  const router = useRouter()

  const handleSubmit = (data: TestReportFormData) => {
    createTestReport(data)
    toast.success("Report saved")
    router.push(ROUTES.APP.TEST_REPORTS.ROOT)
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="New Test Report" description="Create a new test report." label={null} href={ROUTES.APP.TEST_REPORTS.ROOT}/> 
      <TestReportForm onSubmit={handleSubmit} />
    </div>
  )
}


