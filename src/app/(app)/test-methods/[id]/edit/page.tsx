"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TestMethodForm } from "@/components/test-methods/form"
import { getTestMethod, TestMethod } from "@/lib/test-methods"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"

export default function EditTestMethodPage() {
  const params = useParams<{ id: string }>()
  const [method, setMethod] = useState<TestMethod | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (params?.id) setMethod(getTestMethod(params.id))
  }, [params?.id])

  if (!method) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Test Method" description="Edit the test method details" label={null} href={ROUTES.APP.TEST_METHODS.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <TestMethodForm initial={method} readOnly={!isEditing} />
    </div>
  )
}


