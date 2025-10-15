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
import { useOperatorCertificates, useDeleteOperatorCertificate } from "@/hooks/use-operator-certificates"
import { toast } from "sonner"

interface OperatorPerformance {
  id: string
  issuedIn: string
  certificateNumber: string
  operatorId: string
  operatorName: string
  clientName: string
}

// Transform API data to table format
const transformApiDataToTable = (apiData: Array<Record<string, unknown>>): OperatorPerformance[] => {
  return apiData.map(item => ({
    id: item.id,
    issuedIn: item.date_of_issue 
      ? new Date(item.date_of_issue).getFullYear().toString() 
      : item.date_of_welding 
        ? new Date(item.date_of_welding).getFullYear().toString()
        : new Date(item.created_at).getFullYear().toString(),
    certificateNumber: item.welder_card_info?.card_no || item.law_name || "N/A",
    operatorId: item.welder_card_info?.welder_info?.operator_id || "N/A",
    operatorName: item.welder_card_info?.welder_info?.operator_name || item.tested_by || "N/A",
    clientName: item.welder_card_info?.company || item.witnessed_by || "N/A"
  }))
}

export default function OperatorPerformancePage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  
  // Use API hooks
  const { data: apiData, isLoading, error } = useOperatorCertificates(1, globalFilter, 10)
  const deleteOperatorCertificate = useDeleteOperatorCertificate()
  
  // Transform API data for table
  const data = useMemo(() => {
    if (!apiData?.results) return []
    return transformApiDataToTable(apiData.results)
  }, [apiData])

  const columns: ColumnDef<OperatorPerformance>[] = [
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
      accessorKey: "issuedIn",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issued In" />,
      cell: ({ row }) => {
        const issuedIn = row.getValue("issuedIn") as string
        return <div className="font-medium">{issuedIn}</div>
      },
    },
    {
      accessorKey: "certificateNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Certificate No" />,
      cell: ({ row }) => {
        const certificateNumber = row.getValue("certificateNumber") as string
        return (
          <div className="max-w-[150px] truncate font-medium" title={certificateNumber}>
            {certificateNumber}
          </div>
        )
      },
    },
    {
      accessorKey: "operatorId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operator ID" />,
      cell: ({ row }) => {
        const operatorId = row.getValue("operatorId") as string
        return (
          <div className="max-w-[120px] truncate font-medium" title={operatorId}>
            {operatorId}
          </div>
        )
      },
    },
    {
      accessorKey: "operatorName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operator Name" />,
      cell: ({ row }) => {
        const operatorName = row.getValue("operatorName") as string
        return <div className="max-w-[150px] truncate" title={operatorName}>{operatorName}</div>
      },
    },
    {
      accessorKey: "clientName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name" />,
      cell: ({ row }) => {
        const clientName = row.getValue("clientName") as string
        return <div className="max-w-[200px] truncate" title={clientName}>{clientName}</div>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.EDIT(row.original.id)}>
                <PencilIcon className="w-4 h-4" />
              </Link>
            </Button>
            <ConfirmPopover
              title="Delete this certificate?"
              confirmText="Delete"
              onConfirm={async () => {
                try {
                  await deleteOperatorCertificate.mutateAsync(row.original.id)
                  toast.success("Operator performance certificate deleted successfully")
                } catch (error) {
                  console.error('Failed to delete certificate:', error)
                  toast.error("Failed to delete operator performance certificate")
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
    const searchTerm = globalFilter.toLowerCase()
    return data.filter((item) =>
      item.operatorName.toLowerCase().includes(searchTerm) ||
      item.certificateNumber.toLowerCase().includes(searchTerm) ||
      item.operatorId.toLowerCase().includes(searchTerm) ||
      item.clientName.toLowerCase().includes(searchTerm) ||
      item.issuedIn.toLowerCase().includes(searchTerm)
    )
  }, [data, globalFilter])

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      tableKey="operator-performance"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.VIEW(row.original.id))}
      toolbar={(table) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = async () => {
          const ids = selected.map((r) => r.original.id)
          try {
            // Delete each certificate via API
            await Promise.all(ids.map(id => deleteOperatorCertificate.mutateAsync(id)))
            table.resetRowSelection()
            toast.success(`${ids.length} operator performance certificate(s) deleted successfully`)
          } catch (error) {
            console.error('Failed to delete certificates:', error)
            toast.error("Failed to delete operator performance certificates")
          }
        }
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search operator performance..."
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
                  trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>}
                />
              )}
              <Link href={ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.NEW}>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Certificate
                </Button>
              </Link>
            </div>
          </div>
        )
      }}
      footer={(table) => <DataTablePagination table={table} />}
    />
  )
}
