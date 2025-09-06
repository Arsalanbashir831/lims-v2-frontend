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
import { completeCertificateService, type CompleteCertificate } from "@/lib/complete-certificates"
import { toast } from "sonner"
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"

export default function TestReportsPage() {
  const [items, setItems] = useState<CompleteCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      const response = searchQuery.trim() 
        ? await completeCertificateService.search(searchQuery, currentPage)
        : await completeCertificateService.getAll(currentPage)
      setItems(response.results)
    } catch (error) {
      console.error("Failed to load certificates:", error)
      toast.error("Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, currentPage])
  
  useEffect(() => { 
    reload()
  }, [reload])

  const doDelete = useCallback(async (id: string) => {
    try {
      await completeCertificateService.delete(id)
      toast.success("Certificate deleted successfully")
      reload()
    } catch (error) {
      console.error("Failed to delete certificate:", error)
      toast.error("Failed to delete certificate")
    }
  }, [reload])

  const columns: ColumnDef<CompleteCertificate>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "gripco_ref_no", header: ({ column }) => <DataTableColumnHeader column={column} title="Report #" /> },
    { accessorKey: "request_id", header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" /> },
    { accessorKey: "project_name", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" /> },
    { accessorKey: "client_name", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" /> },
    { id: "items", header: ({ column }) => <DataTableColumnHeader column={column} title="# Items" />, cell: ({ row }) => row.original.certificate_items_json?.length ?? 0 },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${ROUTES.APP.TEST_REPORTS.EDIT(row.original.request_id)}`}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${ROUTES.APP.TEST_REPORTS.VIEW(row.original.request_id)}`}><EyeIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this certificate?" confirmText="Delete" onConfirm={() => doDelete(row.original.request_id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return (
    <DataTable
      columns={columns}
      data={items}
      empty={<span className="text-muted-foreground">No certificates yet</span>}
      pageSize={10}
      tableKey="complete-certificates"
      onRowClick={(row) => router.push(ROUTES.APP.TEST_REPORTS.VIEW(row.original.request_id))}
      toolbar={useCallback((table: TanstackTable<CompleteCertificate>) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = async () => {
          const ids = selected.map(r => r.original.request_id)
          try {
            await Promise.all(ids.map(id => completeCertificateService.delete(id)))
            toast.success(`${ids.length} certificates deleted successfully`)
            table.resetRowSelection()
            reload()
          } catch (error) {
            console.error("Failed to delete certificates:", error)
            toast.error("Failed to delete certificates")
          }
        }
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover title={`Delete ${selected.length} selected certificate(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
              )}
              <Button asChild size="sm">
                <Link href={ROUTES.APP.TEST_REPORTS.NEW}>New Certificate</Link>
              </Button>
            </div>
          </div>
        )
      }, [doDelete, searchQuery, handleSearchChange, reload])}
      footer={useCallback((table: TanstackTable<CompleteCertificate>) => <DataTablePagination table={table} />, [])}
    />

  )
}


