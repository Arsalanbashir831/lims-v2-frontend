import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface WelderTestingInfoSectionProps {
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function WelderTestingInfoSection({
  onUpdate,
  initialSectionData,
}: WelderTestingInfoSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "wtiLabel",
      header: "Parameter",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "wtiValue",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    { id: "wti1", label: "Welder Name", value: "" },
    { id: "wti2", label: "Welder ID", value: "" },
    { id: "wti3", label: "Mechanical Testing Conducted by", value: "" },
    { id: "wti4", label: "Lab Test No.", value: "" },
  ]

  return (
    <SectionComponentWrapper
      sectionId="welderTestingInfo"
      title="WELDER TESTING INFORMATION"
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
