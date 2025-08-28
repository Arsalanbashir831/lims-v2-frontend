"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Row } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  empty?: React.ReactNode
  pageSize?: number
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode
  footer?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode
  tableKey?: string
  onRowClick?: (row: Row<TData>) => void
}

export function DataTable<TData, TValue>({ columns, data, empty, pageSize = 10, toolbar, footer, tableKey, onRowClick }: DataTableProps<TData, TValue>) {
  const { state } = useSidebar()
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-20rem)]" : "lg:max-w-screen"), [state])

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (!tableKey || typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(`lims:dt:sorting:${tableKey}`)
      return raw ? (JSON.parse(raw) as SortingState) : []
    } catch {
      return []
    }
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (!tableKey || typeof window === "undefined") return {}
    try {
      const raw = window.localStorage.getItem(`lims:dt:visibility:${tableKey}`)
      return raw ? (JSON.parse(raw) as VisibilityState) : {}
    } catch {
      return {}
    }
  })
  const [rowSelection, setRowSelection] = useState({})
  const initialPageSize = useMemo(() => {
    if (!tableKey || typeof window === "undefined") return pageSize
    const raw = window.localStorage.getItem(`lims:dt:pageSize:${tableKey}`)
    const parsed = raw ? Number(raw) : undefined
    return parsed && !Number.isNaN(parsed) ? parsed : pageSize
  }, [tableKey, pageSize])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: initialPageSize })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
  })

  useEffect(() => {
    if (!tableKey || typeof window === "undefined") return
    try {
      window.localStorage.setItem(`lims:dt:visibility:${tableKey}`, JSON.stringify(columnVisibility))
    } catch { }
  }, [tableKey, columnVisibility])

  useEffect(() => {
    if (!tableKey || typeof window === "undefined") return
    try {
      window.localStorage.setItem(`lims:dt:sorting:${tableKey}`, JSON.stringify(sorting))
    } catch { }
  }, [tableKey, sorting])

  useEffect(() => {
    if (!tableKey || typeof window === "undefined") return
    try {
      const size = table.getState().pagination.pageSize
      window.localStorage.setItem(`lims:dt:pageSize:${tableKey}`, String(size))
    } catch { }
  }, [tableKey, table.getState().pagination.pageSize])

  return (
    <>
      {toolbar ? (
        <div className="flex items-center justify-between gap-2 p-2">
          {toolbar(table)}
        </div>
      ) : null}
      <ScrollArea className={cn("w-full max-w-screen", maxWidth)}>
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { className?: string } | undefined
                  return (
                    <TableHead
                      key={header.id}
                      className={cn("whitespace-nowrap px-3 min-w-fit", meta?.className)}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                  onClick={(e) => {
                    if (!onRowClick) return
                    const target = e.target as HTMLElement
                    if (target.closest("button, a, input, label, [role='button']")) return
                    onRowClick(row)
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined
                    return (
                      <TableCell key={cell.id} className={cn("align-middle px-3", meta?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground whitespace-nowrap">
                  {empty ?? "No data"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {footer ? (
        <div className="mt-2">
          {footer(table)}
        </div>
      ) : null}
    </>
  )
}


