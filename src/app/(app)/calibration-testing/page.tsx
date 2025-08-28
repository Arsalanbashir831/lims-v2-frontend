"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { listCalibrationTests, deleteCalibrationTest, CalibrationTest } from "@/lib/calibration-testing"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export default function CalibrationTestingPage() {
  const [items, setItems] = useState<CalibrationTest[]>([])

  const reload = useCallback(() => setItems(listCalibrationTests()), [])
  useEffect(() => { reload() }, [])


  const doDelete = useCallback((id: string) => {
    deleteCalibrationTest(id)
    toast.success("Deleted")
    reload()
  }, [reload])

  const columns: ColumnDef<CalibrationTest>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />
      ),
      cell: ({ row }) => (
        <Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
      ),
      meta: { className: "w-fit min-w-fit px-4" },
      enableSorting: false,
      enableHiding: false,
    },
    { id: "serial", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "equipmentName", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment/Instrument Name" /> },
    { accessorKey: "equipmentSerial", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment Serial #" /> },
    { accessorKey: "vendor", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Vendor" /> },
    { accessorKey: "calibrationDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Date" /> },
    { accessorKey: "calibrationDueDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Due Date" /> },
    { accessorKey: "certification", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Certification" /> },
    { accessorKey: "createdBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Created by" /> },
    { accessorKey: "updatedBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Updated by" /> },
    { accessorKey: "remarks", header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.CALIBRATION_TESTING.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete])

  return (
    <div className="grid gap-4">
          <DataTable
            columns={columns}
            data={items}
            empty={<span className="text-muted-foreground">No records yet</span>}
            pageSize={10}
            tableKey="calibration-testing"
            toolbar={useCallback((table: TanstackTable<CalibrationTest>) => {
              const selected = table.getSelectedRowModel().rows
              const hasSelected = selected.length > 0
              const onBulkDelete = () => {
                const ids = selected.map(r => r.original.id)
                ids.forEach(id => doDelete(id))
                table.resetRowSelection()
              }
              return (
                <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                  <FilterSearch
                    placeholder="Search equipment..."
                    value={(table.getColumn("equipmentName")?.getFilterValue() as string) ?? ""}
                    onChange={(value) => table.getColumn("equipmentName")?.setFilterValue(value)}
                    className="w-full"
                    inputClassName="max-w-md"
                  />
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <DataTableViewOptions table={table} />
                    {hasSelected && (
                      <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
                    )}
                    <Button asChild size="sm">
                      <Link href={ROUTES.APP.CALIBRATION_TESTING.NEW}>New Record</Link>
                    </Button>
                  </div>
                </div>
              )
            }, [doDelete])}
            footer={useCallback((table: TanstackTable<CalibrationTest>) => <DataTablePagination table={table} />, [])}
          />
    </div>
  )
}


