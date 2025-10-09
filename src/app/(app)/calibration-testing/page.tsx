"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { calibrationTestService, CalibrationTest } from "@/services/calibration-testing.service"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export default function CalibrationTestingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: ctData, isLoading, isFetching } = useQuery({
    queryKey: ['calibration-tests', currentPage, searchQuery],
    queryFn: () => (searchQuery.trim() ? calibrationTestService.search(searchQuery.trim(), currentPage) : calibrationTestService.getAll(currentPage)),
    staleTime: 0, // Always refetch when page changes
    gcTime: 10 * 60 * 1000,
    // Remove placeholderData to ensure queries refetch when page changes
  })

  const items = ctData?.results ?? []
  const totalCount = ctData?.count ?? 0
  const pageSize = 20
  const hasNext = ctData?.next !== undefined ? Boolean(ctData?.next) : totalCount > currentPage * pageSize
  const hasPrevious = ctData?.previous !== undefined ? Boolean(ctData?.previous) : currentPage > 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calibrationTestService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calibration-tests'] })
      toast.success("Deleted")
    }
  })
  const doDelete = useCallback((id: string) => { deleteMutation.mutate(id) }, [deleteMutation])

  const columns: ColumnDef<CalibrationTest>[] = useMemo(() => [
    { id: "serial", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "equipmentName", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment/Instrument Name" /> },
    { accessorKey: "equipmentSerial", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment Serial #" /> },
    { accessorKey: "calibrationVendor", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Vendor" /> },
    { accessorKey: "calibrationDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Date" /> },
    { accessorKey: "calibrationDueDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Due Date" /> },
    { accessorKey: "calibrationCertification", header: ({ column }) => <DataTableColumnHeader column={column} title="Calibration Certification" /> },
    { accessorKey: "createdBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Created by" /> },
    { accessorKey: "updatedBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Updated by" /> },
    { accessorKey: "remarks", header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.CALIBRATION_TESTING.EDIT(String(row.original.id))}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete])

  return (

    <DataTable
      columns={columns}
      data={items}
      empty={<span className="text-muted-foreground">No records yet</span>}
      pageSize={20}
      tableKey="calibration-testing"
      onRowClick={(row) => router.push(ROUTES.APP.CALIBRATION_TESTING.EDIT(String(row.original.id)))}
      toolbar={useCallback((table: TanstackTable<CalibrationTest>) => {
        const handleSearchChange = useCallback((value: string) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }, [])

        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              <Button asChild size="sm">
                <Link href={ROUTES.APP.CALIBRATION_TESTING.NEW}>New Record</Link>
              </Button>
            </div>
          </div>
        )
      }, [searchQuery])}
      footer={useCallback((table: TanstackTable<CalibrationTest>) => (
        <ServerPagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={20}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={setCurrentPage}
          isLoading={isFetching}
        />
      ), [currentPage, totalCount, hasNext, hasPrevious, isFetching])}
    />
  )
}


