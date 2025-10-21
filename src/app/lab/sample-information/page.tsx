"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSampleInformation, useDeleteSampleInformation } from "@/hooks/use-sample-information"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
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
import type { SampleInformationListLike } from "@/services/sample-information.service"

export default function SampleInformationPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Fetch data using caching hooks
    const { data, error, isFetching } = useSampleInformation(currentPage, searchQuery)

    // Handle errors with useEffect
    useEffect(() => {
        if (error) {
            console.error('Sample information fetch error:', error)
            toast.error("Failed to load sample information")
        }
    }, [error])

    const sampleData = data as SampleInformationListLike | undefined
    // Check if data has 'data' property (new API structure) or 'results' (old structure)
    const items = (sampleData?.data ?? sampleData?.results ?? []) as Record<string, unknown>[]
    const totalCount = sampleData?.count ?? 0
    const pageSize = 20
    const hasNext = sampleData?.next !== undefined ? Boolean(sampleData?.next) : totalCount > currentPage * pageSize
    const hasPrevious = sampleData?.previous !== undefined ? Boolean(sampleData?.previous) : currentPage > 1

    // Delete mutation using caching hooks
    const deleteMutation = useDeleteSampleInformation()

    const doDelete = useCallback((id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Sample information deleted successfully")
            },
            onError: (error) => {
                toast.error("Failed to delete sample information")
                console.error("Delete error:", error)
            }
        })
    }, [deleteMutation])

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => [
        {
            accessorKey: "job_id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />,
            cell: ({ row }) => <span className="font-medium">{String(row.original.job_id ?? '')}</span>,
        },
        {
            accessorKey: "project_name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" />,
            cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{String(row.original.project_name ?? '')}</div>,
        },
        {
            accessorKey: "client_name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name" />,
            cell: ({ row }) => <div className="font-medium truncate max-w-[28ch]">{String(row.original.client_name ?? '')}</div>,
        },
        {
            accessorKey: "received_by",
            header: ({ column }) => <DataTableColumnHeader column={column} title="End User" />,
            cell: ({ row }) => {
                const receivedBy = (row.original as any).received_by
                return (
                    <div className="font-medium truncate max-w-[28ch]">
                        {receivedBy ? String(receivedBy) : "N/A"}
                    </div>
                );
            },
        },
        {
            accessorKey: "receive_date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Received Date" />,
            cell: ({ row }) => {
                const v = row.original.receive_date
                if (!v) return <span className="text-muted-foreground">—</span>
                const d = new Date(String(v))
                return <span className="text-muted-foreground">{isNaN(d.getTime()) ? '—' : d.toLocaleDateString()}</span>
            },
        },
        {
            accessorKey: "sample_lots_count",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sample Count" />,
            cell: ({ row }) => <span className="text-center">{String(row.original.sample_lots_count ?? 0)}</span>,
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="text-right space-x-2 inline-flex">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={ROUTES.APP.SAMPLE_INFORMATION.EDIT(String(row.original.id ?? ''))}>
                            <PencilIcon className="w-4 h-4" />
                        </Link>
                    </Button>
                    <ConfirmPopover
                        title="Delete this sample information?"
                        confirmText="Delete"
                        onConfirm={() => doDelete(String(row.original.id ?? ''))}
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
    const toolbar = useCallback((table: TanstackTable<Record<string, unknown>>) => {
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

    const footer = useCallback((table: TanstackTable<Record<string, unknown>>) => (
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
                onRowClick={(row) => { setSelectedJobId(String(row.original.id)); setIsSidebarOpen(true) }}
                toolbar={toolbar}
                footer={footer}
            />

            <CompleteDetailsSidebar selectedJobId={selectedJobId} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </>
    )
}
