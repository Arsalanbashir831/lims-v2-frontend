"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { samplePreparationService, SamplePreparation } from "@/lib/sample-preparation"
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

  const columns: ColumnDef<SamplePreparation>[] = useMemo(() => [
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
      cell: ({ row }) => {
        // Handle both list and detail response formats
        if ('job_id' in row.original) {
          return <span className="font-medium">{row.original.job_id}</span>
        }
        return <span className="font-medium">{row.original.job || '-'}</span>
      },
      sortingFn: (rowA, rowB) => {
        const aValue = 'job_id' in rowA.original ? rowA.original.job_id : rowA.original.job || ''
        const bValue = 'job_id' in rowB.original ? rowB.original.job_id : rowB.original.job || ''
        return aValue.localeCompare(bValue)
      }
    },
    {
      accessorKey: "job_project_name",
      id: "project", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, 
      cell: ({ row }) => {
        // Handle both list and detail response formats
        if ('job_project_name' in row.original) {
          return <span className="max-w-[200px] truncate">{row.original.job_project_name}</span>
        }
        return <span className="max-w-[200px] truncate">-</span>
      },
      sortingFn: (rowA, rowB) => {
        const aValue = 'job_project_name' in rowA.original ? rowA.original.job_project_name : ''
        const bValue = 'job_project_name' in rowB.original ? rowB.original.job_project_name : ''
        return aValue.localeCompare(bValue)
      }
    },
    {
      id: "client", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, 
      cell: ({ row }) => {
        // Handle both list and detail response formats
        if ('client_name' in row.original && row.original.client_name) {
          return <span className="max-w-[150px] truncate">{String(row.original.client_name)}</span>
        }
        return <span className="max-w-[150px] truncate">-</span>
      },
      sortingFn: (rowA, rowB) => {
        const aValue = 'client_name' in rowA.original && rowA.original.client_name ? String(rowA.original.client_name) : ''
        const bValue = 'client_name' in rowB.original && rowB.original.client_name ? String(rowB.original.client_name) : ''
        return aValue.localeCompare(bValue)
      }
    },
    {
      accessorKey: "request_id",
      id: "requestNo", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />, 
      cell: ({ row }) => {
        // Handle both list and detail response formats
        if ('request_id' in row.original) {
          return <span className="font-mono text-sm">{row.original.request_id}</span>
        }
        return <span className="font-mono text-sm">-</span>
      },
      sortingFn: (rowA, rowB) => {
        const aValue = 'request_id' in rowA.original ? rowA.original.request_id : ''
        const bValue = 'request_id' in rowB.original ? rowB.original.request_id : ''
        return aValue.localeCompare(bValue)
      }
    },
    {
      accessorKey: "test_items_count",
      id: "totalSamples", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total no. of Samples" />, 
      cell: ({ row }) => {
        // Handle both list and detail response formats
        if ('test_items_count' in row.original) {
          return <span className="text-center">{row.original.test_items_count}</span>
        }
        return <span className="text-center">{row.original.test_items?.length || 0}</span>
      },
      sortingFn: (rowA, rowB) => {
        const aValue = 'test_items_count' in rowA.original ? rowA.original.test_items_count : (rowA.original.test_items?.length || 0)
        const bValue = 'test_items_count' in rowB.original ? rowB.original.test_items_count : (rowB.original.test_items?.length || 0)
        return aValue - bValue
      }
    },
    {
      accessorKey: "total_specimens",
      id: "specimenIds", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Specimen IDs" />, 
      cell: ({ row }) => {
        // Handle both list and detail response formats
        if ('total_specimens' in row.original) {
          return <span className="text-center">Total: {row.original.total_specimens}</span>
        }
        if (row.original.test_items) {
          const ids = Array.from(new Set(row.original.test_items.flatMap(i => i.specimens.map(s => s.specimen_id)))).filter(Boolean)
          const preview = ids.slice(0, 5).join(", ")
          return ids.length > 5 ? `${preview} +${ids.length - 5}` : (preview || "-")
        }
        return "-"
      },
      sortingFn: (rowA, rowB) => {
        const aValue = 'total_specimens' in rowA.original ? rowA.original.total_specimens : (rowA.original.test_items?.flatMap(i => i.specimens).length || 0)
        const bValue = 'total_specimens' in rowB.original ? rowB.original.total_specimens : (rowB.original.test_items?.flatMap(i => i.specimens).length || 0)
        return aValue - bValue
      }
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request Date" />, 
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => {
        // Handle both list and detail response formats for ID
        const recordId = 'request_id' in row.original ? row.original.request_id : row.original.id
        
        return (
          <div className="text-right space-x-2 inline-flex">
            <Button variant="secondary" size="sm" asChild>
              <Link href={ROUTES.APP.SAMPLE_PREPARATION.EDIT(recordId)}>
                <PencilIcon className="w-4 h-4" />
              </Link>
            </Button>
            <ConfirmPopover
              title="Delete this sample preparation?"
              confirmText="Delete"
              onConfirm={() => doDelete(recordId)}
              trigger={
                <Button variant="destructive" size="sm">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [doDelete])

  // Define toolbar and footer callbacks outside of JSX
  const toolbar = useCallback((table: TanstackTable<SamplePreparation>) => {
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

  const footer = useCallback((table: TanstackTable<SamplePreparation>) => (
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
        const recordId = 'request_id' in row.original ? row.original.request_id : row.original.id
        router.push(ROUTES.APP.SAMPLE_PREPARATION.EDIT(recordId))
      }}
      toolbar={toolbar}
      footer={footer}
    />
  )
}


