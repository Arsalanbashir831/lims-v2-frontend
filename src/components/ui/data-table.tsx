"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ColumnDef<T> = {
  key: keyof T | string
  header: React.ReactNode
  cell?: (row: T) => React.ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: ColumnDef<T>[]
  data: T[]
  empty?: React.ReactNode
  getRowKey?: (row: T, index: number) => string
}

export function DataTable<T>({ columns, data, empty, getRowKey }: DataTableProps<T>) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i} className={col.className}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
              {empty ?? "No data"}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, idx) => (
            <TableRow key={getRowKey ? getRowKey(row, idx) : String(idx)}>
              {columns.map((col, i) => (
                <TableCell key={i} className={`max-w-0 ${col.className ?? ""}`}>
                  <div className="truncate">
                    {col.cell ? col.cell(row) : (row as any)[col.key as string]}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}


