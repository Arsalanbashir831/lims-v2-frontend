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
import { listSamplePreparations, deleteSamplePreparation, SamplePreparation } from "@/lib/sample-preparation"
import { listSampleReceivings, type SampleReceiving } from "@/lib/sample-receiving"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/constants/routes"

export default function SamplePreparationPage() {
  const [items, setItems] = useState<SamplePreparation[]>([])
  const [receivings, setReceivings] = useState<SampleReceiving[]>([])

  const reload = useCallback(() => setItems(listSamplePreparations()), [])
  useEffect(() => { reload(); setReceivings(listSampleReceivings()) }, [])

  const recMap = useMemo(() => {
    const m = new Map<string, SampleReceiving>()
    receivings.forEach(r => m.set(r.id, r))
    return m
  }, [receivings])

  const doDelete = useCallback((id: string) => {
    deleteSamplePreparation(id)
    toast.success("Deleted")
    reload()
  }, [reload])

  const columns: ColumnDef<SamplePreparation>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "jobId", header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />, cell: ({ row }) => recMap.get(row.original.sampleReceivingId)?.sampleId ?? "-" },
    { id: "project", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, cell: ({ row }) => recMap.get(row.original.sampleReceivingId)?.projectName ?? "-" },
    { id: "client", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, cell: ({ row }) => recMap.get(row.original.sampleReceivingId)?.clientName ?? "-" },
    { id: "requestNo", header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />, cell: ({ row }) => row.original.prepNo },
    { id: "totalSamples", header: ({ column }) => <DataTableColumnHeader column={column} title="Total no. of Samples" />, cell: ({ row }) => recMap.get(row.original.sampleReceivingId)?.numItems ?? 0 },
    { id: "specimenIds", header: ({ column }) => <DataTableColumnHeader column={column} title="Specimen IDs" />, cell: ({ row }) => {
      const ids = Array.from(new Set(row.original.items.flatMap(i => i.specimenIds))).filter(Boolean)
      const preview = ids.slice(0, 5).join(", ")
      return ids.length > 5 ? `${preview} +${ids.length - 5}` : (preview || "-")
    } },
    { id: "requestDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Request Date" />, cell: ({ row }) => recMap.get(row.original.sampleReceivingId)?.receiveDate ?? "-" },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.SAMPLE_PREPARATION.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete, recMap])

  return (
    <div className="grid gap-4">
      <DataTable
        columns={columns}
        data={items}
        empty={<span className="text-muted-foreground">No preparations yet</span>}
        pageSize={10}
        tableKey="sample-preparation"
        toolbar={useCallback((table: TanstackTable<SamplePreparation>) => {
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
                placeholder="Search preparations..."
                value={(table.getColumn("prepNo")?.getFilterValue() as string) ?? ""}
                onChange={(value) => table.getColumn("prepNo")?.setFilterValue(value)}
                className="w-full"
                inputClassName="max-w-md"
              />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <DataTableViewOptions table={table} />
                {hasSelected && (
                  <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
                )}
                <Button asChild size="sm">
                  <Link href={ROUTES.APP.SAMPLE_PREPARATION.NEW}>New Preparation</Link>
                </Button>
              </div>
            </div>
          )
        }, [doDelete])}
        footer={useCallback((table: TanstackTable<SamplePreparation>) => <DataTablePagination table={table} />, [])}
      />
    </div>
  )
}


