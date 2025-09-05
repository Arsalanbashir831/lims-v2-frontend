"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { sampleDetailService } from "@/lib/sample-details"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"

export default function SampleDetailsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")

    // Fetch data
    const { data, error, isFetching } = useQuery({
        queryKey: ['sample-details', currentPage, searchQuery],
        queryFn: () => searchQuery
            ? sampleDetailService.search(searchQuery, currentPage)
            : sampleDetailService.getAll(currentPage),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        placeholderData: (previousData) => previousData,
    })

    // Handle errors with useEffect
    useEffect(() => {
        if (error) {
            console.error('Sample details fetch error:', error)
            toast.error("Failed to load sample details")
        }
    }, [error])

    const items = data?.results ?? []
    const totalCount = data?.count ?? 0
    const pageSize = 20
    const hasNext = data?.next !== undefined ? Boolean(data?.next) : totalCount > currentPage * pageSize
    const hasPrevious = data?.previous !== undefined ? Boolean(data?.previous) : currentPage > 1

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: sampleDetailService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sample-details'] })
            toast.success("Sample detail deleted successfully")
        },
        onError: () => {
            toast.error("Failed to delete sample detail")
        },
    })

    const doDelete = useCallback((id: string) => {
        deleteMutation.mutate(id)
    }, [deleteMutation])

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            accessorKey: "sample_id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sample ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.sample_id}</span>,
        },
        {
            accessorKey: "job_id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />,
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.job_id}</span>,
        },
        {
            accessorKey: "material_type",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Material Type" />,
            cell: ({ row }) => <span>{row.original.material_type || "N/A"}</span>,
        },
        {
            accessorKey: "sample_type",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sample Type" />,
            cell: ({ row }) => <span>{row.original.sample_type || "N/A"}</span>,
        },
        {
            accessorKey: "test_methods_count",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Test Methods" />,
            cell: ({ row }) => <span className="text-center">{row.original.test_methods_count}</span>,
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="text-right space-x-2 inline-flex">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={ROUTES.APP.SAMPLE_DETAILS.EDIT(row.original.id.toString())}>
                            <PencilIcon className="w-4 h-4" />
                        </Link>
                    </Button>
                    <ConfirmPopover
                        title="Delete this sample detail?"
                        confirmText="Delete"
                        onConfirm={() => doDelete(row.original.id.toString())}
                        trigger={
                            <Button variant="destructive" size="sm">
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        }
                    />
                </div>
            ),
        },
    ], [doDelete])

    // Define toolbar and footer callbacks outside of JSX
    const toolbar = useCallback((table: TanstackTable<any>) => {
        return (
            <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                <FilterSearch
                    placeholder="Search sample details..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full"
                    inputClassName="max-w-md"
                />
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DataTableViewOptions table={table} />
                    <Button asChild size="sm">
                        <Link href={ROUTES.APP.SAMPLE_DETAILS.NEW}>New Sample Detail</Link>
                    </Button>
                </div>
            </div>
        )
    }, [searchQuery, handleSearchChange])

    const footer = useCallback((table: TanstackTable<any>) => (
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
        <DataTable
            columns={columns}
            data={items}
            empty={<span className="text-muted-foreground">No sample details yet</span>}
            pageSize={20}
            tableKey="sample-details"
            onRowClick={(row) => router.push(ROUTES.APP.SAMPLE_DETAILS.EDIT(row.original.id.toString()))}
            toolbar={toolbar}
            footer={footer}
        />
    )
}
