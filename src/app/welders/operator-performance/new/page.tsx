"use client"

import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { useState } from "react"
import { toast } from "sonner"
import { useCreateOperatorCertificate } from "@/hooks/user-operator-certificates"
import { CreateOperatorCertificateData } from "@/services/operator-certificates.service"

export default function NewOperatorPerformancePage() {
  const router = useRouter()
  const createOperatorCertificate = useCreateOperatorCertificate()

  const handleSubmit = async (data: OperatorPerformanceData) => {
    try {
      // Map form data to API structure
      const apiData: CreateOperatorCertificateData = {
        welder_card_id: data.welderCardId || "",
        wps_followed_date: data.wpsFollowed || "",
        date_of_issue: data.dateOfIssued || "",
        date_of_welding: data.dateOfWelding || "",
        joint_weld_type: data.jointWeldType || "",
        base_metal_spec: data.baseMetalSpec || "",
        base_metal_p_no: data.baseMetalPNumber || "",
        filler_sfa_spec: data.fillerSpec || "",
        filler_class_aws: data.fillerClass || "",
        test_coupon_size: data.testCouponSize || "",
        positions: data.positions || "",
        testing_variables_and_qualification_limits_automatic: data.automaticWeldingEquipmentVariables.map(variable => ({
          name: variable.name,
          actual_values: variable.actualValue,
          range_values: variable.rangeQualified
        })),
        testing_variables_and_qualification_limits_machine: data.machineWeldingEquipmentVariables.map(variable => ({
          name: variable.name,
          actual_values: variable.actualValue,
          range_values: variable.rangeQualified
        })),
        tests: data.testsConducted.map(test => ({
          type: test.testType,
          test_performed: test.testPerformed,
          results: test.results,
          report_no: test.reportNo
        })),
        law_name: data.certificationStatement || "",
        tested_by: data.testSupervisor || "",
        witnessed_by: data.testingWitnessed || ""
      }
      
      // Create certificate via API
      const createdCertificate = await createOperatorCertificate.mutateAsync(apiData)
      
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

