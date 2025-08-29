"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { listDiscardedMaterials, deleteMultipleDiscardedMaterials, type DiscardedMaterial, deleteDiscardedMaterial } from "@/lib/discarded-materials"
import { formatColumnsPreview } from "@/lib/format"
import { ROUTES } from "@/constants/routes"
import Link from "next/link"

export default function DiscardedMaterialsPage() {
    const router = useRouter()
    const [data] = useState(() => listDiscardedMaterials())
    const [globalFilter, setGlobalFilter] = useState("")

    const columns: ColumnDef<DiscardedMaterial>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
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
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            accessorKey: "rowNumber",
            header: "S.No",
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            enableHiding: false,
            size: 60,
        },
        {
            accessorKey: "jobId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />,
            cell: ({ row }) => {
                const material = row.original
                return (
                    <div className="font-medium">
                        {material.jobId}
                    </div>
                )
            },
        },
        {
            accessorKey: "discardReason",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Discard Reason" />,
            cell: ({ row }) => {
                const reason = row.getValue("discardReason") as string
                return (
                    <div className="max-w-[200px] truncate" title={reason}>
                        {reason}
                    </div>
                )
            },
        },
        {
            accessorKey: "discardDate",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Discard Date" />,
            cell: ({ row }) => {
                const date = row.getValue("discardDate") as string
                return new Date(date).toLocaleDateString()
            },
        },
        {
            accessorKey: "items",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
            cell: ({ row }) => {
                const items = row.getValue("items") as DiscardedMaterial["items"]
                const specimenIds = items.map(item => item.specimenId)
                return (
                    <div className="max-w-[200px]">
                        {formatColumnsPreview(specimenIds, 3)}
                    </div>
                )
            },
        },
        {
            accessorKey: "discardedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Discarded At" />,
            cell: ({ row }) => {
                const date = row.getValue("discardedAt") as string
                return new Date(date).toLocaleDateString()
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={ROUTES.APP.MATERIAL_DISCARDS.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
                        </Button>
                        <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => deleteDiscardedMaterial(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
            size: 100,
        },
    ]

    const filteredData = useMemo(() => {
        if (!globalFilter) return data

        return data.filter((material) => {
            const searchTerm = globalFilter.toLowerCase()
            return (
                material.jobId.toLowerCase().includes(searchTerm) ||
                material.sampleId.toLowerCase().includes(searchTerm) ||
                material.discardReason.toLowerCase().includes(searchTerm) ||
                material.items.some(item =>
                    item.specimenId.toLowerCase().includes(searchTerm) ||
                    item.itemDescription.toLowerCase().includes(searchTerm)
                )
            )
        })
    }, [data, globalFilter])



    return (
        <DataTable
            data={filteredData}
            columns={columns}
            tableKey="discarded-materials"
            onRowClick={(row) => router.push(ROUTES.APP.MATERIAL_DISCARDS.EDIT(row.original.id))}
            toolbar={(table) => {
                const selected = table.getSelectedRowModel().rows
                const hasSelected = selected.length > 0
                const onBulkDelete = () => {
                    const ids = selected.map((r: any) => r.original.id)
                    if (deleteMultipleDiscardedMaterials(ids)) {
                        table.resetRowSelection()
                        window.location.reload()
                    }
                }
                return (
                    <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                        <FilterSearch
                            placeholder="Search discarded materials..."
                            value={globalFilter}
                            onChange={setGlobalFilter}
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
                                    trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>}
                                />
                            )}
                            <Link href={ROUTES.APP.MATERIAL_DISCARDS.NEW}>
                                <Button size="sm">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    New Discard Record
                                </Button>
                            </Link>
                        </div>
                    </div>
                )
            }}
            footer={(table) => (
                <DataTablePagination table={table} />
            )}
        />
    )
}
