"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WelderQualificationForm, type WelderQualificationData } from "@/components/welders/welder-qualification-form"
import { ArrowLeft, Printer } from "lucide-react"
import QRCode from "qrcode"
import { ROUTES } from "@/constants/routes"
import { generatePdf } from "@/lib/pdf-utils"
import { BackButton } from "@/components/ui/back-button"

interface WelderQualificationPreviewProps {
  showButton?: boolean
  isPublic?: boolean
}

export default function WelderQualificationPreview({ 
  showButton = true, 
  isPublic = false 
}: WelderQualificationPreviewProps) {
  const params = useParams()
  const router = useRouter()
  const [welderData, setWelderData] = useState<WelderQualificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrSrc, setQrSrc] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the welder qualification data from your API
    // For now, we'll use mock data
    const fetchWelderData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - replace with actual API call
        const mockData: WelderQualificationData = {
          id: params.id as string,
          clientName: "Saudi Aramco",
          welderImage: null,
          welderName: "Ahmed Al-Rashid",
          wpsIdentification: "WPS-2024-001",
          iqamaId: "1234567890",
          qualificationStandard: "ASME SEC IX Ed(2023)",
          baseMetalSpec: "ASTM A36",
          weldType: "Butt Weld",
          welderIdNo: "WEL-001",
          jointType: "Butt Joint",
          dateOfTest: "2024-01-15",
          certificateRefNo: "WQ-2024-001",
          welderVariables: [
            { id: "1", name: "Welder Process(es)", actualValue: "SMAW", rangeQualified: "SMAW" },
            { id: "2", name: "Types of Welder (manual/semi auto)", actualValue: "Manual", rangeQualified: "Manual" },
            { id: "3", name: "Backing (With/without)", actualValue: "Without", rangeQualified: "Without" },
            { id: "4", name: "Types of weld", actualValue: "Butt Weld", rangeQualified: "Butt Weld" },
            { id: "5", name: "Product Types(Plate or Pipe)", actualValue: "Plate", rangeQualified: "Plate" },
            { id: "6", name: "Diameter of Pipe", actualValue: "N/A", rangeQualified: "N/A" },
            { id: "7", name: "Base Metal P Number to P Number", actualValue: "P1 to P1", rangeQualified: "P1 to P1" },
            { id: "8", name: "Filler Metal or electrode specification", actualValue: "E7018", rangeQualified: "E7018" },
            { id: "9", name: "Filler Meta F-Number(S)", actualValue: "F4", rangeQualified: "F4" },
            { id: "10", name: "Filer Metal addition/Deletion (GTAW/PAW)", actualValue: "N/A", rangeQualified: "N/A" },
            { id: "11", name: "Consumable Insert (GTAW or PAW)", actualValue: "N/A", rangeQualified: "N/A" },
            { id: "12", name: "Deposit thickness for each process", actualValue: "12mm", rangeQualified: "12mm" },
            { id: "13", name: "Welder position", actualValue: "1G", rangeQualified: "1G" },
            { id: "14", name: "Vertical Progression", actualValue: "Up", rangeQualified: "Up" },
            { id: "15", name: "Type of Fuel Gas(OFW)", actualValue: "N/A", rangeQualified: "N/A" },
            { id: "16", name: "Insert gas backing(GTAW,PAW,GMAW)", actualValue: "N/A", rangeQualified: "N/A" },
            { id: "17", name: "Transfer Mode( spary, globular, SHORT)", actualValue: "N/A", rangeQualified: "N/A" },
            { id: "18", name: "Current Type/Polarity(AC,DCEP,DCEN)", actualValue: "DCEP", rangeQualified: "DCEP" },
          ],
          testsConducted: [
            { id: "1", testType: "Visual Inspection", reportNo: "VI-2024-001", results: "ACC", isReportChecked: false },
            { id: "2", testType: "NDT", reportNo: "NDT-2024-001", results: "ACC", isReportChecked: false },
            { id: "3", testType: "Mechanical Test", reportNo: "MT-2024-001", results: "ACC", isReportChecked: false },
          ],
          certificationStatement: "ASME SEC IX Ed(2023)",
          testingWitnessed: "Mohammed Al-Sayed",
          testSupervisor: "Dr. Khalid Al-Zahrani",
        }
        
        setWelderData(mockData)
      } catch (error) {
        console.error("Error fetching welder qualification data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWelderData()
    }
  }, [params.id])

  // Send ready message for PDF generation
  useEffect(() => {
    if (welderData && !loading) {
      // Send message that the document is ready for printing
      if (typeof window !== "undefined") {
        window.parent.postMessage({
          type: 'DOCUMENT_READY',
          id: params.id
        }, '*');
      }
    }
  }, [welderData, loading, params.id]);

  // Generate QR code for public view
  useEffect(() => {
    if (isPublic && params.id) {
      const generateQR = async () => {
        try {
          const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_QUALIFICATION_PREVIEW(params.id as string)}`
          const dataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 120 })
          setQrSrc(dataUrl)
        } catch (error) {
          console.error("Failed to generate QR code:", error)
          setQrSrc(null)
        }
      }
      generateQR()
    }
  }, [isPublic, params.id])

  const handlePrint = async () => {
    if (!params.id) return;
    
    try {
      const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
      const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_QUALIFICATION_PREVIEW(params.id as string)}`
      
      const success = await generatePdf(publicUrl, params.id as string);
      if (success) {
        // The utility function will handle the print dialog
      } else {
        console.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  }

  const handleBack = () => {
    if (isPublic) {
      // For public pages, you might want to redirect to a different page
      router.push("/")
    } else {
      router.back()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading welder qualification certificate...</p>
        </div>
      </div>
    )
  }

  if (!welderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Not Found</h2>
          <p className="text-gray-600 mb-4">The welder qualification certificate you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-8 print:bg-white print:p-0">
      {/* Header */}
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

      {/* Certificate Content */}
      
          <WelderQualificationForm
            initialData={welderData}
            onSubmit={() => {}} // No-op for readonly mode
            onCancel={() => {}} // No-op for readonly mode
            readOnly={true}
          />
    </div>
  )
}
