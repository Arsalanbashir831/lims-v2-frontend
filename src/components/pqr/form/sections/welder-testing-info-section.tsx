import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"
import { WelderSelector } from "@/components/common/welder-selector"
import { Welder } from "@/lib/schemas/welder"
import { useState, useCallback, useEffect, useRef } from "react"

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
  const [welderDatabaseId, setWelderDatabaseId] = useState<string | undefined>(undefined)
  
  // Use ref to track latest section data without causing re-renders
  const sectionDataRef = useRef(initialSectionData)
  // Track if we've initialized from data to prevent re-initialization
  const hasInitializedRef = useRef(false)

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
    { id: "wti3", label: "Welder Database ID", value: "", hidden: true }, // Hidden - stores welder.id for backend
    { id: "wti5", label: "Mechanical Testing Conducted by", value: "" },
    { id: "wti6", label: "Lab Test No.", value: "" },
  ]

  // Update ref when initialSectionData changes
  useEffect(() => {
    sectionDataRef.current = initialSectionData
  }, [initialSectionData])

  // Initialize from initial data if available - set the welder name and ID values (only once)
  useEffect(() => {
    // Only initialize once, when data first becomes available
    if (initialSectionData?.data && !hasInitializedRef.current) {
      const welderNameRow = initialSectionData.data.find(row => row.label === "Welder Name")
      const welderIdRow = initialSectionData.data.find(row => row.label === "Welder ID")
      const welderDatabaseIdRow = initialSectionData.data.find(row => row.label === "Welder Database ID")
      
      // Only initialize if we have actual values (for edit mode)
      const hasWelderName = welderNameRow && welderNameRow.value
      const hasWelderId = welderIdRow && welderIdRow.value
      
      if (hasWelderName || hasWelderId) {
        if (hasWelderName) {
          setWelderNameValue(welderNameRow.value as string || "")
        }
        if (hasWelderId) {
          setWelderIdValue(welderIdRow.value as string || "")
        }
        if (welderDatabaseIdRow && welderDatabaseIdRow.value) {
          setWelderDatabaseId(welderDatabaseIdRow.value as string)
        }
        hasInitializedRef.current = true
      }
    }
  }, [initialSectionData])

  const handleWelderSelection = useCallback((welderId: string | undefined, welder: Welder | undefined) => {
    setSelectedWelder(welder)
    
    if (welder) {
      setWelderNameValue(welder.operator_name)
      setWelderIdValue(welder.operator_id)
      setWelderDatabaseId(welder.id) // Set the database ID for selector
      
      // Update the form data with the selected welder information
      // Use ref to get latest data without causing callback recreation
      const currentSectionData = sectionDataRef.current
      const currentData = currentSectionData?.data || defaultData
      const updatedData = currentData.map(row => {
        if (row.label === "Welder Name") {
          return { ...row, value: welder.operator_name }
        }
        if (row.label === "Welder ID") {
          return { ...row, value: welder.operator_id }
        }
        if (row.label === "Welder Database ID") {
          return { ...row, value: welder.id, hidden: true } // Store database ID (sent as welder_id to backend)
        }
        return row
      })
      
      onUpdate({
        columns: currentSectionData?.columns || initialCols,
        data: updatedData
      })
    } else {
      setWelderNameValue("")
      setWelderIdValue("")
      setWelderDatabaseId(undefined)
      
      // Clear the form data
      const currentSectionData = sectionDataRef.current
      const currentData = currentSectionData?.data || defaultData
      const updatedData = currentData.map(row => {
        if (row.label === "Welder Name" || row.label === "Welder ID") {
          return { ...row, value: "" }
        }
        if (row.label === "Welder Database ID") {
          return { ...row, value: "", hidden: true }
        }
        return row
      })
      
      onUpdate({
        columns: currentSectionData?.columns || initialCols,
        data: updatedData
      })
    }
  }, [onUpdate])

  const handleWelderNameChange = useCallback((value: string) => {
    setWelderNameValue(value)
  }, [])

  const handleWelderIdChange = useCallback((value: string) => {
    setWelderIdValue(value)
  }, [])

  // Always show welder selector (in both create and edit mode)
  const welderSelectorData = {
    selectedWelder,
    welderDatabaseId, // Pass the database ID for the selector to match
    onWelderSelection: handleWelderSelection,
    welderNameValue,
    onWelderNameChange: handleWelderNameChange,
    welderIdValue,
    onWelderIdChange: handleWelderIdChange,
  }

  return (
    <SectionComponentWrapper
      sectionId="welderTestingInfo"
      title="WELDER TESTING INFORMATION"
      initialCols={initialSectionData?.columns || initialCols}
      initialDataRows={initialSectionData?.data || defaultData}
      onUpdate={onUpdate}
      isSectionTable={true}
      welderSelector={welderSelectorData}
    />
  )
}
