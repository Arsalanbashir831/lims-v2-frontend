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
import { equipmentService, Equipment } from "@/lib/equipments"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function LabEquipmentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: equipmentsData, isLoading, isFetching } = useQuery({
    queryKey: ['equipments', currentPage, searchQuery],
    queryFn: () => (searchQuery.trim() ? equipmentService.search(searchQuery.trim(), currentPage) : equipmentService.getAll(currentPage)),
    staleTime: 0, // Always refetch when page changes
    gcTime: 10 * 60 * 1000,
    // Remove placeholderData to ensure queries refetch when page changes
  })
  const items = equipmentsData?.results ?? []
  const totalCount = equipmentsData?.count ?? 0
  const pageSize = 20
  const hasNext = equipmentsData?.next !== undefined ? Boolean(equipmentsData?.next) : totalCount > currentPage * pageSize
  const hasPrevious = equipmentsData?.previous !== undefined ? Boolean(equipmentsData?.previous) : currentPage > 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] })
      toast.success("Deleted")
    }
  })
  const doDelete = useCallback((id: string) => {
    deleteMutation.mutate(id)
  }, [deleteMutation])

  const columns: ColumnDef<Equipment>[] = useMemo(() => [
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "equipmentName", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment Name" /> },
    { accessorKey: "equipmentSerial", header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment Serial" /> },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" /> },
    { accessorKey: "lastVerification", header: ({ column }) => <DataTableColumnHeader column={column} title="Last Verification" /> },
    { accessorKey: "verificationDue", header: ({ column }) => <DataTableColumnHeader column={column} title="Verification Due" /> },
    { accessorKey: "createdBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" /> },
    { accessorKey: "updatedBy", header: ({ column }) => <DataTableColumnHeader column={column} title="Updated By" /> },
    { accessorKey: "remarks", header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.LAB_EQUIPMENTS.EDIT(String(row.original.id))}><PencilIcon className="w-4 h-4" /></Link>
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
      pageSize={pageSize}
      tableKey="lab-equipments"
      onRowClick={(row) => router.push(ROUTES.APP.LAB_EQUIPMENTS.EDIT(String(row.original.id)))}
      toolbar={useCallback((table: TanstackTable<Equipment>) => {
        const handleSearchChange = useCallback((value: string) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }, [])

        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search equipments..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              <Button asChild size="sm">
                <Link href={ROUTES.APP.LAB_EQUIPMENTS.NEW}>New Record</Link>
              </Button>
            </div>
          </div>
        )
      }, [searchQuery])}
      footer={useCallback((table: TanstackTable<Equipment>) => (
        <ServerPagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={setCurrentPage}
          isLoading={isFetching}
        />
      ), [currentPage, totalCount, hasNext, hasPrevious, isFetching])}
    />

  )
}


