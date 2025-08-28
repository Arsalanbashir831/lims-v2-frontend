import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface FilletWeldTestSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function FilletWeldTestSection({
  isAsme,
  onUpdate,
  initialSectionData,
}: FilletWeldTestSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "fwtItemNo",
      header: "Item No.",
      accessorKey: "itemNo",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "fwtResult",
      header: "Result - Satisfactory (Yes/No)",
      accessorKey: "result",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "fwtPenetration",
      header: "Penetration into Parent Metal (Yes/No)",
      accessorKey: "penetration",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "fwtReportNo",
      header: "Report No.",
      accessorKey: "reportNo",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    {
      id: "fwt-row-1",
      itemNo: "",
      result: "",
      penetration: "",
      reportNo: "",
    },
  ]

  return (
    <SectionComponentWrapper
      sectionId="filletWeldTest"
      title="Fillet Weld Test"
      qwEquivalent="QW-180"
      isAsme={isAsme}
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
