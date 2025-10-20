"use client"

import WelderQualificationPreview from "@/components/welders/view/welder-qualification-preview"

export default function PublicWelderQualificationPreviewPage() {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="mx-auto w-full max-w-screen">
        <WelderQualificationPreview showButton={false} isPublic={true} />
      </div>
    </div>
  )
}