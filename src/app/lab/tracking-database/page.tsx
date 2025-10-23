"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { ColumnDef, Table } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { FilterSearch } from "@/components/ui/filter-search"
import { AdvancedSearch } from "@/components/tracking/advanced-search"
import { Button } from "@/components/ui/button"
import { transformJobToTrackingRow, type TrackingRow } from "@/services/tracking.service"
import { TrackingDrawer } from "@/components/tracking/tracking-drawer"
import { useJobs, useJobsSearch, useJobsWithCertificates } from "@/hooks/use-jobs"
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

  // Use jobs API with certificates and request numbers
  const { data: jobsResponse, isLoading, error } = useJobsWithCertificates({ page: currentPage, limit: 20 })

  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('Jobs fetch error:', error)
      toast.error("Failed to load tracking data")
    }
  }, [error])

  const data = useMemo(() => {
    if (!jobsResponse?.data) return []
    let transformedData = jobsResponse.data.map(transformJobToTrackingRow)
    
    // Apply client-side filtering if there's a search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase()
      
      transformedData = transformedData.filter((item: TrackingRow) => {
        const jobIdMatch = item.sampleId?.toLowerCase().includes(searchTerm) || false
        const projectMatch = item.projectName?.toLowerCase().includes(searchTerm) || false
        const clientMatch = item.clientName?.toLowerCase().includes(searchTerm) || false
        const requestMatch = item.requestNo?.toLowerCase().includes(searchTerm) || false
        const certificateMatch = item.certificateId?.toLowerCase().includes(searchTerm) || false

        // Also try searching for individual words in the query
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0)
        let wordMatch = false

        if (searchWords.length > 1) {
          // If multiple words, check if any word matches any field
          wordMatch = searchWords.some(word => 
            item.sampleId?.toLowerCase().includes(word) ||
            item.projectName?.toLowerCase().includes(word) ||
            item.clientName?.toLowerCase().includes(word) ||
            item.requestNo?.toLowerCase().includes(word) ||
            item.certificateId?.toLowerCase().includes(word)
          )
        }

        const isMatch = jobIdMatch || projectMatch || clientMatch || requestMatch || certificateMatch || wordMatch
        return isMatch
      })
    }
    
    return transformedData
  }, [jobsResponse, searchQuery])

  const totalCount = data.length
  const pageSize = 20
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)
  const hasNext = endIndex < totalCount
  const hasPrevious = currentPage > 1

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handleAdvancedSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const columns: ColumnDef<TrackingRow>[] = [
    { accessorKey: "sampleId", header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />, cell: ({ row }) => row.original.sampleId },
    { accessorKey: "projectName", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, cell: ({ row }) => <div className="truncate max-w-[240px]" title={row.original.projectName}>{row.original.projectName}</div> },
    { accessorKey: "clientName", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, cell: ({ row }) => row.original.clientName },
    { accessorKey: "requestNo", header: ({ column }) => <DataTableColumnHeader column={column} title="Request No" />, cell: ({ row }) => row.original.requestNo || "N/A" },
    { accessorKey: "certificateId", header: ({ column }) => <DataTableColumnHeader column={column} title="Certificate ID" />, cell: ({ row }) => row.original.certificateId || "N/A" },
    { accessorKey: "itemsCount", header: ({ column }) => <DataTableColumnHeader column={column} title="Sample Lots" />, cell: ({ row }) => row.original.itemsCount },
    { accessorKey: "receivedDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Received Date" />, cell: ({ row }) => row.original.receivedDate },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   cell: ({ row }) => (
    //     <Link href={ROUTES.APP.SAMPLE_INFORMATION.EDIT(row.original.id)}>
    //     <Button
    //       variant="outline"
    //       size="sm"
    //     >
    //       View
    //     </Button>
    //     </Link>
    //   ),
    // },
  ]

  // Define toolbar and footer callbacks outside of JSX
  const toolbar = useCallback((table: Table<TrackingRow>) => {
    return (
      <div className="flex flex-col md:flex-row items-center gap-10 w-full">
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          isLoading={isLoading}
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>
    )
  }, [handleAdvancedSearch, isLoading])

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
        data={paginatedData}
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


