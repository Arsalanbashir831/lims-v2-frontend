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
  designFiles: File[]
}

interface JointsSectionProps {
  isAsme: boolean
  onUpdate: (sectionData: { columns: DynamicColumn[]; data: DynamicRow[]; designPhotoUrl?: string; designFiles?: File[] }) => void
  initialSectionData?: { columns: DynamicColumn[]; data: DynamicRow[]; designPhotoUrl?: string; designFiles?: File[] }
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
    designFiles: initialSectionData?.designFiles || [],
  }

  // Local state for entire section
  const [sectionState, setSectionState] = useState<JointsSectionState>(initialState)

  // Propagate to formData.joints on any change
  useEffect(() => {
    onUpdate({ 
      columns: sectionState.columns, 
      data: sectionState.data, 
      designPhotoUrl: sectionState.designPhotoUrl,
      designFiles: sectionState.designFiles
    })
  }, [sectionState, onUpdate])

  // Helper: when the table itself changes, update state.columns/data
  const handleTableChange = useCallback(
    ({ columns, data }: { columns: DynamicColumn[]; data: DynamicRow[] }) => {
      setSectionState((prev) => ({ ...prev, columns, data }))
    },
    []
  )

  // File input handler for multiple files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Create preview URL for the first file
    const firstFile = files[0]
    const localUrl = URL.createObjectURL(firstFile)
    
    setSectionState((prev) => ({
      ...prev,
      designFiles: [...prev.designFiles, ...files],
      designPhotoUrl: localUrl, // Show first file as preview
    }))
  }

  // Delete specific file
  const handleDeleteFile = (index: number) => {
    setSectionState((prev) => {
      const newFiles = prev.designFiles.filter((_, i) => i !== index)
      const newUrl = newFiles.length > 0 ? URL.createObjectURL(newFiles[0]) : ""
      return {
        ...prev,
        designFiles: newFiles,
        designPhotoUrl: newUrl,
      }
    })
  }

  // Delete all files
  const handleDeleteAllFiles = () => {
    setSectionState((prev) => ({
      ...prev,
      designFiles: [],
      designPhotoUrl: "",
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
        <h4 className="mb-2 font-semibold">Joint Design Sketch / Photos</h4>

        {sectionState.designFiles.length > 0 ? (
          <div className="space-y-4">
            {/* Preview of first file */}
            {sectionState.designPhotoUrl && (
              <div className="flex items-center gap-4">
                <img
                  src={sectionState.designPhotoUrl}
                  alt="Joint Design Photo Preview"
                  className="h-32 w-32 border object-cover rounded"
                />
                <div className="text-sm text-muted-foreground">
                  Preview of first file
                </div>
              </div>
            )}
            
            {/* File list */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Uploaded Files ({sectionState.designFiles.length})</h5>
              <div className="space-y-1">
                {sectionState.designFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFile(index)}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <ConfirmPopover
                title="Delete all files?"
                confirmText="Delete All"
                onConfirm={handleDeleteAllFiles}
                trigger={
                  <Button type="button" variant="destructive" size="sm">
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete All Files
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="design-photo" className="text-sm font-medium">
              Upload Joint Design Photos
            </Label>
            <Input
              id="design-photo"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full rounded-md border-2 border-dashed border-gray-300 p-2"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF. You can select multiple files. Max size: 5MB per file
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
