import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface ElectricalTechniquesSectionProps {
  isAsme: boolean
  updateElectrical: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  updateTechniques: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: {
    electrical?: { columns: DynamicColumn[]; data: DynamicRow[] }
    techniques?: { columns: DynamicColumn[]; data: DynamicRow[] }
  }
}

export function ElectricalTechniquesSection({
  isAsme,
  updateElectrical,
  updateTechniques,
  initialSectionData,
}: ElectricalTechniquesSectionProps) {
  const initialElecCols: DynamicColumn[] = [
    {
      id: "ecLabel",
      header: "Characteristic",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "ecValue",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultElecData: DynamicRow[] = [
    { id: "ec1", label: "Current AC/DC", value: "" },
    { id: "ec2", label: "Polarity", value: "" },
    { id: "ec3", label: "Amperes", value: "" },
    { id: "ec4", label: "Volts", value: "" },
    { id: "ec5", label: "Tungsten Electrode Type", value: "" },
    { id: "ec6", label: "Tungsten Electrode Size", value: "" },
    { id: "ec7", label: "Heat Input", value: "" },
    { id: "ec8", label: "Pulsing Current", value: "" },
    { id: "ec9", label: "Others", value: "" },
  ]

  const initialTechCols: DynamicColumn[] = [
    {
      id: "techLabel",
      header: "Technique",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "techValue",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultTechData: DynamicRow[] = [
    { id: "tq1", label: "Travel Speed", value: "" },
    { id: "tq2", label: "String or Weave Bead", value: "" },
    { id: "tq3", label: "Orifice, Cup or Nozzle Size", value: "" },
    { id: "tq4", label: "Initial & Interpass Cleaning", value: "" },
    { id: "tq5", label: "Method of Back Gouging", value: "" },
    { id: "tq6", label: "Oscillation", value: "" },
    { id: "tq7", label: "Multi to Single Pass / Side", value: "" },
    { id: "tq8", label: "Single to Multi Electrodes", value: "" },
    { id: "tq9", label: "Closed to Out Chamber", value: "" },
    { id: "tq10", label: "Electrode Spacing", value: "" },
    { id: "tq11", label: "Manual or Automatic", value: "" },
    { id: "tq12", label: "Peening", value: "" },
    { id: "tq13", label: "Use of Thermal Process", value: "" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionComponentWrapper
        sectionId="electrical"
        title="ELECTRICAL CHARACTERISTICS"
        qwEquivalent="QW-409"
        isAsme={isAsme}
        initialCols={initialSectionData?.electrical?.columns || initialElecCols}
        initialDataRows={initialSectionData?.electrical?.data || defaultElecData}
        onUpdate={updateElectrical}
        isSectionTable={true}
      />

      <SectionComponentWrapper
        sectionId="techniques"
        title="TECHNIQUES"
        qwEquivalent="QW-410"
        isAsme={isAsme}
        initialCols={initialSectionData?.techniques?.columns || initialTechCols}
        initialDataRows={initialSectionData?.techniques?.data || defaultTechData}
        onUpdate={updateTechniques}
        isSectionTable={true}
      />
    </div>
  )
}
