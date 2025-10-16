"use client"

import { useState, useMemo } from "react"
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
import Link from "next/link"
import { useWelderCertificates, useDeleteWelderCertificate } from "@/hooks/use-welder-certificates"
import { WelderCertificate } from "@/lib/schemas/welder"
import { toast } from "sonner"


export default function WelderQualificationPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  
  // Use API hooks
  const { data: welderCertificatesData, isLoading, error } = useWelderCertificates(1, globalFilter, 50)
  const deleteWelderCertificate = useDeleteWelderCertificate()
  
  const data = welderCertificatesData?.results || []

  const columns: ColumnDef<WelderCertificate>[] = [
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
      accessorKey: "certificate_no",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Certificate No" />,
      cell: ({ row }) => {
        const certificateNo = row.getValue("certificate_no") as string
        return (
          <div className="max-w-[150px] truncate font-medium" title={certificateNo}>
            {certificateNo || "N/A"}
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
          <div className="max-w-[150px] truncate font-medium" title={company}>
            {company || "N/A"}
          </div>
        )
      },
    },
    {
      id: "card_no",
      accessorFn: (row) => row.welder_card_info?.card_no || "N/A",
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
      id: "operator_id",
      accessorFn: (row) => row.welder_card_info?.welder_info?.operator_id || "N/A",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operator ID" />,
      cell: ({ row }) => {
        const operatorId = row.getValue("operator_id") as string
        return (
          <div className="max-w-[120px] truncate font-medium" title={operatorId}>
            {operatorId}
          </div>
        )
      },
    },
    {
      id: "operator_name",
      accessorFn: (row) => row.welder_card_info?.welder_info?.operator_name || "N/A",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operator Name" />,
      cell: ({ row }) => {
        const operatorName = row.getValue("operator_name") as string
        return (
          <div className="max-w-[150px] truncate" title={operatorName}>
            {operatorName}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issue Date" />,
      cell: ({ row }) => {
        const dateOfTest = row.getValue("created_at") as string
        return (
          <div className="max-w-[120px] truncate font-medium" title={dateOfTest}>
            {new Date(dateOfTest).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={ROUTES.APP.WELDERS.WELDER_QUALIFICATION.EDIT(row.original.id)}>
                <PencilIcon className="w-4 h-4" />
              </Link>
            </Button>
            <ConfirmPopover 
              title="Delete this certificate?" 
              confirmText="Delete" 
              onConfirm={async () => {
                try {
                  await deleteWelderCertificate.mutateAsync(row.original.id!)
                  toast.success("Welder qualification certificate deleted successfully!")
                } catch (error) {
                  console.error("Failed to delete welder qualification certificate:", error)
                  toast.error("Failed to delete welder qualification certificate. Please try again.")
                }
              }} 
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

  const filteredData = useMemo(() => {
    if (!globalFilter) return data

    return data.filter((certificate) => {
      const searchTerm = globalFilter.toLowerCase()
      return (
        certificate.certificate_no?.toLowerCase().includes(searchTerm) ||
        certificate.welder_card_info?.card_no?.toLowerCase().includes(searchTerm) ||
        certificate.welder_card_info?.welder_info?.operator_id?.toLowerCase().includes(searchTerm) ||
        certificate.welder_card_info?.welder_info?.operator_name?.toLowerCase().includes(searchTerm) ||
        certificate.date_of_test.toLowerCase().includes(searchTerm)
      )
    })
  }, [data, globalFilter])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Loading welder qualification certificates...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Failed to load certificates</h1>
        <p className="text-muted-foreground">There was an error loading the welder qualification certificates.</p>
      </div>
    )
  }

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      tableKey="welder-qualification"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.WELDER_QUALIFICATION.VIEW(row.original.id!))}
      toolbar={(table) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = async () => {
          const ids = selected.map((r) => r.original.id)
          try {
            await Promise.all(ids.map(id => deleteWelderCertificate.mutateAsync(id)))
            toast.success(`${ids.length} welder qualification certificate(s) deleted successfully!`)
            table.resetRowSelection()
          } catch (error) {
            console.error("Failed to delete welder qualification certificates:", error)
            toast.error("Failed to delete some welder qualification certificates. Please try again.")
          }
        }
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search certificates..."
              value={globalFilter}
              onChange={setGlobalFilter}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover
                  title={`Delete ${selected.length} selected certificate(s)?`}
                  confirmText="Delete"
                  onConfirm={onBulkDelete}
                  trigger={
                    <Button variant="destructive" size="sm">
                      Delete selected ({selected.length})
                    </Button>
                  }
                />
              )}
              <Link href={ROUTES.APP.WELDERS.WELDER_QUALIFICATION.NEW}>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Certificate
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
