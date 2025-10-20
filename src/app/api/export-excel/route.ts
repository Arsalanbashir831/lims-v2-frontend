// app/api/export-excel/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import sharp from "sharp";
import { applyBorders } from "@/lib/utils";

/* ---------- small utils ---------- */
const pxToPt = (px: number) => Math.round((px * 72) / 96);
const colLetter = (i: number) => {
  let s = "";
  while (i > 0) {
    const r = (i - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
};
const isDateish = (v: unknown) =>
  v instanceof Date ||
  (typeof v === "string" &&
    (/\d{4}-\d{2}-\d{2}/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) &&
    !isNaN(new Date(v).getTime()));
const toExcelDate = (v: unknown) => (isDateish(v) ? new Date(v as any) : v);

/* read file or base64 (png/jpeg/webp), scale to max height, return PNG buffer + size */
async function loadImageAsPng(
  srcPath?: string,
  base64?: string,
  maxHeightPx = 100
): Promise<{ buf: Buffer; w: number; h: number } | null> {
  let img: sharp.Sharp | null = null;

  if (base64) {
    const m = base64.match(/^data:image\/(\w+);base64,(.+)$/i);
    const input = m ? Buffer.from(m[2], "base64") : Buffer.from(base64, "base64");
    img = sharp(input);
  } else if (srcPath) {
    const rel = srcPath.replace(/^\/+/, "");
    const p = path.join(process.cwd(), "public", rel);
    if (!fs.existsSync(p)) return null;
    img = sharp(fs.readFileSync(p));
  } else return null;

  const meta = await img.metadata();
  if (!meta.height || !meta.width) return null;

  const scale = maxHeightPx / meta.height;
  const h = Math.round(meta.height * scale);
  const w = Math.round(meta.width * scale);
  const buf = await img.resize({ height: maxHeightPx }).png().toBuffer();
  return { buf, w, h };
}

/* ---------- types ---------- */
interface Column { key: string; label: string }
interface RowData { [k: string]: string | number | boolean | null | undefined }
interface RequestData {
  columns: Column[];
  data: RowData[];
  fileName: string;
  logoBase64?: string;
  imagePath?: string;
  rightLogoBase64?: string;
  rightImagePath?: string;
}

/* ---------- main handler ---------- */
export async function POST(req: Request) {
  try {
    const body: RequestData = await req.json();
    const { columns, data, fileName, logoBase64, imagePath, rightLogoBase64, rightImagePath } = body;

    const totalCols = Math.max(columns.length, 1);
    const lastCol = colLetter(totalCols);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Records", { views: [{ showGridLines: false }] });

    /* logos */
    const LEFT_MAX_H = 100;
    const RIGHT_MAX_H = 100;

    const leftImg = await loadImageAsPng(imagePath, logoBase64, LEFT_MAX_H);
    if (leftImg) {
      const id = wb.addImage({ base64: leftImg.buf.toString('base64'), extension: "png" });
      ws.addImage(id, { tl: { col: 0, row: 0 }, ext: { width: leftImg.w, height: leftImg.h } });
      ws.getRow(1).height = Math.max(ws.getRow(1).height ?? 0, pxToPt(leftImg.h) + 6);
    }

    const rightImg = await loadImageAsPng(rightImagePath, rightLogoBase64, RIGHT_MAX_H);
    if (rightImg) {
      const lastColIndex = Math.max(totalCols - 1, 0); // always anchor to last column
      const id = wb.addImage({ base64: rightImg.buf.toString('base64'), extension: "png" });
      ws.addImage(id, { tl: { col: lastColIndex, row: 0 }, ext: { width: rightImg.w, height: rightImg.h } });
      ws.getRow(1).height = Math.max(ws.getRow(1).height ?? 0, pxToPt(rightImg.h) + 6);
    }

    /* title row */
    ws.mergeCells(`A3:${lastCol}3`);
    const title = ws.getCell("A3");
    title.value = "GRIPCO MATERIAL TESTING LABORATORY";
    title.font = { name: "Calibri", bold: true, size: 20, color: { argb: "FF000000" } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBFBFBF" } };
    applyBorders(title, { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "medium" }, right: { style: "medium" } });
    ws.getRow(3).height = 30;

    /* row 5 split: left label + right updated date */
    const rightStart = Math.max(totalCols - 2, 1);
    ws.mergeCells(`A5:${colLetter(rightStart - 1)}5`);
    const leftBlock = ws.getCell("A5");
    leftBlock.value = fileName.split(".")[0].replace(/_/g, " ");
    leftBlock.font = { name: "Calibri", bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    leftBlock.alignment = { horizontal: "center", vertical: "middle" };
    leftBlock.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA6A6A6" } };
    applyBorders(leftBlock, { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "medium" } });

    ws.mergeCells(`${colLetter(rightStart)}5:${lastCol}5`);
    const rightBlock = ws.getCell(`${colLetter(rightStart)}5`);
    const d = new Date();
    rightBlock.value = `Updated: ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    rightBlock.font = { name: "Calibri", bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    rightBlock.alignment = { horizontal: "center", vertical: "middle" };
    rightBlock.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA6A6A6" } };
    applyBorders(rightBlock, { top: { style: "medium" }, bottom: { style: "medium" }, right: { style: "medium" } });
    ws.getRow(5).height = 22;

    /* column widths */
    const widths = columns.map((c) => {
      let m = (c.label ?? "").toString().length;
      data.forEach((r) => (m = Math.max(m, (r[c.key] ?? "").toString().length)));
      return Math.max(m + 2, 10);
    });
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

    /* header */
    let r = 7;
    const header = ws.getRow(r);
    columns.forEach((c, i) => {
      const cell = header.getCell(i + 1);
      const parts = (c.label ?? "").toString().split(/\s+/);
      const titleCase = parts
        .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(" ");
      cell.value = titleCase;
      cell.font = { name: "Calibri", bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBFBFBF" } };
      applyBorders(cell, {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: i === 0 ? "medium" : undefined },
        right: { style: i === columns.length - 1 ? "medium" : undefined },
      });
    });
    header.height = 20;
    header.commit();
    r++;

    /* detect date columns */
    const dateCols = new Set<number>();
    columns.forEach((c, i) => {
      if (/\bdate\b/i.test(c.label) || (data.length && isDateish(data[0][c.key]))) {
        dateCols.add(i);
        ws.getColumn(i + 1).numFmt = "dd/mm/yyyy";
      }
    });

    /* rows */
    data.forEach((row, ri) => {
      const excelRow = ws.getRow(r);
      columns.forEach((c, i) => {
        const cell = excelRow.getCell(i + 1);
        const v = toExcelDate(row[c.key]);
        cell.value = v as any;
        if (dateCols.has(i) && v) cell.numFmt = "dd/mm/yyyy";
        cell.font = { name: "Calibri", size: 10 };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ri % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF" } };
        applyBorders(cell, {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: i === 0 ? "medium" : "thin" },
          right: { style: i === columns.length - 1 ? "medium" : "thin" },
        });
      });
      excelRow.height = 18;
      excelRow.commit();
      r++;
    });

    /* footer */
    const foot = {
      font: { name: "Calibri", bold: true, size: 10, color: { argb: "FF000000" } },
      fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF2F2F2" } },
      border: { top: { style: "thin" as const }, bottom: { style: "thin" as const }, left: { style: "thin" as const }, right: { style: "thin" as const } },
    };
    r += 2;
    ws.mergeCells(`A${r}:${lastCol}${r}`);
    const f1 = ws.getCell(`A${r}`);
    f1.value = "LIMS Coordinator on authority of GRIPCO MATERIAL TESTING";
    f1.font = foot.font; f1.fill = foot.fill; f1.alignment = { horizontal: "center", vertical: "middle" }; f1.border = foot.border;
    ws.getRow(r).height = 18; r++;

    r++;
    [
      { t: "Statement:", b: true, h: 0, bd: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "none" } } },
      { t: "Commercial Registration No: 2015253768 (IAS accredited lab reference # TL-1305)", b: false, h: 0, bd: { top: { style: "none" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "none" } } },
      {
        t:
          "All works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia) " +
          "are subjected to and conducted with the standard terms and conditions of GRIPCO MATERIAL TESTING which are available " +
          "at the GRIPCO Site Terms and Conditions or upon request. This document may not be reproduced other than in full except " +
          "with the prior written approval of the issuing laboratory. These results relate only to the item(s) tested/sampling " +
          "conducted by the organization indicated. No deviations were observed during the testing process.",
        b: false,
        h: 60,
        bd: { top: { style: "none" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } },
      },
    ].forEach((it) => {
      ws.mergeCells(`A${r}:${lastCol}${r}`);
      const c = ws.getCell(`A${r}`);
      c.value = it.t;
      c.font = { name: "Calibri", bold: it.b, size: 11, color: { argb: "FF000000" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
      c.alignment = { horizontal: "left", vertical: it.h ? "top" : "middle", wrapText: true };
      c.border = it.bd as any;
      if (it.h) ws.getRow(r).height = it.h;
      r++;
    });

    const buffer = await wb.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${fileName ?? "Export.xlsx"}`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
