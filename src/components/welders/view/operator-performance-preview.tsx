"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { OperatorPerformanceForm, type OperatorPerformanceData } from "@/components/welders/operator-performance-form"
import { ArrowLeft, Printer } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { generatePdf } from "@/lib/pdf-utils"
import { BackButton } from "@/components/ui/back-button"

interface OperatorPerformancePreviewProps {
  showButton?: boolean
  isPublic?: boolean
}

export default function OperatorPerformancePreview({ showButton = true, isPublic = false }: OperatorPerformancePreviewProps) {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<OperatorPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((r) => setTimeout(r, 300))
        const mock: OperatorPerformanceData = {
          id: params.id as string,
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
        setData(mock)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchData()
  }, [params.id])

  // Send ready message for PDF generation
  useEffect(() => {
    if (data && !loading) {
      if (typeof window !== "undefined") {
        window.parent.postMessage({ type: 'DOCUMENT_READY', id: params.id }, '*')
      }
    }
  }, [data, loading, params.id])

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Not found</div>
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
