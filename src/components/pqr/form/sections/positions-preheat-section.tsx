import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface PositionsPreheatSectionProps {
  isAsme: boolean
  updatePositions: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  updatePreheat: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: {
    positions?: { columns: DynamicColumn[]; data: DynamicRow[] }
    preheat?: { columns: DynamicColumn[]; data: DynamicRow[] }
  }
}

export function PositionsPreheatSection({
  isAsme,
  updatePositions,
  updatePreheat,
  initialSectionData,
}: PositionsPreheatSectionProps) {
  const initialPosCols: DynamicColumn[] = [
    {
      id: "posLabel",
      header: "Position Parameter",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "posValue",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultPosData: DynamicRow[] = [
    { id: "pos1", label: "Position(s)", value: "" },
    { id: "pos2", label: "Weld Progression", value: "" },
    { id: "pos3", label: "Others", value: "" },
  ]

  const initialPreheatCols: DynamicColumn[] = [
    {
      id: "phLabel",
      header: "Preheat Parameter",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "phValue",
      header: "Temperature/Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultPreheatData: DynamicRow[] = [
    { id: "ph1", label: "Preheat Temp", value: "" },
    { id: "ph2", label: "Interpass Temp", value: "" },
    { id: "ph3", label: "Others", value: "" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionComponentWrapper
        sectionId="positions"
        title="POSITIONS"
        qwEquivalent="QW-405"
        isAsme={isAsme}
        initialCols={initialSectionData?.positions?.columns || initialPosCols}
        initialDataRows={initialSectionData?.positions?.data || defaultPosData}
        onUpdate={updatePositions}
        isSectionTable={true}
      />
      <SectionComponentWrapper
        sectionId="preheat"
        title="PREHEAT"
        qwEquivalent="QW-406"
        isAsme={isAsme}
        initialCols={initialSectionData?.preheat?.columns || initialPreheatCols}
        initialDataRows={initialSectionData?.preheat?.data || defaultPreheatData}
        onUpdate={updatePreheat}
        isSectionTable={true}
      />
    </div>
  )
}
