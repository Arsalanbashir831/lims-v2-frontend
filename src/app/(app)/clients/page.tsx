"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ServerPagination } from "@/components/ui/server-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Plus, Trash2, PencilIcon } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { clientService, Client } from "@/lib/clients"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function ClientsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: clientsData, isLoading: loading, isFetching } = useQuery({
        queryKey: ['clients', currentPage, searchQuery],
        queryFn: () => {
            if (searchQuery.trim()) {
                return clientService.search(searchQuery.trim(), currentPage)
            } else {
                return clientService.getAll(currentPage)
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes (renamed from cacheTime)
        placeholderData: (previousData) => {
            return previousData
        },
    })

    const clients = clientsData?.results || []
    const totalCount = clientsData?.count || 0
    const pageSize = 20
    // Some endpoints (e.g., search) may omit next/previous. Fallback to count-based logic.
    const hasNext = clientsData?.next !== undefined ? !!clientsData?.next : totalCount > currentPage * pageSize
    const hasPrevious = clientsData?.previous !== undefined ? !!clientsData?.previous : currentPage > 1

    const deleteMutation = useMutation({
        mutationFn: (id: string) => clientService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success("Client deleted successfully")
        },
        onError: (error) => {
            toast.error("Failed to delete client")
            console.error("Delete error:", error)
        }
    })

    const handleDelete = useCallback((id: string) => {
        deleteMutation.mutate(id)
    }, [deleteMutation])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSearch = (query: string) => {
        if (query !== searchQuery) {
            setSearchQuery(query)
            setCurrentPage(1) // Reset to first page only when query actually changes
        }
    }

    const handleClearSearch = () => {
        setSearchQuery("")
        setCurrentPage(1)
    }

    const toolbar = useCallback((table: TanstackTable<Client>) => {
        const selected = table.getSelectedRowModel().rows
        const hasSelected = selected.length > 0
        const onBulkDelete = () => {
            const ids = selected.map(r => r.original.id)
            ids.forEach(id => handleDelete(id))
            table.resetRowSelection()
        }
        return (
            <div className="flex flex-col md:flex-row items-center gap-2.5 w-full">
                <FilterSearch
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={handleSearch}
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
    }, [handleDelete, searchQuery, handleSearch])

    const footer = useCallback((table: TanstackTable<Client>) => (
        <ServerPagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={20}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={handlePageChange}
            isLoading={isFetching}
        />
    ), [currentPage, totalCount, hasNext, hasPrevious, isFetching, handlePageChange])

    const columns: ColumnDef<Client>[] = useMemo(() => [
        {
            accessorKey: "client_name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => {
                const name = row.getValue("client_name") as string
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
            accessorKey: "created_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            cell: ({ row }) => {
                const createdAt = row.getValue("created_at") as string
                return <div className="text-muted-foreground text-sm">
                    {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
                </div>
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
                            <Link href={ROUTES.APP.CLIENTS.EDIT(client.id)}>
                                <PencilIcon className="w-4 h-4" />
                            </Link>
                        </Button>
                        <ConfirmPopover
                            title="Delete client?"
                            description="This action cannot be undone."
                            confirmText="Delete"
                            onConfirm={() => handleDelete(client.id)}
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


    if (loading && !clientsData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading clients...</div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {searchQuery && (
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Search results for: <span className="font-medium">"{searchQuery}"</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                            ({totalCount} result{totalCount !== 1 ? 's' : ''})
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                        Clear search
                    </Button>
                </div>
            )}
            <DataTable
                columns={columns}
                data={clients}
                empty={
                    searchQuery
                        ? <span className="text-muted-foreground">No clients found matching "{searchQuery}". Try a different search term.</span>
                        : <span className="text-muted-foreground">No clients found. Create your first client to get started.</span>
                }
                pageSize={10}
                tableKey="clients"
                onRowClick={(row) => router.push(ROUTES.APP.CLIENTS.EDIT(row.original.id))}
                toolbar={toolbar}
                footer={footer}
            />
        </div>
    )
}
