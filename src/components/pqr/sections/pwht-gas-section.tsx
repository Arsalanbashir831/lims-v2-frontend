import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"

interface PWHTGasSectionProps {
  isAsme: boolean
  updatePwht: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  updateGas: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: {
    pwht?: { columns: DynamicColumn[]; data: DynamicRow[] }
    gas?: { columns: DynamicColumn[]; data: DynamicRow[] }
  }
}

export function PWHTGasSection({
  isAsme,
  updatePwht,
  updateGas,
  initialSectionData,
}: PWHTGasSectionProps) {
  const initialPwhtCols: DynamicColumn[] = [
    {
      id: "pwhtLabel",
      header: "PWHT Parameter",
      accessorKey: "label",
      type: "label",
    },
    {
      id: "pwhtValue",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultPwhtData: DynamicRow[] = [
    { id: "pwht1", label: "Soaking Temperature", value: "" },
    { id: "pwht2", label: "Soaking Time", value: "" },
    { id: "pwht3", label: "Rate of Heating", value: "" },
    { id: "pwht4", label: "Rate of Cooling", value: "" },
    { id: "pwht5", label: "Others", value: "" },
  ]

  const initialGasCols: DynamicColumn[] = [
    { id: "gasDash", header: "-", accessorKey: "dash", type: "input" },
    {
      id: "gasProcess",
      header: "Process",
      accessorKey: "process",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gasGases",
      header: "Gas(es)",
      accessorKey: "gases",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gasMix",
      header: "Mix (%) Purity",
      accessorKey: "mix",
      type: "input",
      placeholder: "Enter Detail",
    },
    {
      id: "gasFlow",
      header: "Flow Rate",
      accessorKey: "flow",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultGasData: DynamicRow[] = [
    { id: "gas1", dash: "", process: "", gases: "", mix: "", flow: "" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionComponentWrapper
        sectionId="pwht"
        title="POST WELD HEAT TREATMENT"
        qwEquivalent="QW-407"
        isAsme={isAsme}
        initialCols={initialSectionData?.pwht?.columns || initialPwhtCols}
        initialDataRows={initialSectionData?.pwht?.data || defaultPwhtData}
        onUpdate={updatePwht}
        isSectionTable={true}
      />
      <SectionComponentWrapper
        sectionId="gas"
        title="GAS"
        qwEquivalent="QW-408"
        isAsme={isAsme}
        initialCols={initialSectionData?.gas?.columns || initialGasCols}
        initialDataRows={initialSectionData?.gas?.data || defaultGasData}
        onUpdate={updateGas}
        isSectionTable={true}
      />
    </div>
  )
}
