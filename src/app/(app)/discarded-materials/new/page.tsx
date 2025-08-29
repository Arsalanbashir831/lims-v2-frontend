"use client"

import { useRouter } from "next/navigation"
import { DiscardedMaterialForm } from "@/components/discarded-materials/form"
import { createDiscardedMaterial } from "@/lib/discarded-materials"
import type { CreateDiscardedMaterialData } from "@/lib/discarded-materials"
import { ROUTES } from "@/constants/routes"

export default function NewDiscardedMaterialPage() {
  const router = useRouter()

  const handleSubmit = (data: CreateDiscardedMaterialData) => {
    createDiscardedMaterial(data)
    router.push(ROUTES.APP.MATERIAL_DISCARDS.ROOT)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Discard Record</h1>
        <p className="text-muted-foreground">
          Create a new record for discarded materials.
        </p>
      </div>

      <DiscardedMaterialForm onSubmit={handleSubmit} />
    </div>
  )
}
