"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SampleDetailForm } from "@/components/sample-details/form"
import { sampleDetailService } from "@/lib/sample-details"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditSampleDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: sampleDetail, isLoading, error } = useQuery({
    queryKey: ['sample-details', id],
    queryFn: () => sampleDetailService.getById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground mt-2">
            Failed to load sample detail: {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (!sampleDetail) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sample Detail Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The requested sample detail could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <SampleDetailForm initial={sampleDetail} />
    </div>
  )
}
