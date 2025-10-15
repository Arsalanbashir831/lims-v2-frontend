"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { EquipmentForm } from "@/components/equipments/form"
import { equipmentService, Equipment } from "@/services/equipments.service"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { PencilIcon, XIcon } from "lucide-react"

export default function EditEquipmentPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<Equipment | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  const id = params?.id as string
  const { data, isLoading } = useQuery({
    queryKey: ['equipments', id],
    queryFn: () => equipmentService.getById(id),
    enabled: !!id,
  })
  
  const recordData = data

  if (isLoading || !recordData) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Equipment" description="Edit the equipment details" label={null} href={ROUTES.APP.LAB_EQUIPMENTS.ROOT}>
      {!isEditing ? (
        <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
      )}
      </FormHeader>
      <EquipmentForm initial={recordData as any} readOnly={!isEditing} />
    </div>
  )
}


