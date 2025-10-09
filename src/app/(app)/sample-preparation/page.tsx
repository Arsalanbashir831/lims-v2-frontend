"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { samplePreparationService } from "@/lib/sample-preparation-new"
import { SamplePreparationResponse } from "@/lib/schemas/sample-preparation"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"
import { formatDateSafe } from "@/utils/hydration-fix"
import { AdvancedSearch } from "@/components/sample-preparation/advanced-search"
import { SamplePrepDrawer } from "@/components/sample-preparation/sample-prep-drawer"

export default function SamplePreparationPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    jobId: "",
    clientName: "",
    projectName: "",
    specimenId: "",
    dateFrom: "",
    dateTo: ""
  })
  const [selectedSamplePrepId, setSelectedSamplePrepId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Fetch data
  const { data, error, isFetching } = useQuery({
    queryKey: ['sample-preparations', currentPage, searchFilters],
    queryFn: () => {
      const hasFilters = Object.values(searchFilters).some(value => value.trim() !== "")
      if (hasFilters) {
        return samplePreparationService.search(searchFilters.query, currentPage, {
          jobId: searchFilters.jobId,
          clientName: searchFilters.clientName,
          projectName: searchFilters.projectName,
          specimenId: searchFilters.specimenId,
          dateFrom: searchFilters.dateFrom,
          dateTo: searchFilters.dateTo
        })
      }
      return samplePreparationService.getAll(currentPage)
    },
    staleTime: 0, // Always refetch when page changes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

  const handleSearch = useCallback((filters: typeof searchFilters) => {
    setSearchFilters(filters)
    setCurrentPage(1)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchFilters({
      query: "",
      jobId: "",
      clientName: "",
      projectName: "",
      specimenId: "",
      dateFrom: "",
      dateTo: ""
    })
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleRowClick = useCallback((row: { original: SamplePreparationResponse }) => {
    setSelectedSamplePrepId(row.original.id)
    setIsDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedSamplePrepId(null)
  }, [])

  const columns: ColumnDef<SamplePreparationResponse>[] = useMemo(() => [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => (currentPage - 1) * pageSize + row.index + 1,
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
      cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{row.original.project_name}</div>
    },
    {
      accessorKey: "client_name",
      id: "client", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, 
      cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{row.original.client_name}</div>
    },
    {
      accessorKey: "request_no",
      id: "requestNo", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />, 
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.request_no}</span>
    },
    {
      accessorKey: "no_of_request_items",
      id: "totalItems", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Items" />, 
      cell: ({ row }) => <span className="text-center">{row.original.no_of_request_items}</span>
    },
    {
      accessorKey: "specimen_ids",
      id: "specimenIds", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Specimen IDs" />, 
      cell: ({ row }) => {
        const specimenIds = row.original.specimen_ids || []
        if (specimenIds.length === 0) {
          return <span className="text-muted-foreground">No specimens</span>
        }
        if (specimenIds.length <= 3) {
          return <div className="text-sm">{specimenIds.join(", ")}</div>
        }
        return (
          <span className="text-sm">
            {specimenIds.slice(0, 3).join(", ")}... (+{specimenIds.length - 3} more)
          </span>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request Date" />, 
      cell: ({ row }) => {
        const formattedDate = formatDateSafe(row.original.created_at)
        return formattedDate ? <span>{formattedDate}</span> : <span className="text-muted-foreground">Invalid Date</span>
      }
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
  ], [doDelete, currentPage, pageSize])

  // Define toolbar and footer callbacks outside of JSX
  const toolbar = useCallback((table: TanstackTable<SamplePreparationResponse>) => {
    return (
      <div className="flex items-center gap-2 w-full justify-end">
        <DataTableViewOptions table={table} />
        <Button asChild size="sm">
          <Link href={ROUTES.APP.SAMPLE_PREPARATION.NEW}>New Preparation</Link>
        </Button>
      </div>
    )
  }, [])

  const footer = useCallback((_table: TanstackTable<SamplePreparationResponse>) => (
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
    <div className="space-y-4">
      <AdvancedSearch
        onSearch={handleSearch}
        onClear={handleClearSearch}
        isLoading={isFetching}
      />
      <DataTable
        columns={columns}
        data={items}
        empty={<span className="text-muted-foreground">No sample preparations yet</span>}
        pageSize={20}
        tableKey="sample-preparation"
        onRowClick={handleRowClick}
        toolbar={toolbar}
        footer={footer}
        className="h-[calc(100vh-16rem)]"
      />
      
      <SamplePrepDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        samplePrepId={selectedSamplePrepId}
      />
    </div>
  )
}


