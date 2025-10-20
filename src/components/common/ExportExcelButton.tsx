"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheetIcon } from "lucide-react"
import type { Table as TanstackTable } from "@tanstack/react-table"
import { exportExcelViaApi, type ExcelExportLogos } from "@/lib/excel-export"
import { toast } from "sonner"

type Props<T> = {
  table: TanstackTable<T>
  fileName?: string
  apiPath?: string
  logos?: ExcelExportLogos
  className?: string
  children?: React.ReactNode
}

export default function ExportExcelButton<T>({
  table, fileName, apiPath, logos, className, children,
}: Props<T>) {
  return (
    <Button
      size="sm"
      className={className}
      onClick={async () => {
        try {
          await exportExcelViaApi(table, { fileName, apiPath, logos })
          toast.success("Exported")
        } catch (e) {
          console.error(e)
          toast.error("Export failed")
        }
      }}
    >
      <FileSpreadsheetIcon className="w-4 h-4" />
      {children ?? "Export Excel"}
    </Button>
  )
}
