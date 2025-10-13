"use client"

import { useRouter } from "next/navigation"
import { WelderForm } from "@/components/welders/welder-form"
import { ROUTES } from "@/constants/routes"
import { useCreateWelder } from "@/hooks/use-welders"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"
import { toast } from "sonner"

export default function NewWelderPage() {
  const router = useRouter()
  const createWelder = useCreateWelder()

  const handleSubmit = async (data: {
    operator_name: string
    operator_id: string
    iqama: string
    profile_image?: File
  }) => {
    try {
      await createWelder.mutateAsync(data)
      toast.success("Welder created successfully!")
      router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")
    } catch (error) {
      console.error("Failed to create welder:", error)
      toast.error("Failed to create welder. Please try again.")
    }
  }

  const handleCancel = () => {
    router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Add New Welder" description="Create a new welder record" label={null} href={ROUTES.APP.WELDERS.WELDERS} />


      {createWelder.isPending && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            <span>Creating welder...</span>
          </div>
        </div>
      )}

      <WelderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
