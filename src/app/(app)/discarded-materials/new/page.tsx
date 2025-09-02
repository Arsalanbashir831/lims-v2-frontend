"use client"

import { useRouter } from "next/navigation"
import { DiscardedMaterialForm } from "@/components/discarded-materials/form"
import { createDiscardedMaterial } from "@/lib/discarded-materials"
import type { CreateDiscardedMaterialData } from "@/lib/discarded-materials"
import { ROUTES } from "@/constants/routes"
import { BackButton } from "@/components/ui/back-button"
import { FormHeader } from "@/components/common/form-header"

export default function NewDiscardedMaterialPage() {
  const router = useRouter()

  const handleSubmit = (data: CreateDiscardedMaterialData) => {
    createDiscardedMaterial(data)
    router.push(ROUTES.APP.MATERIAL_DISCARDS.ROOT)
  }

  return (
    <div className="space-y-4">
      <FormHeader title="New Discard Record" description="Create a new record for discarded materials." label={null} href={ROUTES.APP.MATERIAL_DISCARDS.ROOT}/>  
      <DiscardedMaterialForm onSubmit={handleSubmit} />
    </div>
  )
}
