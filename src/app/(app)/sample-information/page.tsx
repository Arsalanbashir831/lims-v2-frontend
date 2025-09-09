"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { sampleInformationService } from "@/lib/sample-information"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { sampleLotService } from "@/lib/sample-lots"
import { useMemo as useReactMemo } from "react"
import { testMethodService } from "@/lib/test-methods"

function TestMethodNames({ ids }: { ids: string[] }) {
    const { data, isFetching } = useQuery({
        queryKey: ['test-method-names', ids.sort().join(',')],
        queryFn: async () => {
            if (!ids || ids.length === 0) return [] as string[]
            // Fetch all methods (page 1) and map locally; for large sets replace with per-id fetch
            const res = await testMethodService.getAll(1)
            const map = new Map(res.results.map(m => [m.id, m.test_name]))
            return ids.map(id => map.get(id) || id)
        },
        enabled: Array.isArray(ids),
        staleTime: 5 * 60 * 1000,
    })
    if (isFetching) return <span className="text-muted-foreground">Loading…</span>
    if (!data || data.length === 0) return <span className="text-muted-foreground">—</span>
    return <span className="truncate block max-w-[26ch]">{data.join(', ')}</span>
}

export default function SampleInformationPage() {
    const router = useRouter()
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        placeholderData: (previousData) => previousData,
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

    // Aggregated sidebar data
    const { data: sidebarData, isFetching: loadingSidebar } = useQuery({
        queryKey: ['sample-information-sidebar', selectedJobId],
        queryFn: () => selectedJobId ? sampleInformationService.getSidebarData(selectedJobId) : Promise.resolve(null),
        enabled: !!selectedJobId,
    })

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

            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent className="w-full sm:max-w-2xl">
                    <SheetHeader>
                        <div className="flex items-center justify-between">
                            <SheetTitle>Job Details</SheetTitle>
                            {selectedJobId && (
                                <Button size="sm" asChild>
                                    <Link href={ROUTES.APP.SAMPLE_INFORMATION.EDIT(selectedJobId)}>Edit Job</Link>
                                </Button>
                            )}
                        </div>
                    </SheetHeader>
                    <div className="mt-4 space-y-6">
                        {loadingSidebar ? (
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                            </div>
                        ) : sidebarData?.job ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Job ID</div>
                                    <div className="font-medium">{sidebarData.job.job_id}</div>
                                </div>
                                {sidebarData.job.receive_date && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Received</div>
                                        <div className="font-medium">{new Date(sidebarData.job.receive_date).toLocaleDateString()}</div>
                                    </div>
                                )}
                                {sidebarData.job.project_name && (
                                    <div className="col-span-2">
                                        <div className="text-sm text-muted-foreground">Project</div>
                                        <div className="font-medium truncate">{sidebarData.job.project_name}</div>
                                    </div>
                                )}
                                {sidebarData.job.client_name && (
                                    <div className="col-span-2">
                                        <div className="text-sm text-muted-foreground">Client</div>
                                        <div className="font-medium truncate">{sidebarData.job.client_name}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm">Select a job to view details</div>
                        )}

                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-muted-foreground">Sample Lots</div>
                                {selectedJobId && (
                                    <Button size="sm" asChild>
                                        <Link href={`${ROUTES.APP.SAMPLE_DETAILS.NEW}?mode=edit-lots&jobId=${selectedJobId}`}>Edit Sample Lots</Link>
                                    </Button>
                                )}
                            </div>
                            {loadingSidebar ? (
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    {(sidebarData?.lots ?? []).length === 0 ? (
                                        <div className="p-3 text-sm text-muted-foreground">No sample lots found for this job.</div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left border-b">
                                                    <th className="py-2 pr-3">Item No</th>
                                                    <th className="py-2 pr-3">Sample Type</th>
                                                    <th className="py-2 pr-3">Material Type</th>
                                                    <th className="py-2 pr-3">Heat No</th>
                                                    <th className="py-2 pr-3">Description</th>
                                                    <th className="py-2 pr-3">Test Methods</th>
                                                    <th className="py-2 pr-0 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(sidebarData?.lots ?? []).map((lot: any) => (
                                                    <tr key={lot.id} className="border-b last:border-b-0">
                                                        <td className="py-2 pr-3 font-medium">{lot.item_no}</td>
                                                        <td className="py-2 pr-3">{lot.sample_type || '—'}</td>
                                                        <td className="py-2 pr-3">{lot.material_type || '—'}</td>
                                                        <td className="py-2 pr-3">{lot.heat_no || '—'}</td>
                                                        <td className="py-2 pr-3 truncate max-w-[18ch]">{lot.description || '—'}</td>
                                                        <td className="py-2 pr-3 truncate max-w-[28ch]">{(lot.test_method_names || []).join(', ')}</td>
                                                        <td className="py-2 pr-0 text-right">
                                                            <Button size="sm" variant="ghost" asChild>
                                                                <Link href={ROUTES.APP.SAMPLE_DETAILS.EDIT(lot.id)}>
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </Link>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
