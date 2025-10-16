"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicTable, DynamicColumn, DynamicRow } from "../dynamic-table"

interface SignatureSectionProps {
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function SignatureSection({ onUpdate, initialSectionData }: SignatureSectionProps) {
  const initialSigCols: DynamicColumn[] = [
    {
      id: "sigInsp",
      header: "Witnessing / Welding Inspector",
      accessorKey: "inspector",
      type: "input",
      placeholder: "Enter Name/ID",
    },
    {
      id: "sigSup",
      header: "Welding Supervisor",
      accessorKey: "supervisor",
      type: "input",
      placeholder: "Enter Name/ID",
    },
    {
      id: "sigLab",
      header: "Lab Testing Supervisor",
      accessorKey: "lab",
      type: "input",
      placeholder: "Enter Name/ID",
    },
  ]

  // Data rows for signatures/names. Add more rows if needed.
  const defaultSigData: DynamicRow[] = [
    { id: "sigRow1", inspector: "", supervisor: "", lab: "" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          GLOBAL RESOURCES INSPECTION CONTRACTING CO.
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 !rounded-lg overflow-hidden">
        <DynamicTable
          className="rounded-lg"
          initialColumns={initialSectionData?.columns || initialSigCols}
          initialData={initialSectionData?.data || defaultSigData}
          onColumnsChange={(cols) =>
            onUpdate({
              columns: cols,
              data: initialSectionData?.data || defaultSigData,
            })
          }
          onDataChange={(data) =>
            onUpdate({
              columns: initialSectionData?.columns || initialSigCols,
              data: data,
            })
          }
          allowAddRow={true}
          allowAddColumn={true}
        />
      </CardContent>
    </Card>
  )
}
