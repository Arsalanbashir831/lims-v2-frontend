"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProficiencyTestingForm } from "@/components/proficiency-testing/form"
import { getProficiencyTest, ProficiencyTest } from "@/lib/proficiency-testing"

export default function EditProficiencyTestingPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<ProficiencyTest | undefined>(undefined)

  useEffect(() => {
    if (params?.id) setRecord(getProficiencyTest(params.id))
  }, [params?.id])

  if (!record) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Edit Proficiency Testing</h1>
      <ProficiencyTestingForm initial={record} />
    </div>
  )
}


