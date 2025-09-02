import WelderCardPreview from "@/components/welders/view/welder-card-preview"

export default function PublicWelderCardPreviewPage() {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="mx-auto w-full max-w-screen">
        <WelderCardPreview showButton={false} isPublic={true} />
      </div>
    </div>
  )
}
