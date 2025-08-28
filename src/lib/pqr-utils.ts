export function getSectionDataByAccessor(row: Record<string, any>, accessorKey: string): string | number | undefined {
  if (!row || !accessorKey) return undefined
  return row[accessorKey]
}
