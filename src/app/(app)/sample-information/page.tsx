"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { sampleInformationService } from "@/services/sample-information.service"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"
import CompleteDetailsSidebar from "@/components/sample-information/complete-details-sidebar"

export default function SampleInformationPage() {
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Fetch data
    const { data, error, isFetching } = useQuery({
        queryKey: ['sample-information', currentPage, searchQuery],
        queryFn: () => searchQuery
            ? sampleInformationService.search(searchQuery, currentPage)
            : sampleInformationService.getAll(currentPage),
        staleTime: 0, // Always refetch when page changes
        gcTime: 10 * 60 * 1000, // 10 minutes
        // Remove placeholderData to ensure queries refetch when page changes
    })

    // Handle errors with useEffect
    useEffect(() => {
        if (error) {
            console.error('Sample information fetch error:', error)
            toast.error("Failed to load sample information")
        }
    }, [error])

    const items = data?.results ?? []
    const totalCount = data?.count ?? 0
    const pageSize = 20
    const hasNext = data?.next !== undefined ? Boolean(data?.next) : totalCount > currentPage * pageSize
    const hasPrevious = data?.previous !== undefined ? Boolean(data?.previous) : currentPage > 1

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: sampleInformationService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sample-information'] })
            toast.success("Sample information deleted successfully")
        },
        onError: () => {
            toast.error("Failed to delete sample information")
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
            accessorKey: "job_id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />,
            cell: ({ row }) => <span className="font-medium">{row.original.job_id}</span>,
        },
        {
            accessorKey: "project_name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" />,
            cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{row.original.project_name}</div>,
        },
        {
            accessorKey: "client_name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name" />,
            cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{row.original.client_name}</div>,
        },
        {
            accessorKey: "end_user",
            header: ({ column }) => <DataTableColumnHeader column={column} title="End User" />,
            cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{row.original.end_user || "N/A"}</div>,
        },
        {
            accessorKey: "receive_date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Received Date" />,
            cell: ({ row }) => {
                const v = row.original.receive_date
                if (!v) return <span className="text-muted-foreground">—</span>
                const d = new Date(v)
                return <span className="text-muted-foreground">{isNaN(d.getTime()) ? '—' : d.toLocaleDateString()}</span>
            },
        },
        {
            accessorKey: "sample_count",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sample Count" />,
            cell: ({ row }) => <span className="text-center">{row.original.sample_count}</span>,
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="text-right space-x-2 inline-flex">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={ROUTES.APP.SAMPLE_INFORMATION.EDIT(row.original.job_id)}>
                            <PencilIcon className="w-4 h-4" />
                        </Link>
                    </Button>
                    <ConfirmPopover
                        title="Delete this sample information?"
                        confirmText="Delete"
                        onConfirm={() => doDelete(row.original.job_id)}
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
                    placeholder="Search sample information..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full"
                    inputClassName="max-w-md"
                />
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DataTableViewOptions table={table} />
                    <Button asChild size="sm">
                        <Link href={ROUTES.APP.SAMPLE_INFORMATION.NEW}>New Sample Information</Link>
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
        <>
            <DataTable
                columns={columns}
                data={items}
                empty={<span className="text-muted-foreground">No sample information yet</span>}
                pageSize={20}
                tableKey="sample-information"
                onRowClick={(row) => { setSelectedJobId(String(row.original.job_id)); setIsSidebarOpen(true) }}
                toolbar={toolbar}
                footer={footer}
            />

            <CompleteDetailsSidebar selectedJobId={selectedJobId} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </>
    )
}
