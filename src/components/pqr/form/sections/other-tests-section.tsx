import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface OtherTestsSectionProps {
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function OtherTestsSection({ onUpdate, initialSectionData }: OtherTestsSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "otItemNo",
      header: "Item No.",
      accessorKey: "itemNo",
      type: "input",
    },
    {
      id: "otTypeOfTest",
      header: "Type of Test",
      accessorKey: "typeOfTest",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "otSpecProcedure",
      header: "Specification / Procedure",
      accessorKey: "specProcedure",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "otResults",
      header: "Results",
      accessorKey: "results",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "otReportNo",
      header: "Report No.",
      accessorKey: "reportNo",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    {
      id: "ot-row-1",
      itemNo: "",
      typeOfTest: "",
      specProcedure: "",
      results: "",
      reportNo: "",
    },
  ]

  return (
    <SectionComponentWrapper
      sectionId="otherTests"
      title="Other Tests"
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    />
  )
}
