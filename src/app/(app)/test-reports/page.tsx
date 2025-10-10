"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { useTestReports, useDeleteTestReport } from "@/hooks/use-test-reports"
import { type TestReport } from "@/services/test-reports.service"
import { toast } from "sonner"
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"

export default function TestReportsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const { data, error, isFetching } = useTestReports(currentPage, searchQuery)
  const deleteMutation = useDeleteTestReport()

  const doDelete = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Test report deleted successfully")
    } catch (error) {
      console.error("Failed to delete test report:", error)
      toast.error("Failed to delete test report")
    }
  }, [deleteMutation])

  const columns: ColumnDef<TestReport>[] = useMemo(() => [
    { 
      id: "select", 
      header: ({ table }) => (
        <Checkbox 
          className="size-4" 
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} 
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} 
          aria-label="Select all" 
        />
      ), 
      cell: ({ row }) => (
        <Checkbox 
          className="size-4" 
          checked={row.getIsSelected()} 
          onCheckedChange={(v) => row.toggleSelected(!!v)} 
          aria-label="Select row" 
        />
      ), 
      meta: { className: "w-fit min-w-fit px-4" }, 
      enableSorting: false, 
      enableHiding: false 
    },
    { 
      id: "rowNumber", 
      header: "S.No", 
      cell: ({ row }) => row.index + 1, 
      meta: { className: "w-fit min-w-fit px-4" }, 
      enableSorting: false, 
      enableHiding: false 
    },
    { 
      accessorKey: "certificate_id", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Certificate ID" /> 
    },
    { 
      accessorKey: "request_info.request_no", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request No" />,
      cell: ({ row }) => row.original.request_info?.request_no || "N/A"
    },
    { 
      accessorKey: "customers_name_no", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> 
    },
    { 
      accessorKey: "customer_po", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="PO" /> 
    },
    { 
      accessorKey: "issue_date", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issue Date" /> 
    },
    { 
      id: "specimens_count", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Specimens" />,
      cell: ({ row }) => row.original.request_info?.total_specimens || 0,
      accessorFn: (row) => row.request_info?.total_specimens || 0
    },
    { 
      id: "sample_lots_count", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sample Lots" />,
      cell: ({ row }) => row.original.request_info?.sample_lots_count || 0,
      accessorFn: (row) => row.request_info?.sample_lots_count || 0
    },
    { 
      id: "test_methods", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Test Methods" />,
      cell: ({ row }) => {
        const testMethods = row.original.request_info?.sample_lots?.map(lot => lot.test_method?.test_name).filter(Boolean) || []
        return testMethods.length > 0 ? testMethods.join(', ') : 'N/A'
      },
      accessorFn: (row) => row.request_info?.sample_lots?.map(lot => lot.test_method?.test_name).filter(Boolean).join(', ') || 'N/A'
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.TEST_REPORTS.EDIT(row.original.id)}>
              <PencilIcon className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.TEST_REPORTS.VIEW(row.original.id)}>
              <EyeIcon className="w-4 h-4" />
            </Link>
          </Button>
          <ConfirmPopover 
            title="Delete this test report?" 
            confirmText="Delete" 
            onConfirm={() => doDelete(row.original.id)} 
            trigger={
              <Button variant="destructive" size="sm">
                <TrashIcon className="w-4 h-4" />
              </Button>
            } 
          />
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

  const items = data?.data || []
  const totalCount = data?.total || 0

  return (
    <DataTable
      columns={columns}
      data={items}
      empty={<span className="text-muted-foreground">No test reports yet</span>}
      pageSize={10}
      tableKey="test-reports"
      onRowClick={(row) => router.push(ROUTES.APP.TEST_REPORTS.VIEW(row.original.id))}
      toolbar={useCallback((table: TanstackTable<TestReport>) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        
        const onBulkDelete = async () => {
          const ids = selected.map(r => r.original.id)
          try {
            await Promise.all(ids.map(id => deleteMutation.mutateAsync(id)))
            toast.success(`${ids.length} test reports deleted successfully`)
            table.resetRowSelection()
          } catch (error) {
            console.error("Failed to delete test reports:", error)
            toast.error("Failed to delete test reports")
          }
        }
        
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search by certificate ID, customer, PO, or request no..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover 
                  title={`Delete ${selected.length} selected test report(s)?`} 
                  confirmText="Delete" 
                  onConfirm={onBulkDelete} 
                  trigger={
                    <Button variant="destructive" size="sm">
                      Delete selected ({selected.length})
                    </Button>
                  } 
                />
              )}
              <Button asChild size="sm">
                <Link href={ROUTES.APP.TEST_REPORTS.NEW}>New Test Report</Link>
              </Button>
            </div>
          </div>
        )
      }, [deleteMutation, searchQuery, handleSearchChange])}
      footer={useCallback((table: TanstackTable<TestReport>) => <DataTablePagination table={table} />, [])}
    />
  )
}