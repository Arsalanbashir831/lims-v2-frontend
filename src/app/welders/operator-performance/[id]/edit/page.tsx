"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"

interface EditOperatorPerformancePageProps {
  params: { id: string }
}

export default function EditOperatorPerformancePage({ params }: EditOperatorPerformancePageProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const mock: OperatorPerformanceData = {
    id: params.id,
    operatorImage: null,
    operatorName: "Sarah Johnson",
    operatorIdNo: "OP-2024-002",
    wpsFollowed: "WPS-OP-2024-002",
    jointWeldType: "Butt Weld",
    baseMetalSpec: "ASTM A36",
    fillerSpec: "SFA-5.18 ER70S-6",
    testCouponSize: "150 x 75 x 10 mm",
    certificateRefNo: "OPQ-2024-002",
    iqamaId: "2233445566",
    dateOfIssued: "2024-03-10",
    dateOfWelding: "2024-03-08",
    baseMetalPNumber: "P1",
    fillerClass: "E7018",
    positions: "2G / 3G",
    automaticWeldingEquipmentVariables: [
      { id: "1", name: "Type of Welding (Automatic)", actualValue: "GMAW", rangeQualified: "GMAW" },
      { id: "2", name: "Welding Process", actualValue: "Short Circuit", rangeQualified: "Short / Spray" },
      { id: "3", name: "Filler Metal Used (EBW/LBW)", actualValue: "N/A", rangeQualified: "N/A" },
      { id: "4", name: "Type of Laser (LBW)", actualValue: "N/A", rangeQualified: "N/A" },
      { id: "5", name: "Continuous Drive / Inertia (FW)", actualValue: "N/A", rangeQualified: "N/A" },
      { id: "6", name: "Vacuum / Out of Vacuum (EBW)", actualValue: "N/A", rangeQualified: "N/A" },
    ],
    machineWeldingEquipmentVariables: [
      { id: "1", name: "Type of Welding (Machine)", actualValue: "GTAW", rangeQualified: "GTAW" },
      { id: "2", name: "Welding Process", actualValue: "Pulsed GTAW", rangeQualified: "Pulsed / Constant" },
      { id: "3", name: "Direct or Remote Visual Control", actualValue: "Direct", rangeQualified: "Direct/Remote" },
      { id: "4", name: "Automatic Arc Voltage Control (GTAW)", actualValue: "Enabled", rangeQualified: "Enabled/Disabled" },
      { id: "5", name: "Automatic Joint Tracking", actualValue: "Enabled", rangeQualified: "Enabled/Disabled" },
      { id: "6", name: "Position(s)", actualValue: "2G", rangeQualified: "2G/3G" },
      { id: "7", name: "Base Material Thickness", actualValue: "10 mm", rangeQualified: "6–16 mm" },
      { id: "8", name: "Consumable Insert (GTAW/PAW)", actualValue: "No", rangeQualified: "With/Without" },
      { id: "9", name: "Backing (With or Without)", actualValue: "Without", rangeQualified: "With/Without" },
      { id: "10", name: "Single/Multiple Passes Per Side", actualValue: "Multiple", rangeQualified: "Single/Multiple" },
    ],
    testsConducted: [
      { id: "1", testType: "Visual Inspection", reportNo: "VI-2024-051", results: "ACCEPTED", testPerformed: true },
      { id: "2", testType: "Liquid Penetrant Examination (PT)", reportNo: "PT-2024-017", results: "ACCEPTED", testPerformed: true },
      { id: "3", testType: "Ultrasonic Testing (UT)", reportNo: "UT-2024-009", results: "ACCEPTED", testPerformed: false },
      { id: "4", testType: "Bend Test", reportNo: "BT-2024-004", results: "ACCEPTED", testPerformed: true },
    ],
    certificationStatement: "ASME SEC IX Ed(2023)",
    testingWitnessed: "Inspector X",
    testSupervisor: "Manager Y",
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
        initialData={mock}
        readOnly={!isEditing}
        onSubmit={(data) => router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)}
        onCancel={() => router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT)}
      />
    </div>
  )
}
