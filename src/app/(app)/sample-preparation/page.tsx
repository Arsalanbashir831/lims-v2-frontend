"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { samplePreparationService } from "@/lib/sample-preparation-new"
import { SamplePreparationResponse } from "@/lib/schemas/sample-preparation"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"

export default function SamplePreparationPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  const { data, error, isFetching } = useQuery({
    queryKey: ['sample-preparations', currentPage, searchQuery],
    queryFn: () => searchQuery
      ? samplePreparationService.search(searchQuery, currentPage)
      : samplePreparationService.getAll(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  })

  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Sample preparation fetch error:', error)
      toast.error("Failed to load sample preparations")
    }
  }, [error])

  const items = data?.results ?? []
  const totalCount = data?.count ?? 0
  const pageSize = 20
  const hasNext = data?.next !== undefined ? Boolean(data?.next) : totalCount > currentPage * pageSize
  const hasPrevious = data?.previous !== undefined ? Boolean(data?.previous) : currentPage > 1

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: samplePreparationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-preparations'] })
      toast.success("Sample preparation deleted successfully")
    },
    onError: (error) => {
      console.error("Delete error:", error)
      toast.error("Failed to delete sample preparation")
    },
  })

  const doDelete = useCallback((id: string) => {
    deleteMutation.mutate(id)
  }, [deleteMutation])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const columns: ColumnDef<SamplePreparationResponse>[] = useMemo(() => [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      meta: { className: "w-fit min-w-fit px-4" },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "job_id",
      id: "job", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />, 
      cell: ({ row }) => <span className="font-medium">{row.original.job_id}</span>
    },
    {
      accessorKey: "project_name",
      id: "project", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, 
      cell: ({ row }) => <span className="max-w-[200px] truncate">{row.original.project_name}</span>
    },
    {
      accessorKey: "client_name",
      id: "client", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, 
      cell: ({ row }) => <span className="max-w-[150px] truncate">{row.original.client_name}</span>
    },
    {
      accessorKey: "request_no",
      id: "requestNo", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />, 
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.request_no}</span>
    },
    {
      accessorKey: "no_of_request_items",
      id: "totalSamples", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total no. of Samples" />, 
      cell: ({ row }) => <span className="text-center">{row.original.no_of_request_items}</span>
    },
    {
      accessorKey: "specimen_ids",
      id: "specimenIds", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Specimen IDs" />, 
      cell: ({ row }) => <span className="text-center">{row.original.specimen_ids.join(", ")}</span>
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request Date" />, 
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.SAMPLE_PREPARATION.EDIT(row.original.id)}>
              <PencilIcon className="w-4 h-4" />
            </Link>
          </Button>
          <ConfirmPopover
            title="Delete this sample preparation?"
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
      enableSorting: false,
      enableHiding: false,
    },
  ], [doDelete])

  // Define toolbar and footer callbacks outside of JSX
  const toolbar = useCallback((table: TanstackTable<SamplePreparationResponse>) => {
    return (
      <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
        <FilterSearch
          placeholder="Search sample preparations..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full"
          inputClassName="max-w-md"
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DataTableViewOptions table={table} />
          <Button asChild size="sm">
            <Link href={ROUTES.APP.SAMPLE_PREPARATION.NEW}>New Preparation</Link>
          </Button>
        </div>
      </div>
    )
  }, [searchQuery, handleSearchChange])

  const footer = useCallback((table: TanstackTable<SamplePreparationResponse>) => (
    <ServerPagination
      currentPage={currentPage}
      totalCount={totalCount}
      pageSize={20}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      onPageChange={handlePageChange}
      isLoading={isFetching}
    />
  ), [currentPage, totalCount, hasNext, hasPrevious, handlePageChange, isFetching])

  return (
    <DataTable
      columns={columns}
      data={items}
      empty={<span className="text-muted-foreground">No sample preparations yet</span>}
      pageSize={20}
      tableKey="sample-preparation"
      onRowClick={(row) => {
        router.push(ROUTES.APP.SAMPLE_PREPARATION.EDIT(row.original.id))
      }}
      toolbar={toolbar}
      footer={footer}
    />
  )
}


