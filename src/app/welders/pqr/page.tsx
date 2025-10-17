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
import { toast } from "sonner"
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { savePqrForm } from "@/lib/pqr-form-store"
import { useRouter } from "next/navigation"
import { usePQRs, useDeletePQR } from "@/hooks/use-pqr"
import { PQR } from "@/services/pqr.service"

export default function PQRPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  // Use the PQR hooks
  const { data: pqrResponse, isLoading, error } = usePQRs(page, query, limit)
  const deletePQRMutation = useDeletePQR()

  const items = pqrResponse?.data || []

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((r) =>
      (r.basic_info?.qualified_by ?? "").toLowerCase().includes(q) ||
      (r.basic_info?.pqr_number ?? "").toLowerCase().includes(q) ||
      (r.welder_info?.operator_name ?? "").toLowerCase().includes(q) ||
      (r.welder_info?.operator_id ?? "").toLowerCase().includes(q) ||
      (r.basic_info?.approved_by ?? "").toLowerCase().includes(q)
    )
  }, [items, query])

  const doDelete = useCallback(async (id: string) => {
    try {
      await deletePQRMutation.mutateAsync(id)
      toast.success("PQR deleted successfully")
    } catch (error) {
      console.error("Failed to delete PQR:", error)
      toast.error("Failed to delete PQR")
    }
  }, [deletePQRMutation])

  const columns: ColumnDef<PQR>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { 
      id: "pqr_number", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="PQR No." />,
      cell: ({ row }) => row.original.basic_info?.pqr_number || "-"
    },
    { 
      id: "qualified_by", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Qualified By" />,
      cell: ({ row }) => row.original.basic_info?.qualified_by || "-"
    },
    { 
      id: "approved_by", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Approved By" />,
      cell: ({ row }) => row.original.basic_info?.approved_by || "-"
    },
    { 
      id: "date_qualified", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date Qualified" />,
      cell: ({ row }) => row.original.basic_info?.date_qualified || "-"
    },
    { 
      id: "welder_name", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder Name" />,
      cell: ({ row }) => row.original.welder_info?.operator_name || "-"
    },
    { 
      id: "type", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => row.original.type || "-"
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.WELDERS.PQR.VIEW(row.original.id)}><EyeIcon className="w-4 h-4" /></Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.WELDERS.PQR.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this PQR?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete])

  const toolbarCallback = useCallback((table: TanstackTable<PQR>) => {
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
          value={query}
          onChange={setQuery}
          className="w-full"
          inputClassName="max-w-md"
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DataTableViewOptions table={table} />
          {hasSelected && (
            <ConfirmPopover title={`Delete ${selected.length} selected PQR(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
          )}
          <Button asChild size="sm">
            <Link href={ROUTES.APP.WELDERS.PQR.NEW}>New PQR</Link>
          </Button>
        </div>
      </div>
    )
  }, [doDelete, query])

  const footerCallback = useCallback((table: TanstackTable<PQR>) => <DataTablePagination table={table} />, [])

  // Handle loading and error states after all hooks
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading PQRs...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">Error loading PQRs: {error.message}</div>
  }

  return (
    <DataTable
      columns={columns}
      data={filtered}
      empty={<span className="text-muted-foreground">No PQRs found</span>}
      pageSize={limit}
      tableKey="pqr"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.PQR.VIEW(row.original.id))}
      toolbar={toolbarCallback}
      footer={footerCallback}
    />
  )
}
