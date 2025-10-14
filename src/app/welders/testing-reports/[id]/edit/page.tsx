"use client"

import { Button } from "@/components/ui/button"
import { TestingReportForm, type TestingReportFormData } from "@/components/welders/testing-report-form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { PencilIcon, XIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useWelderTestReport } from "@/hooks/use-welder-test-reports"
import { toast } from "sonner"


export default function EditTestingReportPage() {
  const { id } = useParams<{ id: string }>()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<TestingReportFormData | null>(null)
  
  // Fetch the testing report data
  const { data: apiData, isLoading, error } = useWelderTestReport(id || "")
  
  // Transform API data to form data
  useEffect(() => {
    if (apiData?.data) {
      const batchReport = apiData.data as {
        results?: Array<{
          welder_id?: string
          welder_name?: string
          iqama_number?: string
          test_coupon_id?: string
          date_of_inspection?: string
          welding_processes?: string
          type_of_welding?: string
          backing?: string
          type_of_weld_joint?: string
          thickness_product_type?: string
          diameter_of_pipe?: string
          base_metal_p_number?: string
          filler_metal_electrode_spec?: string
          filler_metal_f_number?: string
          filler_metal_addition_deletion?: string
          deposit_thickness_for_each_process?: string
          welding_positions?: string
          vertical_progression?: string
          type_of_fuel_gas?: string
          inert_gas_backing?: string
          transfer_mode?: string
          current_type_polarity?: string
          voltage?: string
          current?: string
          travel_speed?: string
          interpass_temperature?: string
          pre_heat?: string
          post_weld_heat_treatment?: string
          result_status?: string
        }>
        prepared_by?: string
        client_name?: string
        project_details?: string
        contract_details?: string
      }
      
      // Transform the batch report data to form format
      const transformedData: TestingReportFormData = {
        rows: batchReport.results?.map((welder) => ({
          welderId: welder.welder_id || "",
          welderName: welder.welder_name || "",
          iqamaNumber: welder.iqama_number || "",
          testCouponId: welder.test_coupon_id || "",
          dateOfInspection: welder.date_of_inspection || "",
          weldingProcesses: welder.welding_processes || "",
          weldingType: welder.type_of_welding || "",
          backing: welder.backing || "",
          weldJointType: welder.type_of_weld_joint || "",
          thicknessProductType: welder.thickness_product_type || "",
          pipeDiameter: welder.diameter_of_pipe || "",
          baseMetalPNumber: welder.base_metal_p_number || "",
          fillerMetalSpecSfa: welder.filler_metal_electrode_spec || "",
          fillerMetalFNumber: welder.filler_metal_f_number || "",
          fillerMetalAdditionDeletion: welder.filler_metal_addition_deletion || "",
          depositThicknessEachProcess: welder.deposit_thickness_for_each_process || "",
          weldingPositions: welder.welding_positions || "",
          verticalProgressions: welder.vertical_progression || "",
          fuelGasTypeOfw: welder.type_of_fuel_gas || "",
          inertGasBacking: welder.inert_gas_backing || "",
          transferMode: welder.transfer_mode || "",
          currentTypePolarity: welder.current_type_polarity || "",
          voltage: welder.voltage || "",
          current: welder.current || "",
          travelSpeed: welder.travel_speed || "",
          interPassTemperature: welder.interpass_temperature || "",
          preHeat: welder.pre_heat || "",
          postWeldHeatTreatment: welder.post_weld_heat_treatment || "",
          resultStatus: welder.result_status || "",
        })) || [],
        preparedBy: batchReport.prepared_by || "",
        projectDetails: batchReport.project_details || "",
        contractDetails: batchReport.contract_details || "",
        client: batchReport.client_name || "",
      }
      
      setFormData(transformedData)
    }
  }, [apiData])
  
  const handleSubmit = (data: TestingReportFormData) => {
    // Form handles submission and navigation internally
    // This is just a placeholder for the onSubmit prop
  }
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading testing report...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Failed to load testing report</p>
          <p className="text-sm text-muted-foreground mt-1">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  // Handle no data
  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No testing report data found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FormHeader title="Edit Testing Report" description="Update the testing report details" label={null} href={ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <TestingReportForm 
        initialData={formData} 
        onSubmit={handleSubmit} 
        readOnly={!isEditing}
        isEditing={isEditing}
        editId={id}
      />
    </div>
  )
}
