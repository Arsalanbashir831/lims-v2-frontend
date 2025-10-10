"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon, ChevronDown } from "lucide-react"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type ColumnType = "input" | "label" | "date" | "numeric" | "textarea"

export interface DynamicColumn {
  id: string
  header: string
  accessorKey: string
  type: ColumnType
  placeholder?: string
  isNumeric?: boolean
}

export interface DynamicRow {
  id: string
  [key: string]: string | number | boolean | undefined
}

interface DynamicTableProps {
  initialColumns: DynamicColumn[]
  initialData: DynamicRow[]
  onColumnsChange: (columns: DynamicColumn[]) => void
  onDataChange: (data: DynamicRow[]) => void
  allowAddRow?: boolean
  allowAddColumn?: boolean
  allowDeleteColumn?: boolean
  readOnly?: boolean
  className?: string
}

export function DynamicTable({
  initialColumns,
  initialData,
  onColumnsChange,
  onDataChange,
  allowAddRow = true,
  allowAddColumn = true,
  allowDeleteColumn = true,
  readOnly = false,
  className,
}: DynamicTableProps) {
  const [columns, setColumns] = useState<DynamicColumn[]>(initialColumns)
  const [data, setData] = useState<DynamicRow[]>(initialData)

  // inline editing state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ rowId: string; accessorKey: string } | null>(null)

  // add column by name dialog
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [addColumnTarget, setAddColumnTarget] = useState<{ mode: "before" | "after" | null; targetColumnId: string | null }>({ mode: null, targetColumnId: null })

  const openAddColumnDialog = useCallback((mode: "before" | "after" | null, targetColumnId: string | null) => {
    setAddColumnTarget({ mode, targetColumnId })
    setIsAddColumnDialogOpen(true)
  }, [])

  const performAddNamedColumn = useCallback(() => {
    const name = newColumnName.trim()
    if (!name) return
    const base = name.toLowerCase().replace(/\s+/g, "_")
    const colId = `${base}_${Date.now()}`
    const newColumn: DynamicColumn = {
      id: colId,
      header: name,
      accessorKey: colId,
      type: "input",
      placeholder: "Enter value",
    }

    let newColumns: DynamicColumn[]
    if (addColumnTarget.mode && addColumnTarget.targetColumnId) {
      const idx = columns.findIndex(c => c.id === addColumnTarget.targetColumnId)
      if (idx >= 0) {
        const insertIndex = addColumnTarget.mode === "before" ? idx : idx + 1
        newColumns = [
          ...columns.slice(0, insertIndex),
          newColumn,
          ...columns.slice(insertIndex),
        ]
      } else {
        newColumns = [...columns, newColumn]
      }
    } else {
      newColumns = [...columns, newColumn]
    }

    const newData = data.map(row => ({ ...row, [newColumn.accessorKey]: "" })) as DynamicRow[]

    setColumns(newColumns)
    setData(newData)
    onColumnsChange(newColumns)
    onDataChange(newData)

    setNewColumnName("")
    setIsAddColumnDialogOpen(false)
    setAddColumnTarget({ mode: null, targetColumnId: null })
  }, [newColumnName, addColumnTarget, columns, data, onColumnsChange, onDataChange])

  const handleColumnDelete = useCallback((columnId: string) => {
    const columnToDelete = columns.find(col => col.id === columnId)
    if (!columnToDelete) return

    const newColumns = columns.filter(col => col.id !== columnId)
    setColumns(newColumns)
    onColumnsChange(newColumns)

    const newData = data.map(row => {
      const { [columnToDelete.accessorKey]: _, ...rest } = row
      return rest as DynamicRow
    })
    setData(newData)
    onDataChange(newData)
  }, [columns, data, onColumnsChange, onDataChange])

  const handleColumnUpdate = useCallback((columnId: string, field: keyof DynamicColumn, value: string | number | boolean) => {
    const newColumns = columns.map(col => col.id === columnId ? { ...col, [field]: value } : col)
    setColumns(newColumns)
    onColumnsChange(newColumns)
  }, [columns, onColumnsChange])

  const handleRowAdd = useCallback((afterRowId?: string) => {
    const newRow: DynamicRow = { id: `row_${Date.now()}` }
    columns.forEach(col => { newRow[col.accessorKey] = "" })

    let newData: DynamicRow[]
    if (afterRowId) {
      const insertIndex = data.findIndex(row => row.id === afterRowId)
      newData = [
        ...data.slice(0, insertIndex + 1),
        newRow,
        ...data.slice(insertIndex + 1),
      ]
    } else {
      newData = [...data, newRow]
    }

    setData(newData)
    onDataChange(newData)
  }, [columns, data, onDataChange])

  const handleRowDelete = useCallback((rowId: string) => {
    const newData = data.filter(row => row.id !== rowId)
    setData(newData)
    onDataChange(newData)
  }, [data, onDataChange])

  const handleCellChange = useCallback((rowId: string, accessorKey: string, value: string | number | boolean) => {
    const newData = data.map(row => row.id === rowId ? { ...row, [accessorKey]: value } : row)
    setData(newData)
    onDataChange(newData)
  }, [data, onDataChange])

  // handlers for inline editing
  const saveColumnHeader = useCallback((columnId: string, value: string) => {
    handleColumnUpdate(columnId, "header", value)
    setEditingColumnId(null)
  }, [handleColumnUpdate])

  const cancelColumnHeader = useCallback(() => setEditingColumnId(null), [])

  const saveLabelCell = useCallback((rowId: string, accessorKey: string, value: string) => {
    handleCellChange(rowId, accessorKey, value)
    setEditingCell(null)
  }, [handleCellChange])

  const cancelLabelCell = useCallback(() => setEditingCell(null), [])

  return (
    <Card className={cn("p-0 rounded-none", className)}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column) => (
                  <th key={column.id} className="border-r p-2 text-left text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {editingColumnId === column.id ? (
                        <Input
                          autoFocus
                          defaultValue={column.header}
                          onBlur={(e) => saveColumnHeader(column.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveColumnHeader(column.id, (e.target as HTMLInputElement).value)
                            if (e.key === "Escape") cancelColumnHeader()
                          }}
                          className="h-6 text-sm font-medium border-0 p-0 bg-transparent"
                        />
                      ) : (
                        <span
                          className="text-sm font-medium select-none"
                          onDoubleClick={() => setEditingColumnId(column.id)}
                          title="Double click to edit column name"
                        >
                          {column.header}
                        </span>
                      )}

                      {allowAddColumn && !readOnly && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              title="Column options"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => openAddColumnDialog("before", column.id)}>Add column before</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAddColumnDialog("after", column.id)}>Add column after</DropdownMenuItem>
                            {allowDeleteColumn && !readOnly && column.type !== "label" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleColumnDelete(column.id)} className="text-red-600">Delete column</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </th>
                ))}
                {allowAddRow && !readOnly && (
                  <th className="w-16 p-2">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  {columns.map((column) => (
                    <td key={column.id} className="border-r p-0">
                      {column.type === "label" ? (
                        editingCell && editingCell.rowId === row.id && editingCell.accessorKey === column.accessorKey ? (
                          <Input
                            autoFocus
                            defaultValue={String(row[column.accessorKey] ?? "")}
                            onBlur={(e) => saveLabelCell(row.id, column.accessorKey, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveLabelCell(row.id, column.accessorKey, (e.target as HTMLInputElement).value)
                              if (e.key === "Escape") cancelLabelCell()
                            }}
                            className="border-0 px-2 py-0.5 rounded-none h-auto text-sm"
                            placeholder={column.placeholder}
                          />
                        ) : (
                          <div
                            className="px-3 py-2 text-sm font-medium text-muted-foreground select-none"
                            onDoubleClick={() => setEditingCell({ rowId: row.id, accessorKey: column.accessorKey })}
                            title="Double click to edit"
                          >
                            {row[column.accessorKey] ?? column.header}
                          </div>
                        )
                      ) : column.type === "date" ? (
                        <Input
                          type="date"
                          value={String(row[column.accessorKey] || "")}
                          onChange={(e) => handleCellChange(row.id, column.accessorKey, e.target.value)}
                          className="border-0 px-2 py-0.5 rounded-none h-auto text-sm"
                          placeholder={column.placeholder}
                          disabled={readOnly}
                        />
                      ) : column.type === "numeric" ? (
                        <Input
                          type="number"
                          value={String(row[column.accessorKey] || "")}
                          onChange={(e) => handleCellChange(row.id, column.accessorKey, e.target.value)}
                          className="border-0 px-2 py-0.5 rounded-none h-auto text-sm"
                          placeholder={column.placeholder}
                          disabled={readOnly}
                        />
                      ) : (
                        <Input
                          type="text"
                          value={String(row[column.accessorKey] || "")}
                          onChange={(e) => handleCellChange(row.id, column.accessorKey, e.target.value)}
                          className="border-0 px-2 py-0.5 rounded-none h-auto text-sm"
                          placeholder={column.placeholder}
                          disabled={readOnly}
                        />
                      )}
                    </td>
                  ))}
                  {allowAddRow && !readOnly && (
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => handleRowAdd(row.id)}
                          title="Add row after"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                        <ConfirmPopover
                          title="Delete this row?"
                          confirmText="Delete"
                          onConfirm={() => handleRowDelete(row.id)}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              title="Delete row"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Enter the name for the new column. It will be added {addColumnTarget.mode ? `${addColumnTarget.mode} the selected column` : "to the end"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-column-name-modal" className="col-span-1 text-right">Name</Label>
              <Input id="new-column-name-modal" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} className="col-span-3" placeholder="e.g., Observations" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={performAddNamedColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
