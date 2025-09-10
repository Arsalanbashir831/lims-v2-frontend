"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SampleDetailForm } from "@/components/sample-details/form"
import { sampleInformationService } from "@/lib/sample-information"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditSampleDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, error } = useQuery({
    queryKey: ['complete-sample-information', id],
    queryFn: () => sampleInformationService.getCompleteSampleInformation(id),
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
            Failed to load sample details: {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (!data?.job?.job_id) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sample Details Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The requested sample details could not be found.
          </p>
        </div>
      </div>
    )
  }

  const initial = {
    job: data?.job || { job_id: "", project_name: "", client_name: "", end_user: "", receive_date: "", received_by: "", remarks: "" },
    lots: data?.lots || [],
  }

  return (
    <div className="container mx-auto py-6">
      <SampleDetailForm initial={initial} />
    </div>
  )
}
