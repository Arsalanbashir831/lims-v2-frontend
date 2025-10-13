"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { WelderQualificationForm } from "@/components/welders/welder-qualification-form"
import { BackButton } from "@/components/ui/back-button"
import { useCreateWelderCertificate } from "@/hooks/use-welder-certificates"
import { CreateWelderCertificateData } from "@/lib/schemas/welder"
import { toast } from "sonner"

export default function NewWelderQualificationPage() {
  const router = useRouter()
  const createWelderCertificate = useCreateWelderCertificate()

  const handleSubmit = async (data: CreateWelderCertificateData) => {
    try {
      await createWelderCertificate.mutateAsync(data)
      toast.success("Welder qualification certificate created successfully!")
      router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT)
    } catch (error) {
      console.error("Failed to create welder qualification certificate:", error)
      toast.error("Failed to create welder qualification certificate. Please try again.")
    }
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
