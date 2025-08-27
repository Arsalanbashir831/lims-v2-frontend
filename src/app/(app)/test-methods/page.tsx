"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { listTestMethods, deleteTestMethod, TestMethod } from "@/lib/test-methods"
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
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function TestMethodsPage() {
    const [items, setItems] = useState<TestMethod[]>([])
    const [query, setQuery] = useState("")


    const reload = useCallback(() => setItems(listTestMethods()), [])

    useEffect(() => {
        reload()
    }, [])

    const doDelete = useCallback((id: string) => {
        deleteTestMethod(id)
        toast.success("Deleted")
        reload()
    }, [reload])

    const filtered = useMemo(() => {
        if (!query.trim()) return items
        const q = query.toLowerCase()
        return items.filter(m => {
            const inName = m.name.toLowerCase().includes(q)
            const inDesc = (m.description ?? "").toLowerCase().includes(q)
            const inCols = m.columns.join(" ").toLowerCase().includes(q)
            return inName || inDesc || inCols
        })
    }, [items, query])

    const columns: ColumnDef<TestMethod>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => <span className="text-muted-foreground">{truncateText(row.original.description, 96)}</span>,
        },
        {
            id: "columns",
            header: "Columns",
            cell: ({ row }) => <span>{formatColumnsPreview(row.original.columns, 3)}</span>,
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
                        <Link href={ROUTES.APP.TEST_METHODS.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
                    </Button>
                    <ConfirmPopover
                        title="Delete this test method?"
                        confirmText="Delete"
                        onConfirm={() => doDelete(row.original.id)}
                        trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>}
                    />
                </div>
            ),
        },
    ], [doDelete])

    return (
        <div className="grid gap-4">
            <Card>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        empty={<span className="text-muted-foreground">No test methods yet</span>}
                        pageSize={10}
                        tableKey="test-methods"
                        toolbar={useCallback((table: TanstackTable<TestMethod>) => (
                            <div className="flex items-center gap-2 w-full">
                                <FilterSearch
                                    placeholder="Search name..."
                                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                    onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
                                    className="w-full"
                                    inputClassName="max-w-md"
                                />
                                <DataTableViewOptions table={table} />
                                <Button asChild size="sm">
                                    <Link href={ROUTES.APP.TEST_METHODS.NEW}>New Test</Link>
                                </Button>
                            </div>
                        ), [])}
                        footer={useCallback((table: TanstackTable<TestMethod>) => <DataTablePagination table={table} />, [])}
                    />
                </CardContent>
            </Card>
        </div>
    )
}


