import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface WeldingParametersSectionProps {
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function WeldingParametersSection({
  onUpdate,
  initialSectionData,
}: WeldingParametersSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "wpLabel",
      header: "Parameter",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "wpValue",
      header: "Value",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    { id: "wp1", label: "Welding Current", value: "" },
    { id: "wp2", label: "Welding Voltage", value: "" },
    { id: "wp3", label: "Travel Speed", value: "" },
    { id: "wp4", label: "Heat Input", value: "" },
    { id: "wp5", label: "Gas Flow Rate", value: "" },
    { id: "wp6", label: "Electrode Diameter", value: "" },
    { id: "wp7", label: "Wire Feed Speed", value: "" },
    { id: "wp8", label: "Arc Length", value: "" },
  ]

  return (
    <SectionComponentWrapper
      sectionId="weldingParameters"
      title="WELDING PARAMETERS"
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
