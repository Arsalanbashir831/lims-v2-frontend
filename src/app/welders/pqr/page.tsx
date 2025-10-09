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
import { pqrService } from "@/services/pqr.service"
// Define PqrRecord locally for now
interface PqrRecord {
  id: string
  contractorName?: string
  pqrNo?: string
  supportingPwpsNo?: string
  dateOfIssue?: string
  dateOfWelding?: string
  biNumber?: string
  clientEndUser?: string
  dateOfTesting?: string
}
import { toast } from "sonner"
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
  import { savePqrForm } from "@/lib/pqr-form-store"
  import { useRouter } from "next/navigation"

export default function PQRPage() {
  const router = useRouter()

  const [items, setItems] = useState<PqrRecord[]>([])
  const [query, setQuery] = useState("")
  const reload = useCallback(async () => {
    try {
      const data = await pqrService.getAll()
      setItems(data)
    } catch (error) {
      console.error("Failed to load PQRs:", error)
    }
  }, [])
  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((r) =>
      (r.contractorName ?? "").toLowerCase().includes(q) ||
      (r.pqrNo ?? "").toLowerCase().includes(q) ||
      (r.supportingPwpsNo ?? "").toLowerCase().includes(q) ||
      (r.biNumber ?? "").toLowerCase().includes(q) ||
      (r.clientEndUser ?? "").toLowerCase().includes(q)
    )
  }, [items, query])

  const doDelete = useCallback(async (id: string) => {
    try {
      await pqrService.delete(id)
      toast.success("Deleted")
      reload()
    } catch (error) {
      console.error("Failed to delete PQR:", error)
      toast.error("Failed to delete PQR")
    }
  }, [reload])

  const seedDummy = useCallback((id: string) => {
    // minimal dummy full form data just to render preview
    savePqrForm(id, {
      headerInfo: {
        columns: [],
        data: [
          { id: "s1r1", description: "Contractor Name", value: "ACME Corp" },
          { id: "s1r3", description: "PQR No.", value: "PQR-001" },
          { id: "s1r5", description: "Supporting PWPS No.", value: "PWPS-42" },
          { id: "s1r6", description: "Date of Issue", value: "2025-01-15" },
          { id: "s1r8", description: "Date of Welding", value: "2025-01-20" },
          { id: "s1r11", description: "BI #", value: "BI-7788" },
          { id: "s1r13", description: "Client/End User", value: "Globex" },
          { id: "s1r14", description: "Date of Testing", value: "2025-01-25" },
        ],
      },
      baseMetals: { columns: [], data: [] },
      fillerMetals: { columns: [], data: [] },
      positions: { columns: [], data: [] },
      preheat: { columns: [], data: [] },
      pwht: { columns: [], data: [] },
      gas: { columns: [], data: [] },
      electrical: { columns: [], data: [] },
      techniques: { columns: [], data: [] },
      weldingParameters: { columns: [], data: [] },
      tensileTest: { columns: [], data: [] },
      guidedBendTest: { columns: [], data: [] },
      toughnessTest: { columns: [], data: [] },
      filletWeldTest: { columns: [], data: [] },
      otherTests: { columns: [], data: [] },
      welderTestingInfo: { columns: [], data: [] },
      certification: { columns: [], data: [{ id: "cert-ref", reference: "ASME SEC IX" }] },
      signatures: { columns: [], data: [] },
    })
  }, [])

  const columns: ColumnDef<PqrRecord>[] = useMemo(() => [
    { id: "select", header: ({ table }) => (<Checkbox className="size-4" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />), cell: ({ row }) => (<Checkbox className="size-4" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />), meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { id: "rowNumber", header: "S.No", cell: ({ row }) => row.index + 1, meta: { className: "w-fit min-w-fit px-4" }, enableSorting: false, enableHiding: false },
    { accessorKey: "contractorName", header: ({ column }) => <DataTableColumnHeader column={column} title="Contractor Name" /> },
    { accessorKey: "pqrNo", header: ({ column }) => <DataTableColumnHeader column={column} title="PQR No." /> },
    { accessorKey: "supportingPwpsNo", header: ({ column }) => <DataTableColumnHeader column={column} title="Supporting PWPS No." /> },
    { accessorKey: "dateOfIssue", header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Issue" /> },
    { accessorKey: "dateOfWelding", header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Welding" /> },
    { accessorKey: "biNumber", header: ({ column }) => <DataTableColumnHeader column={column} title="BI #" /> },
    { accessorKey: "clientEndUser", header: ({ column }) => <DataTableColumnHeader column={column} title="Client/End User" /> },
    { accessorKey: "dateOfTesting", header: ({ column }) => <DataTableColumnHeader column={column} title="Date of Testing" /> },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2 inline-flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href={ROUTES.APP.WELDERS.PQR.EDIT(row.original.id)}><PencilIcon className="w-4 h-4" /></Link>
          </Button>
          <ConfirmPopover title="Delete this record?" confirmText="Delete" onConfirm={() => doDelete(row.original.id)} trigger={<Button variant="destructive" size="sm"><TrashIcon className="w-4 h-4" /></Button>} />
        </div>
      ),
    },
  ], [doDelete, seedDummy])

  return (

    <DataTable
      columns={columns}
      data={filtered}
      empty={<span className="text-muted-foreground">No PQRs yet</span>}
      pageSize={10}
      tableKey="pqr"
      onRowClick={(row) => router.push(ROUTES.APP.WELDERS.PQR.VIEW(row.original.id))}
      toolbar={useCallback((table: TanstackTable<PqrRecord>) => {
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
              placeholder="Search PQRs..."
              value={(table.getColumn("contractorName")?.getFilterValue() as string) ?? ""}
              onChange={(value) => table.getColumn("contractorName")?.setFilterValue(value)}
              className="w-full"
              inputClassName="max-w-md"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DataTableViewOptions table={table} />
              {hasSelected && (
                <ConfirmPopover title={`Delete ${selected.length} selected item(s)?`} confirmText="Delete" onConfirm={onBulkDelete} trigger={<Button variant="destructive" size="sm">Delete selected ({selected.length})</Button>} />
              )}
              <Button asChild size="sm">
                <Link href={ROUTES.APP.WELDERS.PQR.NEW}>New PQR</Link>
              </Button>
            </div>
          </div>
        )
      }, [doDelete])}
      footer={useCallback((table: TanstackTable<PqrRecord>) => <DataTablePagination table={table} />, [])}
    />

  )
}
