import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface FillerMetalsSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function FillerMetalsSection({
  isAsme,
  onUpdate,
  initialSectionData,
}: FillerMetalsSectionProps) {
  const initialFMCols: DynamicColumn[] = [
    { id: "fmLabel", header: "Parameter", accessorKey: "label", type: "label" },
    {
      id: "fmValue",
      header: "Specification",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultFMData: DynamicRow[] = [
    { id: "fm1", label: "Process(es)", value: "" },
    { id: "fm2", label: "SFA Specification", value: "" },
    { id: "fm3", label: "AWS Classification", value: "" },
    { id: "fm4", label: "Filler Metal F-No.", value: "" },
    { id: "fm5", label: "Weld Metal Analysis A-No.", value: "" },
    { id: "fm6", label: "Size of Filler Metal", value: "" },
    { id: "fm7", label: "Addition of Filler Metal", value: "" },
    { id: "fm8", label: "Consumable Insert", value: "" },
    { id: "fm9", label: "Filler Metal Product Form", value: "" },
    { id: "fm10", label: "Weld Metal Thickness", value: "" },
    { id: "fm11", label: "Addition of Flux", value: "" },
    { id: "fm12", label: "Filler Wire Trade Name", value: "" },
    { id: "fm13", label: "Brand Name", value: "" },
    { id: "fm14", label: "Batch No. / Lot No. / Heat No.", value: "" },
  ]

  return (
    <SectionComponentWrapper
      sectionId="fillerMetals"
      title="FILLER METALS"
      qwEquivalent="QW-404"
      isAsme={isAsme}
      initialCols={initialSectionData?.columns || initialFMCols}
      initialDataRows={initialSectionData?.data || defaultFMData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
