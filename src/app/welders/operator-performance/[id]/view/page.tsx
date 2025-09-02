"use client"

import OperatorPerformancePreview from "@/components/welders/view/operator-performance-preview"

interface ViewOperatorPerformancePageProps {
  params: { id: string }
}

export default function ViewOperatorPerformancePage({ params }: ViewOperatorPerformancePageProps) {
  return <OperatorPerformancePreview showButton isPublic={false} />
}
