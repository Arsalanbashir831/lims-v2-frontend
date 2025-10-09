"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PQRForm, PQRFormData } from "@/components/pqr/form/pqr-form"
import { toast } from "sonner"
import { getPqr, updatePqr } from "@/services/pqr.service"
import { ROUTES } from "@/constants/routes"
import { BackButton } from "@/components/ui/back-button"
import { FormHeader } from "@/components/common/form-header"

export default function EditPQRPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [formType, setFormType] = useState<"asme" | "api">("asme")
  const isAsme = useMemo(() => formType === "asme", [formType])

  // In a real app, load full PQR form data by id; for now we only have list summary
  const [summary, setSummary] = useState(() => (id ? getPqr(id) : null))

  useEffect(() => {
    if (id) setSummary(getPqr(id))
  }, [id])

  function extractHeaderValue(formData: PQRFormData, key: string): string {
    const rows = formData.headerInfo?.data ?? []
    const row = rows.find(r => (r.description ?? "").toLowerCase() === key.toLowerCase())
    return (row?.value ?? "").trim()
  }

  const handleSubmit = (data: PQRFormData) => {
    if (!id) return
    const contractorName = extractHeaderValue(data, "Contractor Name")
    const pqrNo = extractHeaderValue(data, "PQR No.")
    const supportingPwpsNo = extractHeaderValue(data, "Supporting PWPS No.")
    const dateOfIssue = extractHeaderValue(data, "Date of Issue")
    const dateOfWelding = extractHeaderValue(data, "Date of Welding")
    const biNumber = extractHeaderValue(data, "BI #")
    const clientEndUser = extractHeaderValue(data, "Client/End User")
    const dateOfTesting = extractHeaderValue(data, "Date of Testing")

    updatePqr(id, {
      contractorName,
      pqrNo,
      supportingPwpsNo,
      dateOfIssue,
      dateOfWelding,
      biNumber,
      clientEndUser,
      dateOfTesting,
    })

    toast.success("PQR updated")
    router.push(ROUTES.APP.WELDERS.PQR.ROOT)
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="Edit PQR" description="Update the PQR details" label={null} href={ROUTES.APP.WELDERS.PQR.ROOT}>
      <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Form Type</span>
            <Select value={formType} onValueChange={(v: "asme" | "api") => setFormType(v)}>
              <SelectTrigger className="w-44 h-9" disabled={true}>
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asme">ASME SEC IX</SelectItem>
                <SelectItem value="api">API 1104</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </FormHeader>
      <div>
        <PQRForm isAsme={isAsme} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
