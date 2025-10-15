"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { SamplePreparationResponse } from "@/lib/schemas/sample-preparation"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { FilterSearch } from "@/components/ui/filter-search"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"
import { formatDateSafe } from "@/utils/hydration-fix"
import { SamplePrepDrawer } from "@/components/sample-preparation/sample-prep-drawer"
import { useSamplePreparations, useDeleteSamplePreparation } from "@/hooks/use-sample-preparations"

export default function SamplePreparationPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSamplePrepId, setSelectedSamplePrepId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Use the new hooks
  const { data, error, isFetching } = useSamplePreparations(currentPage, searchQuery)
  const deleteMutation = useDeleteSamplePreparation()

  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      toast.error("Failed to load sample preparations")
    }
  }, [error])

  const items = data?.data ?? []
  const totalCount = data?.total ?? 0
  const pageSize = 20
  const hasNext = totalCount > currentPage * pageSize
  const hasPrevious = currentPage > 1

  const doDelete = useCallback((id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Sample preparation deleted successfully")
      },
      onError: (error) => {
        console.error("Delete error:", error)
        toast.error("Failed to delete sample preparation")
      },
    })
  }, [deleteMutation])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
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
      cell: ({ row }) => {
        const firstSampleLot = row.original.sample_lots?.[0]
        return <span className="font-medium">{firstSampleLot?.job_id || 'N/A'}</span>
      }
    },
    {
      accessorKey: "project_name",
      id: "project",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
      cell: ({ row }) => {
        const firstSampleLot = row.original.sample_lots?.[0]
        return <div className="font-medium truncate max-w-[28ch]">{firstSampleLot?.project_name || 'N/A'}</div>
      }
    },
    {
      accessorKey: "client_name",
      id: "client",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
      cell: ({ row }) => {
        const firstSampleLot = row.original.sample_lots?.[0]
        return <div className="font-medium truncate max-w-[28ch]">{firstSampleLot?.client_name || 'N/A'}</div>
      }
    },
    {
      accessorKey: "request_no",
      id: "requestNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.request_no}</span>
    },
    {
      accessorKey: "sample_lots_count",
      id: "totalItems",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Items" />,
      cell: ({ row }) => <span className="text-center">{row.original.sample_lots_count}</span>
    },
    {
      accessorKey: "specimens",
      id: "specimenIds",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Specimen IDs" />,
      cell: ({ row }) => {
        // Get all specimens from all sample lots
        const allSpecimens = row.original.sample_lots?.flatMap(lot => lot.specimens || []) || []
        const specimenIds = allSpecimens.map(spec => spec.specimen_id)

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
      <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
        <FilterSearch
          placeholder="Search by Request #..."
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
    <>
      <DataTable
        columns={columns}
        data={items}
        empty={<span className="text-muted-foreground">No sample preparations yet</span>}
        pageSize={20}
        tableKey="sample-preparation"
        onRowClick={handleRowClick}
        toolbar={toolbar}
        footer={footer}
      />

      <SamplePrepDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        samplePrepId={selectedSamplePrepId}
      />
    </>
  )
}


