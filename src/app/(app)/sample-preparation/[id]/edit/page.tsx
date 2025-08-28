"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { getSamplePreparation, updateSamplePreparation } from "@/lib/sample-preparation"

export default function EditSamplePreparationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [initial, setInitial] = useState<SamplePreparationFormData | null>(null)

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
    router.push("/sample-preparation")
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Edit Sample Preparation</h1>
      {initial ? (
        <SamplePreparationForm initialData={initial} onSubmit={handleSubmit} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  )
}


