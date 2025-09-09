"use client"

import { SampleDetailForm } from "@/components/sample-details/form"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function PageInner() {
  const params = useSearchParams()
  const jobId = params.get('jobId') || undefined
  const mode = params.get('mode')
  const editLots = mode === 'edit-lots' && jobId
  return (
    <div className="container mx-auto py-6">
      <SampleDetailForm editJobId={editLots ? jobId : undefined} />
    </div>
  )
}

export default function NewSampleDetailPage() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  )
}
