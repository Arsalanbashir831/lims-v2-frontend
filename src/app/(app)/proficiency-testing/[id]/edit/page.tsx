"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProficiencyTestingForm } from "@/components/proficiency-testing/form"
import { getProficiencyTest, ProficiencyTest } from "@/lib/proficiency-testing"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"

export default function EditProficiencyTestingPage() {
  const params = useParams<{ id: string }>()
  const [record, setRecord] = useState<ProficiencyTest | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (params?.id) setRecord(getProficiencyTest(params.id))
  }, [params?.id])

  if (!record) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Proficiency Testing" description="Edit the proficiency testing details" label={null} href={ROUTES.APP.PROFICIENCY_TESTING.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <ProficiencyTestingForm initial={record} readOnly={!isEditing} />
    </div>
  )
}


