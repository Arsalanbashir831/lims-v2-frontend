"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionComponentWrapper } from "../section-component-wrapper"
import { DynamicColumn, DynamicRow } from "../dynamic-table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { TrashIcon } from "lucide-react"

interface JointsSectionState {
  columns: DynamicColumn[]
  data: DynamicRow[]
  designPhotoUrl?: string
  designPhotoFile: File | null
}

interface JointsSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[]; designPhotoUrl?: string }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[]; designPhotoUrl?: string }
  pqrId?: string
}

export function JointsSection({
  isAsme,
  onUpdate,
  initialSectionData,
  pqrId,
}: JointsSectionProps) {
  const initialCols: DynamicColumn[] = [
    { id: "jlabel", header: "Parameter", accessorKey: "label", type: "label" },
    {
      id: "jvalue",
      header: "Details",
      accessorKey: "value",
      type: "input",
      placeholder: "Enter Detail",
    },
  ]

  const defaultData: DynamicRow[] = [
    { id: "jd", label: "Joint Design", value: "" },
    { id: "jb", label: "Backing (Yes/No)", value: "" },
    { id: "jbm", label: "Backing Material Type", value: "" },
    { id: "jo", label: "Others", value: "" },
  ]

  const initialState: JointsSectionState = {
    columns: initialSectionData?.columns || initialCols,
    data: initialSectionData?.data || defaultData,
    designPhotoUrl: initialSectionData?.designPhotoUrl || "",
    designPhotoFile: null,
  }

  // Local state for entire section
  const [sectionState, setSectionState] = useState<JointsSectionState>(initialState)

  // Propagate to formData.joints on any change
  useEffect(() => {
    onUpdate({ columns: sectionState.columns, data: sectionState.data, designPhotoUrl: sectionState.designPhotoUrl })
  }, [sectionState, onUpdate])

  // Helper: when the table itself changes, update state.columns/data
  const handleTableChange = useCallback(
    ({ columns, data }: { columns: DynamicColumn[]; data: DynamicRow[] }) => {
      setSectionState((prev) => ({ ...prev, columns, data }))
    },
    []
  )

  // File input handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setSectionState((prev) => ({
      ...prev,
      designPhotoFile: file,
      designPhotoUrl: localUrl,
    }))
  }

  // Delete handler
  const handleDeletePhoto = () => {
    setSectionState((prev) => ({
      ...prev,
      designPhotoUrl: "",
      designPhotoFile: null,
    }))
  }

  return (
    <div className="space-y-4">
      <SectionComponentWrapper
        sectionId="joints"
        title="JOINTS"
        qwEquivalent="QW-402"
        isAsme={isAsme}
        initialCols={sectionState.columns}
        initialDataRows={sectionState.data}
        onUpdate={handleTableChange}
        isSectionTable
      />

      <Card className="p-4">
        <h4 className="mb-2 font-semibold">Joint Design Sketch / Photo</h4>

        {sectionState.designPhotoUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={sectionState.designPhotoUrl}
              alt="Joint Design Photo"
              className="h-32 w-32 border object-cover rounded"
            />
            <ConfirmPopover
              title="Delete this photo?"
              confirmText="Delete"
              onConfirm={handleDeletePhoto}
              trigger={
                <Button type="button" variant="destructive">
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete Photo
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="design-photo" className="text-sm font-medium">
              Upload Joint Design Photo
            </Label>
            <Input
              id="design-photo"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full rounded-md border-2 border-dashed border-gray-300 p-2"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
