"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { testMethodService, TestMethod } from "@/lib/test-methods"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { truncateText, formatColumnsPreview } from "@/lib/format"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { PencilIcon, TrashIcon } from "lucide-react"
import { FilterSearch } from "@/components/ui/filter-search"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ServerPagination } from "@/components/ui/server-pagination"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function TestMethodsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: tmData, isFetching } = useQuery({
        queryKey: ['test-methods', currentPage, searchQuery],
        queryFn: () => (searchQuery.trim() ? testMethodService.search(searchQuery.trim(), currentPage) : testMethodService.getAll(currentPage)),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

    const items = tmData?.results ?? []
    const totalCount = tmData?.count ?? 0
    const pageSize = 20
    const hasNext = tmData?.next !== undefined ? Boolean(tmData?.next) : totalCount > currentPage * pageSize
    const hasPrevious = tmData?.previous !== undefined ? Boolean(tmData?.previous) : currentPage > 1

    const deleteMutation = useMutation({
        mutationFn: (id: string) => testMethodService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test-methods'] })
            toast.success("Deleted")
        }
    })
    const doDelete = useCallback((id: string) => { deleteMutation.mutate(id) }, [deleteMutation])

    const columns: ColumnDef<TestMethod>[] = useMemo(() => [
        {
            id: "serial",
            header: "S.No",
            cell: ({ row }) => row.index + 1,
            meta: { className: "w-fit min-w-fit px-4" },
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "test_name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="font-medium">{row.original.test_name}</div>,
        },
        {
            accessorKey: "test_description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => <span className="text-muted-foreground">{truncateText(row.original.test_description || "", 96)}</span>,
        },
        {
            id: "columns",
            header: "Columns",
            cell: ({ row }) => <span>{formatColumnsPreview(row.original.test_columns, 3)}</span>,
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
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={ROUTES.APP.TEST_METHODS.EDIT(String(row.original.id))}><PencilIcon className="w-4 h-4" /></Link>
                    </Button>
                    <ConfirmPopover
                        title="Delete this test method?"
                        confirmText="Delete"
                        onConfirm={() => doDelete(String(row.original.id))}
                        trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>}
                    />
                </div>
            ),
        },
    ], [doDelete])

    return (
        <DataTable
            columns={columns}
            data={items}
            empty={<span className="text-muted-foreground">No test methods yet</span>}
            pageSize={20}
            tableKey="test-methods"
            onRowClick={(row) => router.push(ROUTES.APP.TEST_METHODS.EDIT(String(row.original.id)))}
            toolbar={useCallback((table: TanstackTable<TestMethod>) => {
                return (
                    <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                        <FilterSearch
                            placeholder="Search name..."
                            value={searchQuery}
                            onChange={(value) => { setSearchQuery(value); setCurrentPage(1) }}
                            className="w-full"
                            inputClassName="max-w-md"
                        />
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <DataTableViewOptions table={table} />
                            <Button asChild size="sm">
                                <Link href={ROUTES.APP.TEST_METHODS.NEW}>New Test</Link>
                            </Button>
                        </div>
                    </div>
                )
            }, [searchQuery])}
            footer={useCallback((table: TanstackTable<TestMethod>) => (
                <ServerPagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={20}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    onPageChange={setCurrentPage}
                    isLoading={isFetching}
                />
            ), [currentPage, totalCount, hasNext, hasPrevious, isFetching])}
        />
    )
}


