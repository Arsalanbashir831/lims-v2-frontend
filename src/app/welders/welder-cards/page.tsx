"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { ROUTES } from "@/constants/routes"
import { WelderCard } from "@/lib/schemas/welder"
import { useWelderCards, useDeleteWelderCard } from "@/hooks/use-welder-cards"
import Link from "next/link"
import { toast } from "sonner"


export default function WelderCardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  
  // Use React Query hooks
  const { data: welderCardsData, isLoading, error } = useWelderCards(page, searchQuery, 10)
  const deleteWelderCard = useDeleteWelderCard()

  const columns: ColumnDef<WelderCard>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "serialNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Serial No" />,
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
    {
      accessorKey: "card_no",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Card No" />,
      cell: ({ row }) => {
        const cardNo = row.getValue("card_no") as string
        return (
          <div className="max-w-[150px] truncate font-medium" title={cardNo}>
            {cardNo}
          </div>
        )
      },
    },
    {
      accessorKey: "company",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => {
        const company = row.getValue("company") as string
        return (
          <div className="max-w-[200px] truncate" title={company}>
            {company}
          </div>
        )
      },
    },
    {
      id: "welder_name",
      accessorFn: (row) => row.welder_info?.operator_name || "N/A",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder Name" />,
      cell: ({ row }) => {
        const welderName = row.getValue("welder_name") as string
        return (
          <div className="max-w-[150px] truncate" title={welderName}>
            {welderName}
          </div>
        )
      },
    },
    {
      id: "welder_id",
      accessorFn: (row) => row.welder_info?.operator_id || "N/A",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder ID" />,
      cell: ({ row }) => {
        const welderId = row.getValue("welder_id") as string
        return (
          <div className="max-w-[100px] truncate" title={welderId}>
            {welderId}
          </div>
        )
      },
    },
    {
      accessorKey: "authorized_by",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Authorized By" />,
      cell: ({ row }) => {
        const authorizedBy = row.getValue("authorized_by") as string
        return (
          <div className="max-w-[150px] truncate" title={authorizedBy}>
            {authorizedBy}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string
        const date = new Date(createdAt).toLocaleDateString()
        return (
          <div className="max-w-[100px] truncate" title={date}>
            {date}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleDelete = async () => {
          if (!row.original.id) return
          try {
            await deleteWelderCard.mutateAsync(row.original.id)
            toast.success("Welder card deleted successfully!")
          } catch (error) {
            console.error("Failed to delete welder card:", error)
            toast.error("Failed to delete welder card. Please try again.")
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.EDIT(row.original.id!)}>
                <PencilIcon className="w-4 h-4" />
              </Link>
            </Button>
            <ConfirmPopover 
              title="Delete this welder card?" 
              confirmText="Delete" 
              onConfirm={handleDelete} 
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
      size: 100,
    },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Loading welder cards...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error loading welder cards</h1>
        <p className="text-muted-foreground">Failed to load welder cards. Please try again.</p>
      </div>
    )
  }

  const welderCards = welderCardsData?.results || []

  return (
    <DataTable
      data={welderCards}
      columns={columns}
      tableKey="welder-cards"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.WELDER_CARDS.VIEW(row.original.id!))}
      toolbar={(table) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = async () => {
          const ids = selected.map((r: any) => r.original.id)
          try {
            await Promise.all(ids.map(id => deleteWelderCard.mutateAsync(id)))
            toast.success(`${ids.length} welder cards deleted successfully!`)
            table.resetRowSelection()
          } catch (error) {
            console.error("Failed to delete welder cards:", error)
            toast.error("Failed to delete welder cards. Please try again.")
          }
        }
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search welder cards..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover
                  title={`Delete ${selected.length} selected welder card(s)?`}
                  confirmText="Delete"
                  onConfirm={onBulkDelete}
                  trigger={
                    <Button variant="destructive" size="sm">
                      Delete selected ({selected.length})
                    </Button>
                  }
                />
              )}
              <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.NEW}>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Welder Card
                </Button>
              </Link>
            </div>
          </div>
        )
      }}
      footer={(table) => (
        <DataTablePagination table={table} />
      )}
    />
  )
}
