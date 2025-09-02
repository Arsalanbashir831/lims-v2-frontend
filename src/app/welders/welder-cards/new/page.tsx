"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { BackButton } from "@/components/ui/back-button"
import { WelderCardForm, type WelderCardData } from "@/components/welders/welder-card-form"

export default function NewWelderCardPage() {
  const router = useRouter()

  const handleSubmit = (data: WelderCardData) => {
    // TODO: Save to localStorage or API
    console.log('Submitting welder card data:', data)
    
    // For now, just navigate back to the list
    router.push(ROUTES.APP.WELDERS.WELDER_CARDS.ROOT)
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
