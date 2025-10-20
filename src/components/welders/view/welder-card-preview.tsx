"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WelderCardForm } from "@/components/welders/welder-card-form"
import { Printer } from "lucide-react"
import QRCode from "qrcode"
import { ROUTES } from "@/constants/routes"
import { BackButton } from "@/components/ui/back-button"
import { useWelderCard } from "@/hooks/use-welder-cards"

interface WelderCardPreviewProps {
  showButton?: boolean
  isPublic?: boolean
}

export default function WelderCardPreview({
  showButton = true,
  isPublic = false
}: WelderCardPreviewProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const isPrint = searchParams.get("print") === "1"
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  
  // Use React Query hook to fetch welder card data
  const { data: welderCard, isLoading, error } = useWelderCard(id)

  // Send ready message for PDF generation when in print mode (after images load)
  useEffect(() => {
    const run = async () => {
      if (!(isPrint && welderCard && !isLoading)) return
      // small layout settle delay since images are eager-loaded now
      await new Promise(r => setTimeout(r, 100))
      if (typeof window !== "undefined") {
        window.parent.postMessage({ type: 'DOCUMENT_READY', id }, '*')
      }
    }
    run()
  }, [isPrint, welderCard, isLoading, id])

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
    if (!id) return;
    try {
      const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
      const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_CARDS_PREVIEW(id)}`
      
      const url = new URL(publicUrl);
      url.searchParams.set("print", "1");
      const printUrl = url.toString();

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");

      let printed = false;
      const cleanup = () => {
        try {
          window.removeEventListener("message", onMessage as any);
        } catch {}
        try {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        } catch {}
      };

      const tryPrint = () => {
        if (printed) return;
        printed = true;
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {}
        setTimeout(cleanup, 500);
      };

      const onMessage = (event: MessageEvent) => {
        try {
          const dataMsg = event.data as any;
          if (dataMsg && dataMsg.type === "DOCUMENT_READY" && dataMsg.id === id) {
            tryPrint();
          }
        } catch {}
      };

      window.addEventListener("message", onMessage as any);

      const fallbackTimer = setTimeout(() => {
        tryPrint();
      }, 5000);

      iframe.onload = () => {
        clearTimeout(fallbackTimer);
      };

      iframe.src = printUrl;
      document.body.appendChild(iframe);
    } catch (e) {
      // no-op
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading welder card...</p>
        </div>
      </div>
    )
  }

  if (error || !welderCard) {
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
        initialData={welderCard}
        onSubmit={() => { }} // No-op for readonly mode
        onCancel={() => { }} // No-op for readonly mode
        readOnly={true}
        forceEagerImages={isPrint}
      />
    </div>
  )
}
