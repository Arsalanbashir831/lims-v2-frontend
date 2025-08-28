"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PqrRecord, listPqrs, deletePqr } from "@/lib/pqr"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export default function PQRPage() {
  const [items, setItems] = useState<PqrRecord[]>([])
  const [query, setQuery] = useState("")

  const reload = useCallback(() => setItems(listPqrs()), [])
  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((r) =>
      (r.contractorName ?? "").toLowerCase().includes(q) ||
      (r.pqrNo ?? "").toLowerCase().includes(q) ||
      (r.supportingPwpsNo ?? "").toLowerCase().includes(q) ||
      (r.biNumber ?? "").toLowerCase().includes(q) ||
      (r.clientEndUser ?? "").toLowerCase().includes(q)
    )
  }, [items, query])

  const doDelete = useCallback((id: string) => {
    deletePqr(id)
    toast.success("Deleted")
    reload()
  }, [reload])

  const columns: ColumnDef<PqrRecord>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "contractorName", header: ({ column }) => <DataTableColumnHeader column={column} title="Contractor Name" /> },
    { accessorKey: "pqrNo", header: ({ column }) => <DataTableColumnHeader column={column} title="PQR No." /> },
    { accessorKey: "supportingPwpsNo", header: ({ column }) => <DataTableColumnHeader column={column} title="Supporting PWPS No." /> },
    { accessorKey: "dateOfIssue", header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Issue" /> },
    { accessorKey: "dateOfWelding", header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Welding" /> },
    { accessorKey: "biNumber", header: ({ column }) => <DataTableColumnHeader column={column} title="BI #" /> },
    { accessorKey: "clientEndUser", header: ({ column }) => <DataTableColumnHeader column={column} title="Client/End User" /> },
    { accessorKey: "dateOfTesting", header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Testing" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.PQR.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete])

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filtered}
            empty={<span className="text-muted-foreground">No PQRs yet</span>}
            pageSize={10}
            tableKey="pqr"
            toolbar={useCallback((table: TanstackTable<PqrRecord>) => {
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
                    placeholder="Search PQRs..."
                    value={(table.getColumn("contractorName")?.getFilterValue() as string) ?? ""}
                    onChange={(value) => table.getColumn("contractorName")?.setFilterValue(value)}
                    className="w-full"
                    inputClassName="max-w-md"
                  />
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <DataTableViewOptions table={table} />
                    {hasSelected && (
                      <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
                    )}
                    <Button asChild size="sm">
                      <Link href={ROUTES.APP.PQR.NEW}>New PQR</Link>
                    </Button>
                  </div>
                </div>
              )
            }, [doDelete])}
            footer={useCallback((table: TanstackTable<PqrRecord>) => <DataTablePagination table={table} />, [])}
          />
        </CardContent>
      </Card>
    </div>
  )
}
