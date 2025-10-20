import type { Table as TanstackTable } from "@tanstack/react-table"

export type ExcelExportLogos = {
  imagePath?: string
  rightImagePath?: string
  // if you later pass base64, add: logoBase64?: string; rightLogoBase64?: string;
}

export function buildExportPayload<T>(
  table: TanstackTable<T>,
  fileName = "export.xlsx",
  logos: ExcelExportLogos = {}
) {
  const cols = table.getAllLeafColumns()
    .filter(c => typeof c.accessorFn !== "undefined" && c.getIsVisible())

  const columns = cols.map(c => ({
    key: c.id,
    label: typeof c.columnDef.header === "string" && c.columnDef.header.trim()
      ? c.columnDef.header
      : c.id.replace(/_/g, " "),
  }))

  const data = table.getRowModel().rows.map(r => {
    const o: Record<string, any> = {}
    cols.forEach(c => { o[c.id] = r.getValue(c.id) })
    return o
  })

  return { columns, data, fileName, ...logos }
}

export async function exportExcelViaApi<T>(
  table: TanstackTable<T>,
  opts?: { apiPath?: string; fileName?: string; logos?: ExcelExportLogos }
) {
  const apiPath = opts?.apiPath ?? "/api/export-excel"
  const payload = buildExportPayload(table, opts?.fileName, opts?.logos)

  const res = await fetch(apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = payload.fileName || "export.xlsx"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
