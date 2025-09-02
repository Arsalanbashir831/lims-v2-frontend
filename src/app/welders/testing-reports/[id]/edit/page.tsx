"use client"

import { Button } from "@/components/ui/button"
import { TestingReportForm, type TestingReportFormData } from "@/components/welders/testing-report-form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { PencilIcon, XIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

const mock: TestingReportFormData = {
  rows: [
    {
      welderId: "1",
      welderName: "John Doe",
      iqamaNumber: "1234567890",
      testCouponId: "1",
      dateOfInspection: "2021-01-01",
      weldingProcesses: "1",
      weldingType: "1",
      backing: "1",
      weldJointType: "1",
      thicknessProductType: "1",
      pipeDiameter: "1",
      baseMetalPNumber: "1",
      fillerMetalSpecSfa: "1",
      fillerMetalFNumber: "1",
      fillerMetalAdditionDeletion: "1",
      depositThicknessEachProcess: "1",
      weldingPositions: "1",
      verticalProgressions: "1",
      fuelGasTypeOfw: "1",
      inertGasBacking: "1",
      transferMode: "1",
      currentTypePolarity: "1",
      voltage: "1",
      current: "1",
      travelSpeed: "1",
      interPassTemperature: "1",
      preHeat: "1",
      postWeldHeatTreatment: "1",
      resultStatus: "1",
    },
    {
      welderId: "2",
      welderName: "John Doe",
      iqamaNumber: "1234567890",
      testCouponId: "2",
      dateOfInspection: "2021-01-01",
      weldingProcesses: "2",
      weldingType: "2",
      backing: "2",
      weldJointType: "2",
      thicknessProductType: "2",
      pipeDiameter: "2",
      baseMetalPNumber: "2",
      fillerMetalSpecSfa: "2",
      fillerMetalFNumber: "2",
      fillerMetalAdditionDeletion: "2",
      depositThicknessEachProcess: "2",
      weldingPositions: "2",
      verticalProgressions: "2",
      fuelGasTypeOfw: "2",
      inertGasBacking: "2",
      transferMode: "2",
      currentTypePolarity: "2",
      voltage: "2",
      current: "2",
      travelSpeed: "2",
      interPassTemperature: "2",
      preHeat: "2",
      postWeldHeatTreatment: "2",
      resultStatus: "2",
    }
  ],
  preparedBy: "John Doe",
  projectDetails: "Project Details",
  contractDetails: "Contract Details",
  client: "Client",
}

export default function EditTestingReportPage() {
  const { id } = useParams<{ id: string }>()
  const [isEditing, setIsEditing] = useState(false)
  const handleSubmit = (data: TestingReportFormData) => {
    // TODO: persist update
    console.log("Testing report updated", id, data)
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
      <TestingReportForm initialData={mock} onSubmit={handleSubmit} readOnly={!isEditing} />
    </div>
  )
}
