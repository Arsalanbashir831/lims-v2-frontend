"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { EquipmentForm } from "@/components/equipments/form"
import { getEquipment, Equipment } from "@/lib/equipments"

export default function EditEquipmentPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<Equipment | undefined>(undefined)

  useEffect(() => {
    if (params?.id) setRecord(getEquipment(params.id))
  }, [params?.id])

  if (!record) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Edit Equipment</h1>
      <EquipmentForm initial={record} />
    </div>
  )
}


