"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EditIcon } from "lucide-react"
import { DiscardedMaterialForm } from "@/components/discarded-materials/form"
import { getDiscardedMaterial, updateDiscardedMaterial } from "@/lib/discarded-materials"
import { ROUTES } from "@/constants/routes"
import type { CreateDiscardedMaterialData } from "@/lib/discarded-materials"

export default function EditDiscardedMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [material, setMaterial] = useState<CreateDiscardedMaterialData | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMaterial = () => {
      const found = getDiscardedMaterial(id)
      if (found) {
        setMaterial({
          jobId: found.jobId,
          sampleId: found.sampleId,
          discardReason: found.discardReason,
          discardDate: found.discardDate,
          items: found.items,
        })
      } else {
        router.push(ROUTES.APP.MATERIAL_DISCARDS.ROOT)
      }
      setIsLoading(false)
    }

    loadMaterial()
  }, [id, router])

  const handleSubmit = (data: CreateDiscardedMaterialData) => {
    if (updateDiscardedMaterial(id, data)) {
      router.push(ROUTES.APP.MATERIAL_DISCARDS.ROOT)
    }
  }

  const handleEdit = () => {
    setIsReadOnly(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Material Not Found</h1>
            <p className="text-muted-foreground">
              The requested discarded material record could not be found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isReadOnly ? "View Discard Record" : "Edit Discard Record"}
          </h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? "View details of the discarded material record."
              : "Edit the discarded material record."
            }
          </p>
        </div>
        {isReadOnly && (
          <Button onClick={handleEdit}>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <DiscardedMaterialForm 
        initialData={material} 
        onSubmit={handleSubmit}
        readOnly={isReadOnly}
      />
    </div>
  )
}
