"use client"

import { useState, useMemo, useEffect } from "react"
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
import { ColumnDef, Row } from "@tanstack/react-table"
import { ROUTES } from "@/constants/routes"
import Link from "next/link"
import { useWelderTestReports, useDeleteWelderTestReport } from "@/hooks/use-welder-test-reports"
import { toast } from "sonner"

interface TestingReport {
  id: string
  welder_id: string
  welder_name: string
  iqama_number: string
  test_coupon_id: string
  date_of_inspection: string
  result_status: string
  created_at: string
  updated_at: string
}

export default function TestingReportPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isMounted, setIsMounted] = useState(false)

  // Fetch data from API
  const { data: apiData, isLoading, error } = useWelderTestReports(page, globalFilter, limit)
  const deleteMutation = useDeleteWelderTestReport()

  // Transform the API response to match the expected format
  const data = useMemo(() => {
    if (!apiData?.data) return []
    
    // Flatten the batch reports into individual welder records
    const flattenedData: TestingReport[] = []
    
    apiData.data.forEach((batchReport: {
      id: string
      results?: Array<{
        welder_id: string
        welder_name: string
        iqama_number: string
        test_coupon_id: string
        date_of_inspection: string
        result_status: string
      }>
      created_at: string
      updated_at: string
    }) => {
      if (batchReport.results && Array.isArray(batchReport.results)) {
        batchReport.results.forEach((welder) => {
          flattenedData.push({
            id: `${batchReport.id}-${welder.welder_id}`, // Create unique ID
            welder_id: welder.welder_id,
            welder_name: welder.welder_name,
            iqama_number: welder.iqama_number,
            test_coupon_id: welder.test_coupon_id,
            date_of_inspection: welder.date_of_inspection,
            result_status: welder.result_status,
            created_at: batchReport.created_at,
            updated_at: batchReport.updated_at,
          })
        })
      }
    })
    
    return flattenedData
  }, [apiData])


  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const columns: ColumnDef<TestingReport>[] = [
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
      accessorKey: "welder_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder ID" />,
      cell: ({ row }) => {
        const welderId = row.getValue("welder_id") as string
        return (
          <div className="max-w-[120px] truncate font-medium" title={welderId}>
            {welderId}
          </div>
        )
      },
    },
    {
      accessorKey: "welder_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Welder Name" />,
      cell: ({ row }) => {
        const welderName = row.getValue("welder_name") as string
        return <div className="max-w-[150px] truncate" title={welderName}>{welderName}</div>
      },
    },
    {
      accessorKey: "iqama_number",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Iqama Number" />,
      cell: ({ row }) => {
        const iqamaNumber = row.getValue("iqama_number") as string
        return (
          <div className="max-w-[120px] truncate font-medium" title={iqamaNumber}>
            {iqamaNumber}
          </div>
        )
      },
    },
    {
      accessorKey: "test_coupon_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Test Coupon ID" />,
      cell: ({ row }) => {
        const testCouponId = row.getValue("test_coupon_id") as string
        return (
          <div className="max-w-[150px] truncate font-medium" title={testCouponId}>
            {testCouponId}
          </div>
        )
      },
    },
    {
      accessorKey: "date_of_inspection",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Inspection" />,
      cell: ({ row }) => {
        const dateOfInspection = row.getValue("date_of_inspection") as string
        
        // Handle invalid or empty dates
        if (!dateOfInspection) {
          return <div className="font-medium text-muted-foreground">-</div>
        }
        
        try {
          const date = new Date(dateOfInspection)
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            return <div className="font-medium text-muted-foreground">Invalid Date</div>
          }
          
          // Use a consistent date format to avoid hydration issues
          const formattedDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
          return <div className="font-medium">{formattedDate}</div>
        } catch (error) {
          return <div className="font-medium text-muted-foreground">Invalid Date</div>
        }
      },
    },
    {
      accessorKey: "result_status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Result Status" />,
      cell: ({ row }) => {
        const resultStatus = row.getValue("result_status") as string
        
        // Handle undefined, null, or empty result status
        if (!resultStatus) {
          return (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              No Status
            </div>
          )
        }
        
        const isPass = resultStatus.toLowerCase() === 'pass'
        return (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPass
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {resultStatus}
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
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                // Extract the batch report ID from the row ID
                const batchReportId = row.original.id.split('-')[0]
                router.push(ROUTES.APP.WELDERS.TESTING_REPORTS.EDIT(batchReportId))
              }}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <ConfirmPopover
              title="Delete this testing report?"
              confirmText="Delete"
              onConfirm={async () => {
                try {
                  // Extract the batch report ID from the row ID
                  const batchReportId = row.original.id.split('-')[0]
                  await deleteMutation.mutateAsync(batchReportId)
                  toast.success("Testing report deleted successfully")
                } catch (error) {
                  toast.error("Failed to delete testing report")
                }
              }}
              trigger={
                <Button variant="destructive" size="sm" disabled={deleteMutation.isPending}>
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
      item.welder_name.toLowerCase().includes(searchTerm) ||
      item.welder_id.toLowerCase().includes(searchTerm) ||
      item.iqama_number.toLowerCase().includes(searchTerm) ||
      item.test_coupon_id.toLowerCase().includes(searchTerm) ||
      item.result_status.toLowerCase().includes(searchTerm)
    )
  }, [data, globalFilter])

  // Handle hydration - show loading until mounted
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading testing reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Failed to load testing reports</p>
          <p className="text-sm text-muted-foreground mt-1">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Show empty state if no data
  if (!isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No testing reports found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first testing report to get started
          </p>
          <Button 
            size="sm" 
            className="mt-4"
            onClick={() => router.push(ROUTES.APP.WELDERS.TESTING_REPORTS.NEW)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Testing Report
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      tableKey="operator-performance"
      onRowClick={(row) => {
        // Extract the batch report ID from the row ID
        const batchReportId = row.original.id.split('-')[0]
        router.push(ROUTES.APP.WELDERS.TESTING_REPORTS.EDIT(batchReportId))
      }}
      toolbar={(table) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = async () => {
          const ids = selected.map((r: Row<TestingReport>) => r.original.id)
          try {
            // Extract unique batch report IDs (remove duplicates)
            const batchReportIds = [...new Set(ids.map(id => id.split('-')[0]))]
            
            // Delete multiple batch reports
            await Promise.all(batchReportIds.map(batchId => deleteMutation.mutateAsync(batchId)))
            table.resetRowSelection()
            toast.success(`${batchReportIds.length} testing report batches deleted successfully`)
          } catch (error) {
            toast.error("Failed to delete some testing reports")
          }
        }
        return (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
            <FilterSearch
              placeholder="Search testing report..."
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
              <Link href={ROUTES.APP.WELDERS.TESTING_REPORTS.NEW}>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Testing Report
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
