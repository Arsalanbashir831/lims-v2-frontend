"use client"

import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { toast } from "sonner"
import { useCreateOperatorCertificate } from "@/hooks/use-operator-certificates"
import { CreateOperatorCertificateData } from "@/services/welder-operator-certificates.service"

export default function NewOperatorPerformancePage() {
  const router = useRouter()
  const createOperatorCertificate = useCreateOperatorCertificate()

  const handleSubmit = async (data: CreateOperatorCertificateData) => {
    try {
      // Create certificate via API
      const createdCertificate = await createOperatorCertificate.mutateAsync(data)
      
      toast.success("Operator performance certificate created successfully")
      
      // Redirect to view page
      router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.VIEW(createdCertificate.id))
    } catch (error) {
      console.error('Failed to save operator performance certificate:', error)
      toast.error("Failed to save operator performance certificate")
    }
  }

  return (
    <div className="space-y-6">
      <FormHeader title="New Operator Performance Certificate" description="Create a new operator performance certificate" label={null} href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT}/>

      <OperatorPerformanceForm 
        onSubmit={handleSubmit} 
        onCancel={() => router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)} 
      />
    </div>
  )
}

