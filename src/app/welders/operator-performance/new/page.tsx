"use client"

import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewOperatorPerformancePage() {
  const router = useRouter()

  const handleSubmit = (data: OperatorPerformanceData) => {
    // TODO: save to storage
    router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)
  }

  return (
    <div className="space-y-6">
      <FormHeader title="New Operator Performance Certificate" description="Create a new operator performance certificate" label={null} href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT}/>

      <OperatorPerformanceForm onSubmit={handleSubmit} onCancel={() => router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)} />
    </div>
  )
}

