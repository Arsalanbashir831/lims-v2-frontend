"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
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

export default function TestMethodsPage() {
    const [items, setItems] = useState<TestMethod[]>([])
    const [query, setQuery] = useState("")


    const reload = () => setItems(listTestMethods())

    useEffect(() => {
        reload()
    }, [])

    const doDelete = (id: string) => {
        deleteTestMethod(id)
        toast.success("Deleted")
        reload()
    }

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

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-full">
                    <FilterSearch placeholder="Search methods..." value={query} onChange={setQuery} className="w-full" inputClassName="max-w-md" />
                    <Button asChild>
                        <Link href={ROUTES.APP.TEST_METHODS.NEW}>New method</Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent className="p-0">
                    <DataTable
                        columns={[
                            {
                                key: "name", header: "Name", cell: (row: TestMethod) => (
                                    <div className="font-medium">{row.name}</div>
                                )
                            },
                            {
                                key: "description", header: "Description", className: "hidden md:table-cell", cell: (row: TestMethod) => (
                                    <span className="text-muted-foreground">{truncateText(row.description, 96)}</span>
                                )
                            },
                            {
                                key: "columns", header: "Columns", cell: (row: TestMethod) => (
                                    <span>{formatColumnsPreview(row.columns, 3)}</span>
                                )
                            },
                            {
                                key: "updatedAt", header: "Updated", className: "hidden md:table-cell", cell: (row: TestMethod) => (
                                    new Date(row.updatedAt).toLocaleString()
                                )
                            },
                            {
                                key: "actions", header: <div className="">Actions</div>, cell: (row: TestMethod) => (
                                    <div className="text-right space-x-2 inline-flex">
                                        <Button variant="secondary" size="sm" asChild>
                                            <Link href={ROUTES.APP.TEST_METHODS.EDIT(row.id)}><PencilIcon className="w-4 h-4" /></Link>
                                        </Button>
                                        <ConfirmPopover
                                            title="Delete this test method?"
                                            confirmText="Delete"
                                            onConfirm={() => doDelete(row.id)}
                                            trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>}
                                        />
                                    </div>
                                )
                            },
                        ]}
                        data={filtered}
                        empty={<span className="text-muted-foreground">No test methods yet</span>}
                        getRowKey={(row: TestMethod) => row.id}
                    />
                </CardContent>
            </Card>
        </div>
    )
}


