import TestReportPreview from "@/components/test-reports/view/test-report-preview"

export default function PublicTestReportPreviewPage() {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="mx-auto w-full max-w-screen">
        <TestReportPreview showButton={false} isPublic={true} />
      </div>
    </div>
  )
}


