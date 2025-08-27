"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TestMethodForm } from "@/components/test-methods/form"
import { getTestMethod, TestMethod } from "@/lib/test-methods"

export default function EditTestMethodPage() {
  const params = useParams<{ id: string }>()
  const [method, setMethod] = useState<TestMethod | undefined>(undefined)

  useEffect(() => {
    if (params?.id) setMethod(getTestMethod(params.id))
  }, [params?.id])

  if (!method) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Edit: {method.name}</h1>
      <TestMethodForm initial={method} />
    </div>
  )
}


