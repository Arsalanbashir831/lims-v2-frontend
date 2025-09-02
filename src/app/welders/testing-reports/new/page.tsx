"use client"

import { TestingReportForm, type TestingReportFormData } from "@/components/welders/testing-report-form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewTestingReportPage() {
  const handleSubmit = (data: TestingReportFormData) => {
    // TODO: persist data when backend/storage is ready
    console.debug("Testing report saved", data)
  }

  return (
    <div className="space-y-6">
      <FormHeader title="New Testing Report" description="Create a new welder testing report" label={null} href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT} />
      <TestingReportForm onSubmit={handleSubmit} />
    </div>
  )
}
