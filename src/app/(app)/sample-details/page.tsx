"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { sampleDetailService } from "@/lib/sample-details"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ConfirmPopover } from "@/components/ui/confirm-popover"

export default function SampleDetailsPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['sample-details', currentPage, searchQuery],
    queryFn: () => searchQuery 
      ? sampleDetailService.search(searchQuery, currentPage)
      : sampleDetailService.getAll(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: sampleDetailService.delete,
    onSuccess: () => {
      toast.success("Sample detail deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete sample detail")
    },
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        // Invalidate and refetch data
        window.location.reload() // Simple refresh for now
      }
    })
  }

  const formatTestMethods = (testMethods: any[]) => {
    if (!testMethods || testMethods.length === 0) return "None"
    if (testMethods.length <= 2) {
      return testMethods.map(tm => tm.name).join(", ")
    }
    return `${testMethods.slice(0, 2).map(tm => tm.name).join(", ")} +${testMethods.length - 2} more`
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "indexNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
      cell: ({ row }) => <span className="font-medium">{row.original.indexNo}</span>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => <span className="max-w-[200px] truncate">{row.original.description}</span>,
    },
    {
      accessorKey: "sampleInformationId",
      header: "Sample Info ID",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.sampleInformationId}</span>,
    },
    {
      accessorKey: "mtcNo",
      header: "MTC No",
      cell: ({ row }) => <span>{row.original.mtcNo || "N/A"}</span>,
    },
    {
      accessorKey: "sampleType",
      header: "Sample Type",
      cell: ({ row }) => <span>{row.original.sampleType || "N/A"}</span>,
    },
    {
      accessorKey: "materialType",
      header: "Material Type",
      cell: ({ row }) => <span>{row.original.materialType || "N/A"}</span>,
    },
    {
      accessorKey: "heatNo",
      header: "Heat No",
      cell: ({ row }) => <span>{row.original.heatNo || "N/A"}</span>,
    },
    {
      accessorKey: "storageLocation",
      header: "Storage Location",
      cell: ({ row }) => <span>{row.original.storageLocation || "N/A"}</span>,
    },
    {
      accessorKey: "condition",
      header: "Condition",
      cell: ({ row }) => <span>{row.original.condition || "N/A"}</span>,
    },
    {
      accessorKey: "testMethods",
      header: "Test Methods",
      cell: ({ row }) => <span className="max-w-[150px] truncate">{formatTestMethods(row.original.testMethods)}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(ROUTES.APP.SAMPLE_DETAILS.EDIT(row.original.id))}
          >
            Edit
          </Button>
          <ConfirmPopover
            trigger={
              <Button variant="outline" size="sm">
                Delete
              </Button>
            }
            onConfirm={() => handleDelete(row.original.id)}
            title="Delete Sample Detail"
            description="Are you sure you want to delete this sample detail? This action cannot be undone."
          />
        </div>
      ),
    },
  ]

  if (error) {
    return <div className="p-6">Error loading sample details: {error.message}</div>
  }

  const items = data?.results || []
  const totalCount = data?.count || 0
  const hasNext = Boolean(data?.next)
  const hasPrevious = Boolean(data?.previous)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sample Details</h1>
          <p className="text-muted-foreground">
            Manage individual sample details and test methods for each sample item.
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.APP.SAMPLE_DETAILS.NEW)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sample Detail
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <FilterSearch
          placeholder="Search sample details..."
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pageSize={20}
        tableKey="sample-details"
        footer={(table) => (
          <ServerPagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={20}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}
      />
    </div>
  )
}
