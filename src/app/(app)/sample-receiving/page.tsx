"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { listSampleReceivings, deleteSampleReceiving, SampleReceiving } from "@/lib/sample-receiving"
import { toast } from "sonner"
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/constants/routes"

export default function SampleReceivingPage() {
  const [items, setItems] = useState<SampleReceiving[]>([])
  const router = useRouter()

  const reload = useCallback(() => setItems(listSampleReceivings()), [])
  useEffect(() => { reload() }, [])


  const doDelete = useCallback((id: string) => {
    deleteSampleReceiving(id)
    toast.success("Deleted")
    reload()
  }, [reload])

  const columns: ColumnDef<SampleReceiving>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "sampleId", header: ({ column }) => <DataTableColumnHeader column={column} title="Sample ID" /> },
    { accessorKey: "projectName", header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" /> },
    { accessorKey: "clientName", header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name" /> },
    { accessorKey: "endUser", header: ({ column }) => <DataTableColumnHeader column={column} title="End User" /> },
    { accessorKey: "receiveDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Receive Date" /> },
    { accessorKey: "numItems", header: ({ column }) => <DataTableColumnHeader column={column} title="# Items" /> },
    { accessorKey: "storageLocation", header: ({ column }) => <DataTableColumnHeader column={column} title="Storage Location" /> },
    { accessorKey: "remarks", header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.SAMPLE_RECEIVING.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
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
        empty={<span className="text-muted-foreground">No samples yet</span>}
        pageSize={10}
        tableKey="sample-receiving"
        onRowClick={(row) => router.push(ROUTES.APP.SAMPLE_RECEIVING.EDIT(row.original.id))}
        toolbar={useCallback((table: TanstackTable<SampleReceiving>) => {
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
                placeholder="Search samples..."
                value={(table.getColumn("projectName")?.getFilterValue() as string) ?? ""}
                onChange={(value) => table.getColumn("projectName")?.setFilterValue(value)}
                className="w-full"
                inputClassName="max-w-md"
              />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <DataTableViewOptions table={table} />
                {hasSelected && (
                  <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
                )}
                <Button asChild size="sm">
                  <Link href={ROUTES.APP.SAMPLE_RECEIVING.NEW}>New Sample</Link>
                </Button>
              </div>
            </div>
          )
        }, [doDelete])}
        footer={useCallback((table: TanstackTable<SampleReceiving>) => <DataTablePagination table={table} />, [])}
      />
    </div>
  )
}
