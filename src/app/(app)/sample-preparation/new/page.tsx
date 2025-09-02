"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { createSamplePreparation, generatePrepNo } from "@/lib/sample-preparation"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

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
      <FormHeader title="New Sample Preparation" description="Create a new sample preparation" label={null} href={ROUTES.APP.SAMPLE_PREPARATION.ROOT}/>
      <SamplePreparationForm onSubmit={handleSubmit} />
    </div>
  )
}


