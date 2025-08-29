import PQRReportPreview from "@/components/pqr/view/pqr-preview"


export default function PublicPqrPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-screen">
        <PQRReportPreview showButton={false} isPublic={true} />
      </div>
    </div>
  )
}
