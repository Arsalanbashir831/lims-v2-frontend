"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import WelderQualificationPreview from "@/components/welders/view/welder-qualification-preview"

export default function PublicWelderQualificationPreviewPage() {
  const searchParams = useSearchParams()
  const isPrint = searchParams.get("print") === "1"

  useEffect(() => {
    if (isPrint && typeof window !== "undefined") {
      window.parent.postMessage({
        type: 'DOCUMENT_READY',
        id: window.location.pathname.split('/').pop()
      }, '*');
    }
  }, [isPrint]);

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="mx-auto w-full max-w-screen">
        <WelderQualificationPreview showButton={false} isPublic={true} />
      </div>
    </div>
  )
}