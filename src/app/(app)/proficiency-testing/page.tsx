"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { listProficiencyTests, deleteProficiencyTest, ProficiencyTest } from "@/lib/proficiency-testing"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"

export default function ProficiencyTestingPage() {
    const [items, setItems] = useState<ProficiencyTest[]>([])
    const [query, setQuery] = useState("")

    const reload = useCallback(() => setItems(listProficiencyTests()), [])

    useEffect(() => {
        reload()
    }, [])

    const filtered = useMemo(() => {
        if (!query.trim()) return items
        const q = query.toLowerCase()
        return items.filter((r) =>
            r.description.toLowerCase().includes(q) ||
            (r.provider1 ?? "").toLowerCase().includes(q) ||
            (r.provider2 ?? "").toLowerCase().includes(q) ||
            (r.status ?? "").toLowerCase().includes(q) ||
            (r.remarks ?? "").toLowerCase().includes(q)
        )
    }, [items, query])

    const doDelete = useCallback((id: string) => {
        deleteProficiencyTest(id)
        toast.success("Deleted")
        reload()
    }, [reload])

    const columns: ColumnDef<ProficiencyTest>[] = useMemo(() => [
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => (
                <div className="font-medium truncate max-w-[28ch]">{row.original.description}</div>
            ),
        },
        { accessorKey: "provider1", header: ({ column }) => <DataTableColumnHeader column={column} title="PT Provider 1" /> },
        { accessorKey: "provider2", header: ({ column }) => <DataTableColumnHeader column={column} title="PT Provider 2" /> },
        { accessorKey: "lastTestDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Last Test Date" /> },
        { accessorKey: "dueDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" /> },
        { accessorKey: "nextScheduledDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Next Scheduled Date" /> },
        { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" /> },
        { accessorKey: "remarks", header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" /> },
        {
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="text-right space-x-2 inline-flex">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={ROUTES.APP.PROFICIENCY_TESTING.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
                    </Button>
                    <ConfirmPopover
                        title="Delete this record?"
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
                        empty={<span className="text-muted-foreground">No records yet</span>}
                        pageSize={10}
                        tableKey="proficiency-testing"
                        toolbar={useCallback((table: TanstackTable<ProficiencyTest>) => (
                            <div className="flex items-center gap-2 w-full">
                                <FilterSearch
                                    placeholder="Search description..."
                                    value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                                    onChange={(value) => table.getColumn("description")?.setFilterValue(value)}
                                    className="w-full"
                                    inputClassName="max-w-md"
                                />
                                <DataTableViewOptions table={table} />
                                <Button asChild size="sm">
                                    <Link href={ROUTES.APP.PROFICIENCY_TESTING.NEW}>New Record</Link>
                                </Button>
                            </div>
                        ), [])}
                        footer={useCallback((table: TanstackTable<ProficiencyTest>) => <DataTablePagination table={table} />, [])}
                    />
                </CardContent>
            </Card>
        </div>
    )
}


