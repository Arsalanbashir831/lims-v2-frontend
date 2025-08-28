import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface TensileTestSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function TensileTestSection({
  isAsme,
  onUpdate,
  initialSectionData,
}: TensileTestSectionProps) {
  const initialCols: DynamicColumn[] = [
    {
      id: "itemNo",
      header: "Item No.",
      accessorKey: "itemNo",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "thickness",
      header: "Thickness (mm)",
      accessorKey: "thickness",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "width",
      header: "Width (mm)",
      accessorKey: "width",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "area",
      header: "Area (mm²)",
      accessorKey: "area",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "utl",
      header: "UTL (kN)",
      accessorKey: "utl",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "utsNmm2",
      header: "UTS (N/mm²)",
      accessorKey: "utsNmm2",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "utsMpa",
      header: "UTS (MPa)",
      accessorKey: "utsMpa",
      type: "numeric",
      placeholder: "Enter Detail",
    },
    {
      id: "failureType",
      header: "Type of Failure & Location",
      accessorKey: "failureType",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "reportNo",
      header: "Report No.",
      accessorKey: "reportNo",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    {
      id: "tt-row-1",
      itemNo: "",
      thickness: "",
      width: "",
      area: "",
      utl: "",
      utsNmm2: "",
      utsMpa: "",
      failureType: "",
      reportNo: "",
    },
  ]

  return (
    <SectionComponentWrapper
      sectionId="tensileTest"
      title="Tensile Test"
      qwEquivalent="QW-150"
      isAsme={isAsme}
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
    >
      Record of tensile test results.
    </SectionComponentWrapper>
  )
}
