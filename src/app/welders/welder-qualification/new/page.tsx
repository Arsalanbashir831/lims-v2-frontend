"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { WelderQualificationForm, type WelderQualificationData } from "@/components/welders/welder-qualification-form"
import { BackButton } from "@/components/ui/back-button"

export default function NewWelderQualificationPage() {
  const router = useRouter()

  const handleSubmit = (data: WelderQualificationData) => {
    // TODO: Save to localStorage or API
    console.log('Submitting welder qualification data:', data)
    
    // For now, just navigate back to the list
    router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)
  }

  const handleCancel = () => {
    router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton size="icon" label={null} href={ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Welder Qualification Certificate</h1>
          <p className="text-muted-foreground">
            Create a new welder qualification certificate
          </p>
        </div>
      </div>

      <WelderQualificationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
