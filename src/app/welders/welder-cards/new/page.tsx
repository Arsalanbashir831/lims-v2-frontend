"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { BackButton } from "@/components/ui/back-button"
import { WelderCardForm } from "@/components/welders/welder-card-form"
import { useCreateWelderCard } from "@/hooks/use-welder-cards"
import { toast } from "sonner"

export default function NewWelderCardPage() {
  const router = useRouter()
  const createWelderCard = useCreateWelderCard()

  const handleSubmit = async (data: {
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
      await createWelderCard.mutateAsync(data)
      toast.success("Welder card created successfully!")
      router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)
    } catch (error) {
      console.error("Failed to create welder card:", error)
      toast.error("Failed to create welder card. Please try again.")
    }
  }

  const handleCancel = () => {
    router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton size="icon" label={null} href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Welder Card</h1>
          <p className="text-muted-foreground">
            Create a new welder card
          </p>
        </div>
      </div>

      <WelderCardForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
