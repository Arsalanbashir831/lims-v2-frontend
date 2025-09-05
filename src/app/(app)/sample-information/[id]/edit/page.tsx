"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SampleInformationForm } from "@/components/sample-information/form"
import { sampleInformationService } from "@/lib/sample-information"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditSampleInformationPage() {
  const params = useParams()
  const id = params.id as string

  const { data: sampleInformation, isLoading, error } = useQuery({
    queryKey: ['sample-information', id],
    queryFn: () => sampleInformationService.getById(id),
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
            Failed to load sample information: {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (!sampleInformation) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sample Information Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The requested sample information could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <SampleInformationForm initial={sampleInformation} />
    </div>
  )
}
