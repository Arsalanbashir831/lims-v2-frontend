"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, PencilIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { Welder } from "@/lib/schemas/welder"
import { useWelders, useDeleteWelder } from "@/hooks/use-welders"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import Link from "next/link"
import { toast } from "sonner"
import { AdvancedSearch } from "@/components/common"

export default function WeldersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  
  // Use React Query hooks
  const { data: weldersData, isLoading, error } = useWelders(page, searchQuery, 10)
  const deleteWelder = useDeleteWelder()

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteWelder.mutateAsync(id)
      toast.success("Welder deleted successfully!")
    } catch (error) {
      console.error("Failed to delete welder:", error)
      toast.error("Failed to delete welder. Please try again.")
    }
  }, [deleteWelder])

  const toolbar = useCallback((table: TanstackTable<Welder>) => {
    const selected = table.getSelectedRowModel().rows
    const hasSelected = selected.length > 0
    const onBulkDelete = () => {
      const ids = selected.map(r => r.original.id!)
      ids.forEach(id => handleDelete(id))
      table.resetRowSelection()
    }
    return (
      <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
      <AdvancedSearch
          onSearch={setSearchQuery}
          isLoading={isLoading}
          placeholder="Search by Operator Name, Operator ID, Iqama/Passport..."
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DataTableViewOptions table={table} />
          {hasSelected && (
            <ConfirmPopover
              title={`Delete ${selected.length} selected welder(s)?`}
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
            <Link href={ROUTES.APP.WELDERS.WELDER_NEW}>
              <Plus className="mr-2 h-4 w-4" />
              Add Welder
            </Link>
          </Button>
        </div>
      </div>
    )
  }, [handleDelete, searchQuery])

  const footer = useCallback((table: TanstackTable<Welder>) => <DataTablePagination table={table} />, [])

  const columns: ColumnDef<Welder>[] = useMemo(() => [
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
      enableHiding: false,
    },
    {
      id: "rowNumber",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      meta: { className: "w-fit min-w-fit px-4" },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const welder = row.original
        return (
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {welder.profile_image_url ? (
              <img
                src={process.env.NEXT_PUBLIC_BACKEND_URL + welder.profile_image_url}
                alt={welder.operator_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-xs">No Photo</span>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "operator_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operator Name" />,
      cell: ({ row }) => {
        const operatorName = row.getValue("operator_name") as string
        return (
          <div className="max-w-[200px] truncate font-medium" title={operatorName}>
            {operatorName}
          </div>
        )
      },
    },
    {
      accessorKey: "operator_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operator ID" />,
      cell: ({ row }) => {
        const operatorId = row.getValue("operator_id") as string
        return (
          <div className="max-w-[100px] truncate font-medium" title={operatorId}>
            {operatorId}
          </div>
        )
      },
    },
    {
      accessorKey: "iqama",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Iqama/Passport" />,
      cell: ({ row }) => {
        const iqama = row.getValue("iqama") as string
        return (
          <div className="max-w-[150px] truncate" title={iqama}>
            {iqama}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.WELDERS.WELDER_EDIT(row.original.id!)}>
              <PencilIcon className="w-4 h-4" />
            </Link>
          </Button>
          <ConfirmPopover
            title="Delete this welder?"
            confirmText="Delete"
            onConfirm={() => handleDelete(row.original.id!)}
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            }
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [handleDelete])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Loading welders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error loading welders</h1>
        <p className="text-muted-foreground">Failed to load welders. Please try again.</p>
      </div>
    )
  }

  const welders = weldersData?.results || []

  return (
    <DataTable
      columns={columns}
      data={welders}
      empty={<span className="text-muted-foreground">No welders found. Create your first welder to get started.</span>}
      pageSize={10}
      tableKey="welders"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.WELDER_EDIT(row.original.id!))}
      toolbar={toolbar}
      footer={footer}
    />
  )
}
