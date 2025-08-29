"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"

export default function ProficiencyTestingPage() {
    const [items, setItems] = useState<ProficiencyTest[]>([])

    const reload = useCallback(() => setItems(listProficiencyTests()), [])

    useEffect(() => {
        reload()
    }, [])

    const doDelete = useCallback((id: string) => {
        deleteProficiencyTest(id)
        toast.success("Deleted")
        reload()
    }, [reload])

    const columns: ColumnDef<ProficiencyTest>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    className="size-4"
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    className="size-4"
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

        <DataTable
            columns={columns}
            data={items}
            empty={<span className="text-muted-foreground">No records yet</span>}
            pageSize={10}
            tableKey="proficiency-testing"
            toolbar={useCallback((table: TanstackTable<ProficiencyTest>) => {
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
                            placeholder="Search description..."
                            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                            onChange={(value) => table.getColumn("description")?.setFilterValue(value)}
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
                                <Link href={ROUTES.APP.PROFICIENCY_TESTING.NEW}>New Record</Link>
                            </Button>
                        </div>
                    </div>
                )
            }, [doDelete])}
            footer={useCallback((table: TanstackTable<ProficiencyTest>) => <DataTablePagination table={table} />, [])}
        />

    )
}


