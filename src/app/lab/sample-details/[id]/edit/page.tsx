"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SampleDetailForm } from "@/components/sample-details/form"
import { sampleLotService } from "@/services/sample-lots.service"
import { Skeleton } from "@/components/ui/skeleton"
import { SampleLotApiResponse, TestMethod } from "@/types/sample-lots"

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
      client_id: "", // Not available in API response
      project_name: data?.job_info?.project_name || "",
      client_name: data?.job_info?.client_name || "",
      end_user: "", // Not available in API response
      receive_date: "", // Not available in API response
      received_by: "", // Not available in API response
      remarks: "", // Not available in API response
      is_active: true,
      created_at: "", // Not available in API response
      updated_at: "", // Not available in API response
      sample_lots_count: data?.total || 0,
    },
    lots: (data?.data || []).map((lot) => {
      const apiLot = lot as unknown as SampleLotApiResponse
      return {
        ...lot,
        job_id: data?.job_info?.job_id || "",
        test_method_oids: apiLot.test_methods?.map((tm: TestMethod) => tm.id) || [],
      }
    }),
  }

  return (
    <div className="container mx-auto py-6">
      <SampleDetailForm initial={initial} />
    </div>
  )
}
