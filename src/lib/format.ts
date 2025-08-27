export function truncateText(input: string | undefined, maxLength = 80): string {
  if (!input) return ""
  if (input.length <= maxLength) return input
  return input.slice(0, Math.max(0, maxLength - 1)).trimEnd() + "…"
}

export function formatColumnsPreview(columns: string[], maxNames = 3): string {
  const total = columns.length
  if (total === 0) return "(0)"
  const shown = columns.slice(0, maxNames)
  const remaining = Math.max(0, total - shown.length)
  const names = shown.join(", ")
  return remaining > 0 ? `${names}… (${remaining})` : names
}


