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
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea, ScrollBar } from "./scroll-area"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  empty?: React.ReactNode
  pageSize?: number
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode
  footer?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode
  tableKey?: string
  onRowClick?: (row: Row<TData>) => void
  bodyMaxHeightClassName?: string
  manualPagination?: boolean // Add this to control pagination mode
}

export function DataTable<TData, TValue>({ columns, data, empty, pageSize = 10, toolbar, footer, tableKey, onRowClick, bodyMaxHeightClassName, manualPagination = true }: DataTableProps<TData, TValue>) {
  const { state } = useSidebar()
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-20rem)]" : "lg:max-w-screen"), [state])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side state after hydration
  useEffect(() => {
    setIsClient(true)
    if (!tableKey) return

    try {
      // Load sorting
      const sortingRaw = window.localStorage.getItem(`lims:dt:sorting:${tableKey}`)
      if (sortingRaw) {
        setSorting(JSON.parse(sortingRaw) as SortingState)
      }

      // Load column visibility
      const visibilityRaw = window.localStorage.getItem(`lims:dt:visibility:${tableKey}`)
      if (visibilityRaw) {
        setColumnVisibility(JSON.parse(visibilityRaw) as VisibilityState)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [tableKey])

  // For server-side pagination, we don't need to manage pagination state
  // The parent component handles pagination via ServerPagination
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: pageSize })

  // Create table configuration based on pagination mode
  const tableConfig = manualPagination 
    ? {
        // Server-side pagination configuration
        data,
        columns,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: -1, // This tells the table we're using server-side pagination
      }
    : {
        // Client-side pagination configuration
        data,
        columns,
        state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
      }

  const table = useReactTable(tableConfig)

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

  // Note: Pagination state is managed by the parent component for server-side pagination
  // No need to save pagination state to localStorage

  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-10rem)]">
      {toolbar ? (
        <div className="flex items-center justify-between gap-2 p-2">
          {toolbar(table)}
        </div>
      ) : null}
      
      <ScrollArea className={cn("relative flex-1 overflow-auto w-full", maxWidth)}>
        <ScrollBar orientation="horizontal" />
        <Table className="min-w-full">
          <TableHeader className="bg-muted">
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
      </ScrollArea>
      
      {footer ? (
        <div className="mt-2">
          {footer(table)}
        </div>
      ) : null}
    </div>
  )
}


