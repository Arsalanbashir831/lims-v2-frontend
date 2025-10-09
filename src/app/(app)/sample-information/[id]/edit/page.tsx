"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SampleInformationForm } from "@/components/sample-information/form"
import { sampleInformationService } from "@/services/sample-information.service"
import { Skeleton } from "@/components/ui/skeleton"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { useState } from "react"

export default function EditSampleInformationPage() {
  const params = useParams()
  const id = params.id as string
  const [isEditing, setIsEditing] = useState(false)

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
    <div className="grid gap-4">
      <FormHeader title="Edit Sample Information" description="Edit the sample information details" label={null} href={ROUTES.APP.SAMPLE_INFORMATION.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <SampleInformationForm initial={sampleInformation} readOnly={!isEditing} />
    </div>
  )
}
