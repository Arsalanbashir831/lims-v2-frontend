"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { WelderQualificationForm } from "@/components/welders/welder-qualification-form"
import { FormHeader } from "@/components/common/form-header"
import { useWelderCertificate, useUpdateWelderCertificate } from "@/hooks/use-welder-certificates"
import { UpdateWelderCertificateData } from "@/lib/schemas/welder"
import { toast } from "sonner"

export default function EditWelderQualificationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  // Use React Query hooks
  const { data: welderCertificateResponse, isLoading, error } = useWelderCertificate(params.id)
  const welderCertificate = welderCertificateResponse?.data
  const updateWelderCertificate = useUpdateWelderCertificate()

  const handleSubmit = async (formData: UpdateWelderCertificateData) => {
    try {
      await updateWelderCertificate.mutateAsync({ id: params.id, data: formData })
      toast.success("Welder qualification certificate updated successfully!")
      setIsEditing(false)
      router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)
    } catch (error) {
      console.error("Failed to update welder qualification certificate:", error)
      toast.error("Failed to update welder qualification certificate. Please try again.")
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Loading welder qualification certificate...</span>
        </div>
      </div>
    )
  }

  if (error || !welderCertificate) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Welder qualification certificate not found</h1>
        <p className="text-muted-foreground">The welder qualification certificate you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Welder Qualification Certificates
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FormHeader title="Edit Welder Qualification Certificate" description="Edit the welder qualification certificate" label={null} href={ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <WelderQualificationForm
        initialData={welderCertificate}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing}
      />
    </div>
  )
}
