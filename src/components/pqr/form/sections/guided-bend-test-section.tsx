import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface GuidedBendTestSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function GuidedBendTestSection({
  isAsme,
  onUpdate,
  initialSectionData,
}: GuidedBendTestSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "gbtItemNo",
      header: "Item No.",
      accessorKey: "itemNo",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gbtTypeOfBend",
      header: "Type of Bend",
      accessorKey: "typeOfBend",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gbtPosition",
      header: "Position",
      accessorKey: "position",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gbtOpenDefects",
      header: "Open Defects",
      accessorKey: "openDefects",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gbtResult",
      header: "Result",
      accessorKey: "result",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gbtReportNo",
      header: "Report No.",
      accessorKey: "reportNo",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    {
      id: "gbt-row-1",
      itemNo: "",
      typeOfBend: "",
      position: "",
      openDefects: "",
      result: "",
      reportNo: "",
    },
  ]

  return (
    <SectionComponentWrapper
      sectionId="guidedBendTest"
      title="Guided Bend Test"
      qwEquivalent="QW-160"
      isAsme={isAsme}
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
