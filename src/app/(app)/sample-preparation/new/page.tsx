"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { createSamplePreparation, generatePrepNo } from "@/lib/sample-preparation"

export default function NewSamplePreparationPage() {
  const router = useRouter()

  const handleSubmit = (data: SamplePreparationFormData) => {
    createSamplePreparation({
      prepNo: data.prepNo ?? generatePrepNo(),
      sampleReceivingId: data.sampleReceivingId,
      items: data.items,
    })
    toast.success("Preparation saved")
    router.push("/sample-preparation")
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">New Sample Preparation</h1>
      <SamplePreparationForm onSubmit={handleSubmit} />
    </div>
  )
}


