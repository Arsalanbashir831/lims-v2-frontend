import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface HeaderInfoSectionProps {
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function HeaderInfoSection({ onUpdate, initialSectionData }: HeaderInfoSectionProps) {
  const initialHeaderCols: DynamicColumn[] = [
    {
      id: "fieldDesc",
      header: "Description",
      accessorKey: "description",
      type: "label",
    },
    {
      id: "fieldVal",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultHeaderData: DynamicRow[] = [
    { id: "s1r1", description: "Contractor Name", value: "" },
    { id: "s1r2", description: "Document No.", value: "" },
    { id: "s1r3", description: "PQR No.", value: "" },
    { id: "s1r4", description: "Page No.", value: "" },
    { id: "s1r5", description: "Supporting PWPS No.", value: "" },
    { id: "s1r6", description: "Date of Issue", value: "", type: "date" },
    { id: "s1r7", description: "Welding Process(es)", value: "" },
    { id: "s1r8", description: "Date of Welding", value: "", type: "date" },
    { id: "s1r9", description: "Type", value: "" },
    { id: "s1r10", description: "Code Reference", value: "" },
    { id: "s1r11", description: "BI #", value: "" },
    { id: "s1r12", description: "Contract #", value: "" },
    { id: "s1r13", description: "Client/End User", value: "" },
    { id: "s1r14", description: "Date of Testing", value: "", type: "date" },
  ]

  return (
    <SectionComponentWrapper
      sectionId="headerInfo"
      title="PQR Header Information"
      initialCols={initialSectionData?.columns || initialHeaderCols}
      initialDataRows={initialSectionData?.data || defaultHeaderData}
      onUpdate={onUpdate}
      isSectionTable={true}
    >
      Basic details for the Procedure Qualification Record.
    </SectionComponentWrapper>
  )
}
