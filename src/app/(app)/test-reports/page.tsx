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
import { listTestReports, deleteTestReport, type TestReport } from "@/lib/test-reports"
import { listSamplePreparations, type SamplePreparation } from "@/lib/sample-preparation"
import { listSampleReceivings, type SampleReceiving } from "@/lib/sample-receiving"
import { toast } from "sonner"
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"

export default function TestReportsPage() {
  const [items, setItems] = useState<TestReport[]>([])
  const [preps, setPreps] = useState<SamplePreparation[]>([])
  const [recs, setRecs] = useState<SampleReceiving[]>([])
  const router = useRouter()

  const reload = useCallback(() => setItems(listTestReports()), [])
  useEffect(() => { reload(); setPreps(listSamplePreparations()); setRecs(listSampleReceivings()) }, [])

  const prepMap = useMemo(() => new Map(preps.map(p => [p.id, p])), [preps])
  const recMap = useMemo(() => new Map(recs.map(r => [r.id, r])), [recs])

  const doDelete = useCallback((id: string) => {
    deleteTestReport(id)
    toast.success("Deleted")
    reload()
  }, [reload])

  const columns: ColumnDef<TestReport>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "reportNo", header: ({ column }) => <DataTableColumnHeader column={column} title="Report #" /> },
    { id: "requestNo", header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />, cell: ({ row }) => prepMap.get(row.original.preparationId)?.prepNo ?? "-" },
    {
      id: "jobId", header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />, cell: ({ row }) => {
        const prep = prepMap.get(row.original.preparationId)
        const rec = prep ? recMap.get(prep.sampleReceivingId) : undefined
        return rec?.sampleId ?? "-"
      }
    },
    {
      id: "project", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, cell: ({ row }) => {
        const prep = prepMap.get(row.original.preparationId)
        const rec = prep ? recMap.get(prep.sampleReceivingId) : undefined
        return rec?.projectName ?? "-"
      }
    },
    {
      id: "client", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, cell: ({ row }) => {
        const prep = prepMap.get(row.original.preparationId)
        const rec = prep ? recMap.get(prep.sampleReceivingId) : undefined
        return rec?.clientName ?? "-"
      }
    },
    { id: "items", header: ({ column }) => <DataTableColumnHeader column={column} title="# Items" />, cell: ({ row }) => row.original.items.length },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${ROUTES.APP.TEST_REPORTS.EDIT(row.original.id)}`}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${ROUTES.APP.TEST_REPORTS.VIEW(row.original.id)}`}><EyeIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete, prepMap, recMap])

  return (
    <DataTable
      columns={columns}
      data={items}
      empty={<span className="text-muted-foreground">No test reports yet</span>}
      pageSize={10}
      tableKey="test-reports"
      onRowClick={(row) => router.push(ROUTES.APP.TEST_REPORTS.VIEW(row.original.id))}
      toolbar={useCallback((table: TanstackTable<TestReport>) => {
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
              placeholder="Search reports..."
              value={(table.getColumn("reportNo")?.getFilterValue() as string) ?? ""}
              onChange={(value) => table.getColumn("reportNo")?.setFilterValue(value)}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
              )}
              <Button asChild size="sm">
                <Link href={ROUTES.APP.TEST_REPORTS.NEW}>New Report</Link>
              </Button>
            </div>
          </div>
        )
      }, [doDelete])}
      footer={useCallback((table: TanstackTable<TestReport>) => <DataTablePagination table={table} />, [])}
    />

  )
}


