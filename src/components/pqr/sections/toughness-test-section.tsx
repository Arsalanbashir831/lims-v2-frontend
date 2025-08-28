import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface ToughnessTestSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function ToughnessTestSection({
  isAsme,
  onUpdate,
  initialSectionData,
}: ToughnessTestSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "ttItemNo",
      header: "Item No.",
      accessorKey: "itemNo",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "ttNotchLocation",
      header: "Notch Location",
      accessorKey: "notchLocation",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "ttDimensions",
      header: "Dimensions",
      accessorKey: "dimensions",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "ttTestTemp",
      header: "Test Temp.",
      accessorKey: "testTemp",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "ttImpact1",
      header: "Impact Value 1 (Joules)",
      accessorKey: "impact1",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "ttImpact2",
      header: "Impact Value 2 (Joules)",
      accessorKey: "impact2",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "ttImpact3",
      header: "Impact Value 3 (Joules)",
      accessorKey: "impact3",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "ttAverage",
      header: "Average (Joules)",
      accessorKey: "average",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "ttDropWeight",
      header: "Drop Weight",
      accessorKey: "dropWeight",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "ttReportNo",
      header: "Report No.",
      accessorKey: "reportNo",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    {
      id: "tough-row-1",
      itemNo: "",
      notchLocation: "",
      dimensions: "",
      testTemp: "",
      impact1: "",
      impact2: "",
      impact3: "",
      average: "",
      dropWeight: "",
      reportNo: "",
    },
  ]

  return (
    <SectionComponentWrapper
      sectionId="toughnessTest"
      title="Toughness Test"
      qwEquivalent="QW-170"
      isAsme={isAsme}
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
