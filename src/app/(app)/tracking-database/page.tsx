"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { FilterSearch } from "@/components/ui/filter-search"
import { Badge } from "@/components/ui/badge"
import { computeTrackingRows, type TrackingRow } from "@/services/tracking.service"
import { TrackingDrawer } from "@/components/tracking/tracking-drawer"

export default function TrackingDatabasePage() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TrackingRow | null>(null)
  const [query, setQuery] = useState("")
  const rows = useMemo(() => computeTrackingRows(), [])

  const data = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r =>
      r.sampleId.toLowerCase().includes(q) ||
      r.projectName.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q)
    )
  }, [rows, query])

  const columns: ColumnDef<TrackingRow>[] = [
    { accessorKey: "sampleId", header: ({ column }) => <DataTableColumnHeader column={column} title="Sample ID" />, cell: ({ row }) => row.original.sampleId },
    { accessorKey: "projectName", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, cell: ({ row }) => <div className="truncate max-w-[240px]" title={row.original.projectName}>{row.original.projectName}</div> },
    { accessorKey: "clientName", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, cell: ({ row }) => row.original.clientName },
    { accessorKey: "itemsCount", header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />, cell: ({ row }) => row.original.itemsCount },
    { accessorKey: "specimensCount", header: ({ column }) => <DataTableColumnHeader column={column} title="Specimens" />, cell: ({ row }) => row.original.specimensCount },
    { accessorKey: "latestStatus", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.latestStatus.replaceAll("_", " ")}</Badge> },
  ]

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        tableKey="tracking-db"
        bodyMaxHeightClassName="max-h-[65vh]"
        toolbar={(table) => (
          <div className="flex items-center gap-2 w-full">
            <FilterSearch value={query} onChange={setQuery} placeholder="Search..." className="w-full max-w-md" />
            <DataTableViewOptions table={table} />
          </div>
        )}
        footer={(table) => <DataTablePagination table={table} />}
        onRowClick={(row) => { setSelected(row.original); setOpen(true) }}
      />

      <TrackingDrawer open={open} onOpenChange={setOpen} row={selected} />
    </>
  )
}


