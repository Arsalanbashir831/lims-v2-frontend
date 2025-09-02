import OperatorPerformancePreview from "@/components/welders/view/operator-performance-preview"

export default function PublicOperatorPerformancePreviewPage() {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="mx-auto w-full max-w-screen">
        <OperatorPerformancePreview showButton={false} isPublic={true} />
      </div>
    </div>
  )
}
