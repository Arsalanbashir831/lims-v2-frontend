"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WelderQualificationForm } from "@/components/welders/welder-qualification-form"
import { Printer } from "lucide-react"
import QRCode from "qrcode"
import { ROUTES } from "@/constants/routes"
import { BackButton } from "@/components/ui/back-button"
import { useWelderCertificate } from "@/hooks/use-welder-certificates"

interface WelderQualificationPreviewProps {
  showButton?: boolean
  isPublic?: boolean
}

export default function WelderQualificationPreview({ 
  showButton = true, 
  isPublic = false 
}: WelderQualificationPreviewProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const isPrint = searchParams.get("print") === "1"
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Use React Query hook to fetch welder certificate data
  const { data: welderCertificateResponse, isLoading, error } = useWelderCertificate(id)
  const welderCertificate = welderCertificateResponse?.data

  // Send ready message for PDF generation when in print mode
  useEffect(() => {
    if (isPrint && welderCertificate && !isLoading) {
      // If there's no image or image is already loaded, send ready message immediately
      if (!welderCertificate.welder_card_info?.welder_info?.profile_image || imageLoaded) {
        if (typeof window !== "undefined") {
          window.parent.postMessage({
            type: 'DOCUMENT_READY',
            id: id
          }, '*');
        }
      }
    }
  }, [isPrint, welderCertificate, isLoading, imageLoaded, id]);

  // Fallback timeout to ensure message is sent even if image doesn't load
  useEffect(() => {
    if (isPrint && welderCertificate && !isLoading) {
      const timeout = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.parent.postMessage({
          type: 'DOCUMENT_READY',
            id: id
        }, '*');
      }
      }, 3000); // 3 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isPrint, welderCertificate, isLoading, id]);

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
    if (!id) return;
    try {
      const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
      const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_QUALIFICATION_PREVIEW(id)}`

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
          <p className="mt-4 text-lg">Loading welder qualification certificate...</p>
        </div>
      </div>
    )
  }

  if (error || !welderCertificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Not Found</h2>
          <p className="text-gray-600 mb-4">The welder qualification certificate you're looking for doesn't exist.</p>
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
          <WelderQualificationForm
        initialData={welderCertificate}
        onSubmit={() => { }} // No-op for readonly mode
        onCancel={() => { }} // No-op for readonly mode
            readOnly={true}
        onImageLoad={() => setImageLoaded(true)}
          />
    </div>
  )
}
