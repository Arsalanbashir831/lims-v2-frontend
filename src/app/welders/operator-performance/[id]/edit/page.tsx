"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { useOperatorCertificate, useUpdateOperatorCertificate } from "@/hooks/use-operator-certificates"
import { CreateOperatorCertificateData } from "@/services/welder-operator-certificates.service"
import { toast } from "sonner"

export default function EditOperatorPerformancePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch data from API
  const { data: apiData, isLoading, error } = useOperatorCertificate(params.id as string)
  const updateOperatorCertificate = useUpdateOperatorCertificate()

  // Transform API data to form data
  const formData: OperatorPerformanceData | undefined = apiData?.data ? {
    id: apiData.data.id,
    welderCardId: apiData.data.welder_card_id,
    operatorImage: apiData.data.welder_card_info?.welder_info?.profile_image || null,
    operatorName: apiData.data.welder_card_info?.welder_info?.operator_name || "",
    operatorIdNo: apiData.data.welder_card_info?.welder_info?.operator_id || "",
    wpsFollowed: apiData.data.wps_followed_date || "",
    jointWeldType: apiData.data.joint_weld_type || "",
    baseMetalSpec: apiData.data.base_metal_spec || "",
    fillerSpec: apiData.data.filler_sfa_spec || "",
    testCouponSize: apiData.data.test_coupon_size || "",
    certificateRefNo: apiData.data.welder_card_info?.card_no || "",
    iqamaId: apiData.data.welder_card_info?.welder_info?.iqama || "",
    dateOfIssued: apiData.data.date_of_issue || "",
    dateOfWelding: apiData.data.date_of_welding || "",
    baseMetalPNumber: apiData.data.base_metal_p_no || "",
    fillerClass: apiData.data.filler_class_aws || "",
    positions: apiData.data.positions || "",
    automaticWeldingEquipmentVariables: apiData.data.testing_variables_and_qualification_limits_automatic?.map((variable, index: number) => ({
      id: (index + 1).toString(),
      name: (variable.name as string) || "",
      actualValue: (variable.actual_values as string) || "",
      rangeQualified: (variable.range_values as string) || ""
    })) || [],
    machineWeldingEquipmentVariables: apiData.data.testing_variables_and_qualification_limits_machine?.map((variable, index: number) => ({
      id: (index + 11).toString(),
      name: (variable.name as string) || "",
      actualValue: (variable.actual_values as string) || "",
      rangeQualified: (variable.range_values as string) || ""
    })) || [],
    testsConducted: apiData.data.tests?.map((test, index: number) => ({
      id: (index + 1).toString(),
      testType: (test.type as string) || "",
      reportNo: (test.report_no as string) || "",
      results: (test.results as string) || "",
      testPerformed: (test.test_performed as boolean) || false
    })) || [],
    certificationStatement: apiData.data.law_name || "",
    testingWitnessed: apiData.data.witnessed_by || "",
    testSupervisor: apiData.data.tested_by || ""
  } : undefined

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
      
      // Update certificate via API
      await updateOperatorCertificate.mutateAsync({ id: params.id as string, data: apiData })
      
      toast.success("Operator performance certificate updated successfully")
      setIsEditing(false)
      router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)
    } catch (error) {
      console.error('Failed to update operator performance certificate:', error)
      toast.error("Failed to update operator performance certificate")
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    console.error('Failed to load operator performance certificate:', error)
    toast.error("Failed to load operator performance certificate")
    return <div className="min-h-screen flex items-center justify-center">Error loading certificate</div>
  }

  if (!formData) {
    return <div className="min-h-screen flex items-center justify-center">Certificate not found</div>
  }

  return (
    <div className="space-y-6">
     <FormHeader title="Edit Operator Performance Certificate" description="Edit the operator performance certificate" label={null} href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT}>
      {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <OperatorPerformanceForm
        initialData={formData}
        readOnly={!isEditing}
        onSubmit={handleSubmit}
        onCancel={() => router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)}
      />
    </div>
  )
}
