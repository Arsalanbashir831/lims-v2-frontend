/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

interface CertificationSectionProps {
  onUpdate: (sectionData: { columns: any[]; data: { id: string; reference: string }[] }) => void
  initialSectionData?: { columns?: any[]; data?: { id: string; reference: string }[] }
}

export function CertificationSection({ onUpdate, initialSectionData }: CertificationSectionProps) {
  const initialValue = initialSectionData?.data?.[0]?.reference ?? ""
  const [reference, setReference] = useState<string>(initialValue)

  useEffect(() => {
    onUpdate({ columns: [], data: [{ id: "cert-ref", reference }] })
  }, [reference, onUpdate])

  return (
    <Card className="">
      <CardHeader className="px-2">
      <CardTitle className="text-lg font-semibold">Certification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-2">
        <p className="text-sm font-semibold text-muted-foreground">
          We certify that the statements in this record are correct and that the test welds were prepared, welded and tested in accordance with the requirements of:
        </p>
        <Textarea
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter code/standard reference..."
          className="min-h-[88px]"
        />
      </CardContent>
    </Card>
  )
}
