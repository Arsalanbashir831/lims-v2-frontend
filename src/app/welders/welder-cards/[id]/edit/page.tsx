"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { WelderCardForm } from "@/components/welders/welder-card-form"
import { useWelderCard, useUpdateWelderCard } from "@/hooks/use-welder-cards"
import { toast } from "sonner"




export default function EditWelderCardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  // Use React Query hooks
  const { data: welderCard, isLoading, error } = useWelderCard(params.id)
  const updateWelderCard = useUpdateWelderCard()

  const handleSubmit = async (formData: {
    id?: string
    company: string
    welder_id: string
    authorized_by: string
    welding_inspector: string
    law_name: string
    card_no: string
    attributes: Record<string, any>
  }) => {
    try {
      await updateWelderCard.mutateAsync({ id: params.id, data: formData })
      toast.success("Welder card updated successfully!")
      router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)
    } catch (error) {
      console.error("Failed to update welder card:", error)
      toast.error("Failed to update welder card. Please try again.")
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Loading welder card...</span>
        </div>
      </div>
    )
  }

  if (error || !welderCard) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Welder card not found</h1>
        <p className="text-muted-foreground">The welder card you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Welder Cards
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FormHeader title="Edit Welder Card" description="Edit the welder card" label={null} href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <WelderCardForm
        initialData={welderCard}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing}
      />
    </div>
  )
}
