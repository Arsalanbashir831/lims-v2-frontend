"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Plus, Trash2, PencilIcon } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { clientService, Client } from "@/lib/clients"
import { toast } from "sonner"

export default function ClientsPage() {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)

    const handleDelete = useCallback(async (id: string) => {
        try {
            await clientService.delete(id)
            setClients(prev => prev.filter(client => client.id !== id))
            toast.success("Client deleted successfully")
        } catch (error) {
            toast.error("Failed to delete client")
            console.error("Delete error:", error)
        }
    }, [])

    const toolbar = useCallback((table: TanstackTable<Client>) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = () => {
            const ids = selected.map(r => r.original.id!)
            ids.forEach(id => handleDelete(id))
            table.resetRowSelection()
        }
        return (
            <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                <FilterSearch
                    placeholder="Search clients..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
                    className="w-full"
                    inputClassName="max-w-md"
                />
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DataTableViewOptions table={table} />
                    {hasSelected && (
                        <ConfirmPopover
                            title={`Delete ${selected.length} selected client(s)?`}
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
                        <Link href={ROUTES.APP.CLIENTS.NEW}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }, [handleDelete])

    const footer = useCallback((table: TanstackTable<Client>) => <DataTablePagination table={table} />, [])

    const columns: ColumnDef<Client>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => {
                const name = row.getValue("name") as string
                return <div className="font-medium">{name}</div>
            },
        },
        {
            accessorKey: "contact_person",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Person" />,
            cell: ({ row }) => {
                const contactPerson = row.getValue("contact_person") as string
                return <div className="text-muted-foreground">{contactPerson || "—"}</div>
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => {
                const email = row.getValue("email") as string
                return <div className="text-muted-foreground">{email || "—"}</div>
            },
        },
        {
            accessorKey: "phone",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
            cell: ({ row }) => {
                const phone = row.getValue("phone") as string
                return <div className="text-muted-foreground">{phone || "—"}</div>
            },
        },
        {
            accessorKey: "city",
            header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
            cell: ({ row }) => {
                const city = row.getValue("city") as string
                return <div className="text-muted-foreground">{city || "—"}</div>
            },
        },
        {
            accessorKey: "country",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
            cell: ({ row }) => {
                const country = row.getValue("country") as string
                return <div className="text-muted-foreground">{country || "—"}</div>
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const client = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={ROUTES.APP.CLIENTS.EDIT(client.id!)}>
                                <PencilIcon className="w-4 h-4" />
                            </Link>
                        </Button>
                        <ConfirmPopover
                            title="Delete client?"
                            description="This action cannot be undone."
                            confirmText="Delete"
                            onConfirm={() => handleDelete(client.id!)}
                            trigger={
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            }
                        />
                    </div>
                )
            },
        },
    ], [handleDelete])

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true)
                const data = await clientService.getAll()
                setClients(data)
            } catch (error) {
                toast.error("Failed to load clients")
                console.error("Load error:", error)
            } finally {
                setLoading(false)
            }
        }

        loadClients()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading clients...</div>
            </div>
        )
    }

    return (
        <DataTable
            columns={columns}
            data={clients}
            empty={<span className="text-muted-foreground">No clients found. Create your first client to get started.</span>}
            pageSize={10}
            tableKey="clients"
            onRowClick={(row) => router.push(ROUTES.APP.CLIENTS.EDIT(row.original.id!))}
            toolbar={toolbar}
            footer={footer}
        />
    )
}
