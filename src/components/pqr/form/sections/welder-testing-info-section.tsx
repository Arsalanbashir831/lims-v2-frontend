import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"
import { WelderSelector } from "@/components/common/welder-selector"
import { Welder } from "@/lib/schemas/welder"
import { useState, useCallback, useEffect } from "react"

interface WelderTestingInfoSectionProps {
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[] }
}

export function WelderTestingInfoSection({
  onUpdate,
  initialSectionData,
}: WelderTestingInfoSectionProps) {
  const [selectedWelder, setSelectedWelder] = useState<Welder | undefined>(undefined)
  const [welderNameValue, setWelderNameValue] = useState("")
  const [welderIdValue, setWelderIdValue] = useState("")

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
    { id: "wti3", label: "Welder Card ID", value: "", hidden: true }, // Hidden from UI but included in data
    { id: "wti4", label: "Mechanical Testing Conducted by", value: "" },
    { id: "wti5", label: "Lab Test No.", value: "" },
  ]

  // Initialize from initial data if available - only set the welder name and ID values
  //  The SectionComponentWrapper will handle passing the initial data to the form
  useEffect(() => {
    if (initialSectionData?.data) {
      const welderNameRow = initialSectionData.data.find(row => row.label === "Welder Name")
      const welderIdRow = initialSectionData.data.find(row => row.label === "Welder ID")
      
      if (welderNameRow) {
        setWelderNameValue(welderNameRow.value as string || "")
      }
      if (welderIdRow) {
        setWelderIdValue(welderIdRow.value as string || "")
      }
    }
  }, [initialSectionData])

  const handleWelderSelection = useCallback((welderId: string | undefined, welder: Welder | undefined) => {
    setSelectedWelder(welder)
    
    if (welder) {
      setWelderNameValue(welder.operator_name)
      setWelderIdValue(welder.operator_id)
      // Get the card_id from the welder data (this comes from the welder selector)
      // The welder may have an optional card_id property added dynamically
      const cardId = ('card_id' in welder ? (welder as Welder & { card_id?: string }).card_id : '') || ""
      
      // Update the form data with the selected welder information
      const currentData = initialSectionData?.data || defaultData
      const updatedData = currentData.map(row => {
        if (row.label === "Welder Name") {
          return { ...row, value: welder.operator_name }
        }
        if (row.label === "Welder ID") {
          return { ...row, value: welder.operator_id }
        }
        if (row.label === "Welder Card ID") {
          return { ...row, value: cardId, hidden: true } // Keep hidden but update value
        }
        return row
      })
      
      onUpdate({
        columns: initialSectionData?.columns || initialCols,
        data: updatedData
      })
    } else {
      setWelderNameValue("")
      setWelderIdValue("")
      
      // Clear the form data
      const currentData = initialSectionData?.data || defaultData
      const updatedData = currentData.map(row => {
        if (row.label === "Welder Name" || row.label === "Welder ID") {
          return { ...row, value: "" }
        }
        if (row.label === "Welder Card ID") {
          return { ...row, value: "", hidden: true } // Keep hidden when clearing
        }
        return row
      })
      
      onUpdate({
        columns: initialSectionData?.columns || initialCols,
        data: updatedData
      })
    }
  }, [initialSectionData, onUpdate, initialCols, defaultData])

  const handleWelderNameChange = useCallback((value: string) => {
    setWelderNameValue(value)
  }, [])

  const handleWelderIdChange = useCallback((value: string) => {
    setWelderIdValue(value)
  }, [])

  // Custom section data that includes the welder selector
  const sectionData = {
    columns: initialSectionData?.columns || initialCols,
    data: initialSectionData?.data || defaultData,
    welderSelector: {
      selectedWelder,
      onWelderSelection: handleWelderSelection,
      welderNameValue,
      onWelderNameChange: handleWelderNameChange,
      welderIdValue,
      onWelderIdChange: handleWelderIdChange,
    }
  }

  return (
    <SectionComponentWrapper
      sectionId="welderTestingInfo"
      title="WELDER TESTING INFORMATION"
      initialCols={sectionData.columns}
      initialDataRows={sectionData.data}
      onUpdate={onUpdate}
      isSectionTable={true}
      welderSelector={sectionData.welderSelector}
    />
  )
}
