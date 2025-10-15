/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

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
      accessorKey: "date_of_test",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Test" />,
      cell: ({ row }) => {
        const dateOfTest = row.getValue("date_of_test") as string
        return (
          <div className="font-medium">
            {new Date(dateOfTest).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "identification_of_wps_pqr",
      header: ({ column }) => <DataTableColumnHeader column={column} title="WPS/PQR" />,
      cell: ({ row }) => {
        const wpsPqr = row.getValue("identification_of_wps_pqr") as string
        return (
          <div className="max-w-[150px] truncate font-medium" title={wpsPqr}>
            {wpsPqr}
          </div>
        )
      },
    },
    {
      accessorKey: "qualification_standard",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Standard" />,
      cell: ({ row }) => {
        const standard = row.getValue("qualification_standard") as string
        return (
          <div className="max-w-[150px] truncate" title={standard}>
            {standard}
          </div>
        )
      },
    },
    {
      accessorKey: "joint_type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joint Type" />,
      cell: ({ row }) => {
        const jointType = row.getValue("joint_type") as string
        return (
          <div className="max-w-[100px] truncate" title={jointType}>
            {jointType}
          </div>
        )
      },
    },
    {
      accessorKey: "weld_type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Weld Type" />,
      cell: ({ row }) => {
        const weldType = row.getValue("weld_type") as string
        return (
          <div className="max-w-[100px] truncate" title={weldType}>
            {weldType}
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
        certificate.identification_of_wps_pqr.toLowerCase().includes(searchTerm) ||
        certificate.qualification_standard.toLowerCase().includes(searchTerm) ||
        certificate.joint_type.toLowerCase().includes(searchTerm) ||
        certificate.weld_type.toLowerCase().includes(searchTerm) ||
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
