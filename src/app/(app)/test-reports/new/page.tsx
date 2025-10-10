"use client"

import { useRouter } from "next/navigation"
import { TestReportForm } from "@/components/test-reports/test-report-form"
import { FormHeader } from "@/components/common/form-header"
import { ROUTES } from "@/constants/routes"

export default function NewTestReportPage() {
  const router = useRouter()

  const handleSubmit = () => {
    // Form handles its own submission and navigation
    router.push(ROUTES.APP.TEST_REPORTS.ROOT)
  }

  return (
    <div className="space-y-6">
      <FormHeader 
        title="New Test Report" 
        description="Create a new test report certificate." 
        label={null} 
        href={ROUTES.APP.TEST_REPORTS.ROOT}
      /> 
      <TestReportForm onSubmit={handleSubmit} />
    </div>
  )
}