import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface BaseMetalsSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function BaseMetalsSection({
  isAsme,
  onUpdate,
  initialSectionData,
}: BaseMetalsSectionProps) {
  const initialBMCols: DynamicColumn[] = [
    { id: "bmLabel", header: "Parameter", accessorKey: "label", type: "label" },
    {
      id: "bmValue",
      header: "Specification",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultBMData: DynamicRow[] = [
    { id: "bm1", label: "Process(es)", value: "" },
    { id: "bm2", label: "SFA Specification", value: "" },
    { id: "bm3", label: "AWS Classification", value: "" },
    { id: "bm4", label: "Base Metal F-No.", value: "" },
    { id: "bm5", label: "Base Metal Analysis A-No.", value: "" },
    { id: "bm6", label: "Base Metal Thickness", value: "" },
    { id: "bm7", label: "Base Metal Product Form", value: "" },
    { id: "bm8", label: "Base Metal Heat Treatment", value: "" },
    { id: "bm9", label: "Base Metal Chemical Composition", value: "" },
    { id: "bm10", label: "Base Metal Mechanical Properties", value: "" },
  ]

  return (
    <SectionComponentWrapper
      sectionId="baseMetals"
      title="BASE METALS"
      qwEquivalent="QW-403"
      isAsme={isAsme}
      initialCols={initialSectionData?.columns || initialBMCols}
      initialDataRows={initialSectionData?.data || defaultBMData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
