"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { ArrowLeft, Printer } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { generatePdf } from "@/lib/pdf-utils"
import { BackButton } from "@/components/ui/back-button"
import { useOperatorCertificate } from "@/hooks/use-operator-certificates"
import { toast } from "sonner"

interface OperatorPerformancePreviewProps {
  showButton?: boolean
  isPublic?: boolean
}

export default function OperatorPerformancePreview({ showButton = true, isPublic = false }: OperatorPerformancePreviewProps) {
  const params = useParams()
  const router = useRouter()
  
  // Use API hook to fetch data
  const { data: apiData, isLoading, error } = useOperatorCertificate(params.id as string)
  
  // Debug: Log the API response to see the structure
  
  // Transform API data to form data
  const data = apiData?.data ? {
    id: apiData.data.id,
    operatorImage: (() => {
      const imagePath = apiData.data.welder_card_info?.welder_info?.profile_image
      return imagePath || null
    })(),
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
    automaticWeldingEquipmentVariables: apiData.data.testing_variables_and_qualification_limits_automatic?.map((variable: any, index: number) => ({
      id: (index + 1).toString(),
      name: (variable.name as string) || "",
      actualValue: (variable.actual_values as string) || "",
      rangeQualified: (variable.range_values as string) || ""
    })) || [],
    machineWeldingEquipmentVariables: apiData.data.testing_variables_and_qualification_limits_machine?.map((variable: any, index: number) => ({
      id: (index + 11).toString(),
      name: (variable.name as string) || "",
      actualValue: (variable.actual_values as string) || "",
      rangeQualified: (variable.range_values as string) || ""
    })) || [],
    testsConducted: apiData.data.tests?.map((test: any, index: number) => ({
      id: (index + 1).toString(),
      testType: (test.type as string) || "",
      reportNo: (test.report_no as string) || "",
      results: (test.results as string) || "",
      testPerformed: (test.test_performed as boolean) || false
    })) || [],
    certificationStatement: apiData.data.law_name || "",
    testingWitnessed: apiData.data.witnessed_by || "",
    testSupervisor: apiData.data.tested_by || ""
  } : null

  // Debug: Log the transformed data being passed to the form

  // Send ready message for PDF generation
  useEffect(() => {
    if (data && !isLoading) {
      if (typeof window !== "undefined") {
        window.parent.postMessage({ type: 'DOCUMENT_READY', id: params.id }, '*')
      }
    }
  }, [data, isLoading, params.id])

  const handlePrint = async () => {
    if (!params.id) return
    const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
    const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_OPERATOR_PERFORMANCE_PREVIEW(params.id as string)}`
    await generatePdf(publicUrl, params.id as string)
  }

  const handleBack = () => {
    if (isPublic) {
      router.push("/")
    } else {
      router.back()
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

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Certificate not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-8 print:bg-white print:p-0">
      {showButton && (
        <div className="mb-6 flex items-center justify-between">
         <BackButton onBack={handleBack} />
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      )}

      <OperatorPerformanceForm initialData={data} onSubmit={() => {}} onCancel={() => {}} readOnly />
    </div>
  )
}
