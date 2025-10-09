"use client"

import { useRouter } from "next/navigation"
import { WelderForm } from "@/components/welders/welder-form"
import { Welder } from "@/components/welders/welder-form"
import { ROUTES } from "@/constants/routes"
import { welderService } from "@/services/welders.service"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"

export default function NewWelderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Welder) => {
    setLoading(true)
    try {
      const { id, ...welderData } = data
      await welderService.create(welderData)
      router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")
    } catch (error) {
      console.error("Failed to create welder:", error)
      // TODO: Show error message to user
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Add New Welder" description="Create a new welder record" label={null} href={ROUTES.APP.WELDERS.WELDERS} />


      {loading && (
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
