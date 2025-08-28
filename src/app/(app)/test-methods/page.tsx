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
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function TestMethodsPage() {
    const [items, setItems] = useState<TestMethod[]>([])

    const reload = useCallback(() => setItems(listTestMethods()), [])

    useEffect(() => {
        reload()
    }, [])

    const doDelete = useCallback((id: string) => {
        deleteTestMethod(id)
        toast.success("Deleted")
        reload()
    }, [reload])

    const columns: ColumnDef<TestMethod>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (

                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
            meta: { className: "w-fit min-w-fit px-4" },
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "serial",
            header: "S.No",
            cell: ({ row }) => row.index + 1,
            meta: { className: "w-fit min-w-fit px-4" },
            enableSorting: false,
            enableHiding: false,
        },
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
                        data={items}
                        empty={<span className="text-muted-foreground">No test methods yet</span>}
                        pageSize={10}
                        tableKey="test-methods"
                        toolbar={useCallback((table: TanstackTable<TestMethod>) => {
                            const selected = table.getSelectedRowModel().rows
                            const hasSelected = selected.length > 0
                            const onBulkDelete = () => {
                                const ids = selected.map(r => r.original.id)
                                ids.forEach(id => doDelete(id))
                                table.resetRowSelection()
                            }
                            return (
                                <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                                    <FilterSearch
                                        placeholder="Search name..."
                                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                        onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
                                        className="w-full"
                                        inputClassName="max-w-md"
                                    />
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                    <DataTableViewOptions table={table} />
                                    {hasSelected && (
                                        <ConfirmPopover
                                            title={`Delete ${selected.length} selected item(s)?`}
                                            confirmText="Delete"
                                            onConfirm={onBulkDelete}
                                            trigger={
                                                <Button variant="destructive" size="sm">
                                                    Delete selected ({selected.length})
                                                </Button>
                                            }
                                        />
                                    )}
                                    <Button asChild size="sm">
                                        <Link href={ROUTES.APP.TEST_METHODS.NEW}>New Test</Link>
                                    </Button>
                                    </div>
                                </div>
                            )
                        }, [doDelete])}
                        footer={useCallback((table: TanstackTable<TestMethod>) => <DataTablePagination table={table} />, [])}
                    />
                </CardContent>
            </Card>
        </div>
    )
}


