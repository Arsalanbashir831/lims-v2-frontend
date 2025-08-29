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
import { listEquipments, deleteEquipment, Equipment } from "@/lib/equipments"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export default function LabEquipmentsPage() {
  const router = useRouter()
  const [items, setItems] = useState<Equipment[]>([])
  const [query, setQuery] = useState("")

  const reload = useCallback(() => setItems(listEquipments()), [])
  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.serial ?? "").toLowerCase().includes(q) ||
      (r.status ?? "").toLowerCase().includes(q) ||
      (r.createdBy ?? "").toLowerCase().includes(q) ||
      (r.updatedBy ?? "").toLowerCase().includes(q) ||
      (r.remarks ?? "").toLowerCase().includes(q)
    )
  }, [items, query])

  const doDelete = useCallback((id: string) => {
    deleteEquipment(id)
    toast.success("Deleted")
    reload()
  }, [reload])

  const columns: ColumnDef<Equipment>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment Name" /> },
    { accessorKey: "serial", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment Serial" /> },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" /> },
    { accessorKey: "lastInternalVerificationDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Last Internal Verification Date" /> },
    { accessorKey: "internalVerificationDueDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Internal Verification Due Date" /> },
    { accessorKey: "createdBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" /> },
    { accessorKey: "updatedBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Updated By" /> },
    { accessorKey: "remarks", header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.LAB_EQUIPMENTS.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete])

  return (

    <DataTable
      columns={columns}
      data={filtered}
      empty={<span className="text-muted-foreground">No records yet</span>}
      pageSize={10}
      tableKey="lab-equipments"
      onRowClick={(row) => router.push(ROUTES.APP.LAB_EQUIPMENTS.EDIT(row.original.id))}
      toolbar={useCallback((table: TanstackTable<Equipment>) => {
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
              placeholder="Search equipments..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
              )}
              <Button asChild size="sm">
                <Link href={ROUTES.APP.LAB_EQUIPMENTS.NEW}>New Record</Link>
              </Button>
            </div>
          </div>
        )
      }, [doDelete])}
      footer={useCallback((table: TanstackTable<Equipment>) => <DataTablePagination table={table} />, [])}
    />

  )
}


