"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WelderCardForm, type WelderCardData } from "@/components/welders/welder-card-form"
import { Printer } from "lucide-react"
import QRCode from "qrcode"
import { ROUTES } from "@/constants/routes"
import { generatePdf } from "@/lib/pdf-utils"
import { BackButton } from "@/components/ui/back-button"

interface WelderCardPreviewProps {
  showButton?: boolean
  isPublic?: boolean
}

export default function WelderCardPreview({
  showButton = true,
  isPublic = false
}: WelderCardPreviewProps) {
  const params = useParams()
  const [welderCardData, setWelderCardData] = useState<WelderCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrSrc, setQrSrc] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the welder qualification data from your API
    // For now, we'll use mock data
    const fetchWelderCardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock data - replace with actual API call
        const mockData: WelderCardData = {
          id: "1",
          company: "GULF HEAVY INDUSTRIES COMPANY",
          welderImage: null,
          welderName: "NASIR MAHMOOD",
          wpsNo: "GHI-259-01 Rev.00",
          iqamaId: "2542297615",
          welderId: "ASME SEC IX(2023)",
          cardNo: "SA-516 Gr.70NN to SA-334 Gr.6",
          process: "GROOVE + SEAL WELD",
          jointType: "W-533",
          verticalProgression: "UPHILL",
          testPosition: "SP(5F)",
          positionQualified: "Seal Weld(Fillet)-All",
          testThickness: "2.11 mm",
          testDia: "19.05mm (OD)",
          thicknessQualified: "Upto 4.22 mm",
          pNoQualified: "P-No.1 through P-No.15F, P-No.34, and P-No.41 through P-No.49",
          diameterQualified: "-",
          fNoQualified: "All F No.6",
          fillerMetalElectrodeClassUsed: "ER70S-3",
          placeOfIssue: "DAMMAM,KSA",
          testMethod: "Mechanical Test & Penetrant Test",
          dateOfTest: "2025-08-18",
          dateOfExp: "2026-02-17",
          authorisedBy: "MUHAMMED IRSHAD ALI",
          weldingInspector: "MOHAMMED INAYAT",
          certificationStatement: "ASME SEC IX Ed(2023).",
        }

        setWelderCardData(mockData)
      } catch (error) {
        console.error("Error fetching welder card data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWelderCardData()
    }
  }, [params.id])

  // Send ready message for PDF generation
  useEffect(() => {
    if (welderCardData && !loading) {
      // Send message that the document is ready for printing
      if (typeof window !== "undefined") {
        window.parent.postMessage({
          type: 'DOCUMENT_READY',
          id: params.id
        }, '*');
      }
    }
  }, [welderCardData, loading, params.id]);

  // Generate QR code for public view
  useEffect(() => {
    if (isPublic && params.id) {
      const generateQR = async () => {
        try {
          const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_CARDS_PREVIEW(params.id as string)}`
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
      const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_CARDS_PREVIEW(params.id as string)}`

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading welder card...</p>
        </div>
      </div>
    )
  }

  if (!welderCardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Card Not Found</h2>
          <p className="text-gray-600 mb-4">The welder card you're looking for doesn't exist.</p>
          <BackButton label='Go Back' />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-8 print:bg-white print:p-0">
      {/* Header */}
      {showButton && (
        <div className="mb-6 flex items-center justify-between">
          <BackButton />

          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      )}

      {/* Certificate Content */}

      <WelderCardForm
        initialData={welderCardData}
        onSubmit={() => { }} // No-op for readonly mode
        onCancel={() => { }} // No-op for readonly mode
        readOnly={true}
      />
    </div>
  )
}
