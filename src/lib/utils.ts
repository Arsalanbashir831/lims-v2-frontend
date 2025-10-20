// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type ExcelJS from "exceljs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---- Excel helpers ----
export type BordersInput = Partial<
  Pick<NonNullable<ExcelJS.Cell["border"]>, "top" | "bottom" | "left" | "right">
>

/** Merge-safe border setter for a single cell */
export function applyBorders(cell: ExcelJS.Cell, borders: BordersInput): void {
  cell.border = { ...(cell.border ?? {}), ...borders }
}

export const BORDER_THIN: BordersInput = {
  top: { style: "thin" },
  right: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
}

export const BORDER_MEDIUM_BOX: BordersInput = {
  top: { style: "medium" },
  right: { style: "medium" },
  bottom: { style: "medium" },
  left: { style: "medium" },
}
