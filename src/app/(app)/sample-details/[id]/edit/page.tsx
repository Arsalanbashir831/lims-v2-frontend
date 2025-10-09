"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SampleDetailForm } from "@/components/sample-details/form"
import { sampleLotService } from "@/services/sample-lots.service"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditSampleDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, error } = useQuery({
    queryKey: ['sample-lots-by-job', id],
    queryFn: () => sampleLotService.getByJobDocumentId(id),
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

  if (!data?.job_info?.job_id) {
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
    job: {
      id: id, // Use the document ID
      job_id: data?.job_info?.job_id || "",
      client_id: data?.job_info?.client_id || "",
      project_name: data?.job_info?.project_name || "",
      client_name: data?.job_info?.client_name || "",
      end_user: data?.job_info?.end_user || "",
      receive_date: data?.job_info?.receive_date || "",
      received_by: data?.job_info?.received_by || "",
      remarks: data?.job_info?.remarks || "",
      is_active: true,
      created_at: data?.job_info?.created_at || "",
      updated_at: data?.job_info?.updated_at || "",
      sample_lots_count: data?.total || 0,
    },
    lots: data?.data || [],
  }

  return (
    <div className="container mx-auto py-6">
      <SampleDetailForm initial={initial} />
    </div>
  )
}
