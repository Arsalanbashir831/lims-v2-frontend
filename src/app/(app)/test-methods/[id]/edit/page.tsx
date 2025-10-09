"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { TestMethodForm } from "@/components/test-methods/form"
import { testMethodService, TestMethod } from "@/services/test-methods.service"
import { FormHeader } from "@/components/common/form-header"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { useQuery } from "@tanstack/react-query"

export default function EditTestMethodPage() {
  const params = useParams<{ id: string }>()
  const [isEditing, setIsEditing] = useState(false)

  const id = params?.id as string
  const { data, isLoading } = useQuery({
    queryKey: ['test-methods', id],
    queryFn: () => testMethodService.getById(id),
    enabled: !!id,
  })

  if (isLoading || !data) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Test Method" description="Edit the test method details" label={null} href={ROUTES.APP.TEST_METHODS.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      <TestMethodForm initial={data} readOnly={!isEditing} />
    </div>
  )
}


