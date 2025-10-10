"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { ColumnDef, Table } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { FilterSearch } from "@/components/ui/filter-search"
import { Button } from "@/components/ui/button"
import { transformJobToTrackingRow, type TrackingRow } from "@/services/tracking.service"
import { TrackingDrawer } from "@/components/tracking/tracking-drawer"
import { useJobs, useJobsSearch } from "@/hooks/use-jobs"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"

export default function TrackingDatabasePage() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TrackingRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Use jobs API with search functionality and pagination
  const { data: jobsResponse, isLoading, error } = searchQuery.trim() 
    ? useJobsSearch(searchQuery.trim(), { page: currentPage, limit: 20 })
    : useJobs({ page: currentPage, limit: 20 })

  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Jobs fetch error:', error)
      toast.error("Failed to load tracking data")
    }
  }, [error])

  const data = useMemo(() => {
    if (!jobsResponse?.data) return []
    return jobsResponse.data.map(transformJobToTrackingRow)
  }, [jobsResponse])

  const totalCount = jobsResponse?.pagination?.total_records ?? 0
  const pageSize = 20
  const hasNext = jobsResponse?.pagination?.has_next ?? false
  const hasPrevious = currentPage > 1

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const columns: ColumnDef<TrackingRow>[] = [
    { accessorKey: "sampleId", header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />, cell: ({ row }) => row.original.sampleId },
    { accessorKey: "projectName", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, cell: ({ row }) => <div className="truncate max-w-[240px]" title={row.original.projectName}>{row.original.projectName}</div> },
    { accessorKey: "clientName", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, cell: ({ row }) => row.original.clientName },
    { accessorKey: "itemsCount", header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />, cell: ({ row }) => row.original.itemsCount },
    { accessorKey: "receivedDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Received Date" />, cell: ({ row }) => row.original.receivedDate },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={ROUTES.APP.SAMPLE_INFORMATION.EDIT(row.original.id)}>
        <Button
          variant="outline"
          size="sm"
        >
          View
        </Button>
        </Link>
      ),
    },
  ]

  // Define toolbar and footer callbacks outside of JSX
  const toolbar = useCallback((table: Table<TrackingRow>) => {
    return (
      <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
        <FilterSearch
          placeholder="Search by Job ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full"
          inputClassName="max-w-md"
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>
    )
  }, [searchQuery, handleSearchChange])

  const footer = useCallback((table: Table<TrackingRow>) => (
    <ServerPagination
      currentPage={currentPage}
      totalCount={totalCount}
      pageSize={20}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      onPageChange={handlePageChange}
      isLoading={isLoading}
    />
  ), [currentPage, totalCount, hasNext, hasPrevious, handlePageChange, isLoading])

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Error loading tracking data</p>
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        tableKey="tracking-db"
        bodyMaxHeightClassName="max-h-[65vh]"
        empty={<span className="text-muted-foreground">No tracking data found</span>}
        toolbar={toolbar}
        footer={footer}
        onRowClick={(row) => { setSelected(row.original); setOpen(true) }}
      />

      <TrackingDrawer open={open} onOpenChange={setOpen} row={selected} />
    </>
  )
}


