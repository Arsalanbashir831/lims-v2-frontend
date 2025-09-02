"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PQRForm, PQRFormData } from "@/components/pqr/form/pqr-form"
import { toast } from "sonner"
import { createPqr } from "@/lib/pqr"
import { savePqrForm } from "@/lib/pqr-form-store"
import { BackButton } from "@/components/ui/back-button"
import { ROUTES } from "@/constants/routes"
import { FormHeader } from "@/components/common/form-header"

export default function NewPQRPage() {
  const router = useRouter()
  const [formType, setFormType] = useState<"asme" | "api">("asme")

  const isAsme = useMemo(() => formType === "asme", [formType])

  function extractHeaderValue(formData: PQRFormData, key: string): string {
    const rows = formData.headerInfo?.data ?? []
    const row = rows.find(r => (r.description ?? "").toLowerCase() === key.toLowerCase())
    return (row?.value ?? "").trim()
  }

  const handleSubmit = (data: PQRFormData) => {
    const contractorName = extractHeaderValue(data, "Contractor Name")
    const pqrNo = extractHeaderValue(data, "PQR No.")
    const supportingPwpsNo = extractHeaderValue(data, "Supporting PWPS No.")
    const dateOfIssue = extractHeaderValue(data, "Date of Issue")
    const dateOfWelding = extractHeaderValue(data, "Date of Welding")
    const biNumber = extractHeaderValue(data, "BI #")
    const clientEndUser = extractHeaderValue(data, "Client/End User")
    const dateOfTesting = extractHeaderValue(data, "Date of Testing")

    const rec = createPqr({
      contractorName,
      pqrNo,
      supportingPwpsNo,
      dateOfIssue,
      dateOfWelding,
      biNumber,
      clientEndUser,
      dateOfTesting,
      createdAt: 0 as unknown as never,
      updatedAt: 0 as unknown as never,
    } as any)

    // Persist full form for preview
    if (rec?.id) {
      savePqrForm(rec.id, data)
    }

    toast.success("PQR saved")
    router.push(ROUTES.APP.PQR.ROOT)
  }

  return (
    <div className="grid gap-4">
      <FormHeader title="New PQR" description="Create a new PQR" label={null} href={ROUTES.APP.PQR.ROOT}>
      <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Form Type</span>
          <Select value={formType} onValueChange={(v: "asme" | "api") => setFormType(v)}>
            <SelectTrigger className="w-44 h-9">
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
