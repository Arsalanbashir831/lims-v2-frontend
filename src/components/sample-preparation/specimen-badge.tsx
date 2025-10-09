"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { CheckIcon, XIcon, EditIcon } from "lucide-react"
import { toast } from "sonner"

interface SpecimenBadgeProps {
  specimen: {
    id?: string
    specimen_id: string
    isFromInitialData?: boolean // Flag to indicate if this specimen is from initial data
  }
  onDelete: (specimenId: string, isFromInitialData?: boolean) => void
  onUpdate: (specimenId: string, newSpecimenId: string, isFromInitialData?: boolean) => void
  disabled?: boolean
}

export function SpecimenBadge({ specimen, onDelete, onUpdate, disabled = false }: SpecimenBadgeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(specimen.specimen_id)

  const handleEdit = () => {
    if (disabled) return
    setIsEditing(true)
    setEditValue(specimen.specimen_id)
  }

  const handleSave = () => {
    if (editValue.trim() === specimen.specimen_id) {
      setIsEditing(false)
      return
    }

    if (!editValue.trim()) {
      toast.error("Specimen ID cannot be empty")
      return
    }

    if (!specimen.id) {
      toast.error("Specimen ID not found")
      return
    }

    onUpdate(specimen.id, editValue.trim(), specimen.isFromInitialData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(specimen.specimen_id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <div className="relative">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md border-0 focus-visible:ring-1 focus-visible:ring-ring min-w-[60px] max-w-[120px]"
            autoFocus
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleSave}
        >
          <CheckIcon className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleCancel}
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Badge
        variant="secondary"
        className="cursor-pointer hover:bg-secondary/80 transition-colors"
        onDoubleClick={handleEdit}
        title="Double-click to edit"
      >
        {specimen.specimen_id}
      </Badge>
      {!disabled && (
        <ConfirmPopover
          title="Delete specimen ID?"
          description={`Are you sure you want to delete specimen ID "${specimen.specimen_id}"?`}
          confirmText="Delete"
          onConfirm={() => onDelete(specimen.id || specimen.specimen_id, specimen.isFromInitialData)}
          trigger={
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          }
        />
      )}
    </div>
  )
}
