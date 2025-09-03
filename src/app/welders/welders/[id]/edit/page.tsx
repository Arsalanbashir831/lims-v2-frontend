"use client"

import { useRouter, useParams } from "next/navigation"
import { WelderForm } from "@/components/welders/welder-form"
import { Welder } from "@/components/welders/welder-form"
import { ROUTES } from "@/constants/routes"
import { welderService } from "@/lib/welders"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, PencilIcon, XIcon } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"

export default function EditWelderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [welder, setWelder] = useState<Welder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Load welder data
  useEffect(() => {
    const loadWelder = async () => {
      try {
        const data = await welderService.getById(id)
        setWelder(data)
      } catch (error) {
        console.error("Failed to load welder:", error)
      } finally {
        setLoading(false)
      }
    }
    loadWelder()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Loading welder...</span>
        </div>
      </div>
    )
  }

  if (!welder) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Welder not found</h1>
        <p className="text-muted-foreground">The welder you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Welders
        </button>
      </div>
    )
  }

  const handleSubmit = async (data: Welder) => {
    setSaving(true)
    try {
      await welderService.update(id, data)
      router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")
    } catch (error) {
      console.error("Failed to update welder:", error)
      // TODO: Show error message to user
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(ROUTES.APP.WELDERS.WELDERS || "/welders/welders")
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Welder" description="Update welder information" label={null} href={ROUTES.APP.WELDERS.WELDERS}>
      {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
        </FormHeader>

      {saving && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            <span>Saving welder...</span>
          </div>
        </div>
      )}

      <WelderForm
        initialData={welder}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={!isEditing}
      />
    </div>
  )
}
