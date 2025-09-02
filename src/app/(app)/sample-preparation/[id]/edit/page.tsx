"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { getSamplePreparation, updateSamplePreparation } from "@/lib/sample-preparation"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"
import { ROUTES } from "@/constants/routes"

export default function EditSamplePreparationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [initial, setInitial] = useState<SamplePreparationFormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!id) return
    const rec = getSamplePreparation(id)
    if (rec) {
      setInitial({
        prepNo: rec.prepNo,
        sampleReceivingId: rec.sampleReceivingId,
        items: rec.items,
      } as any)
    }
  }, [id])

  const handleSubmit = (data: SamplePreparationFormData) => {
    if (!id) return
    updateSamplePreparation(id, {
      prepNo: data.prepNo,
      sampleReceivingId: data.sampleReceivingId,
      items: data.items,
    })
    toast.success("Preparation updated")
    setIsEditing(false)
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Sample Preparation" description="Edit the sample preparation details" label={null} href={ROUTES.APP.SAMPLE_PREPARATION.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      {initial ? (
        <SamplePreparationForm initialData={initial} onSubmit={handleSubmit} readOnly={!isEditing} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  )
}


