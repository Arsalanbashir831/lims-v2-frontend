import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

import { applyBorders } from '@/lib/utils';

// Define interfaces for type safety
interface Column {
  key: string;
  label: string;
}

interface RowData {
  [key: string]: string | number | boolean | null | undefined;
}

interface RequestData {
  columns: Column[];
  data: RowData[];
  fileName: string;
  logoBase64?: string;
  imagePath?: string;
  rightLogoBase64?: string;
  rightImagePath?: string;
}

export async function POST(req: Request) {
  try {
    // 1. parse request
    const {
      columns,
      data,
      fileName,
      logoBase64,
      imagePath,
      rightLogoBase64,
      rightImagePath,
    }: RequestData = await req.json();

    // helper: convert 1-based column index to Excel letter
    const getColLetter = (colIndex: number): string => {
      let letter = '';
      while (colIndex > 0) {
        const rem = (colIndex - 1) % 26;
        letter = String.fromCharCode(65 + rem) + letter;
        colIndex = Math.floor((colIndex - 1) / 26);
      }
      return letter;
    };

    // determine dynamic bounds
    const totalCols = columns.length; // number of data columns
    const lastCol = getColLetter(totalCols);
    const titleStart = 'A';
    const recordTitleEnd = getColLetter(Math.max(totalCols - 2, 1));
    const dateStart = getColLetter(Math.max(totalCols - 1, 1));

    // 2. create workbook & sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Records', {
      views: [{ state: 'normal', showGridLines: false }],
    });

    // 3. insert left logo
    let logoImageId;
    if (logoBase64) {
      const buffer = Buffer.from(logoBase64, 'base64');
      logoImageId = workbook.addImage({ buffer, extension: 'png' });
    } else if (imagePath) {
      const p = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(p)) {
        const b = fs.readFileSync(p);
        logoImageId = workbook.addImage({ buffer: b, extension: 'png' });
      }
    }
    if (logoImageId != null) {
      worksheet.addImage(logoImageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 350, height: 100 },
      });
      worksheet.getRow(1).height = 120;
    }

    // 4. insert right logo at last column
    let rightLogoImageId;
    if (rightLogoBase64) {
      const buffer = Buffer.from(rightLogoBase64, 'base64');
      rightLogoImageId = workbook.addImage({ buffer, extension: 'png' });
    } else if (rightImagePath) {
      const p = path.join(process.cwd(), 'public', rightImagePath);
      if (fs.existsSync(p)) {
        const b = fs.readFileSync(p);
        rightLogoImageId = workbook.addImage({ buffer: b, extension: 'png' });
      }
    }
    if (rightLogoImageId != null) {
      worksheet.addImage(rightLogoImageId, {
        tl: { col: totalCols - 1, row: 0 },
        ext: { width: 100, height: 120 },
      });
    }

    // 5. header title merge (row 3)
    worksheet.mergeCells(`${titleStart}3:${lastCol}3`);
    const titleCell = worksheet.getCell(`${titleStart}3`);
    titleCell.value = 'GRIPCO MATERIAL TESTING LABORATORY';
    titleCell.font = {
      name: 'Calibri',
      bold: true,
      size: 20,
      color: { argb: 'FF000000' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBFBFBF' },
    };
    applyBorders(titleCell, {
      top: { style: 'medium' },
      bottom: { style: 'medium' },
      left: { style: 'medium' },
      right: { style: 'medium' },
    });
    worksheet.getRow(3).height = 30;

    // 6. record title merge (row 5)
    worksheet.mergeCells(`${titleStart}5:${recordTitleEnd}5`);
    const recordCell = worksheet.getCell(`${titleStart}5`);
    recordCell.value = fileName.split('.')[0].replace(/_/g, ' ');
    recordCell.font = {
      name: 'Calibri',
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
    };
    recordCell.alignment = { horizontal: 'center', vertical: 'middle' };
    recordCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA6A6A6' },
    };
    applyBorders(recordCell, {
      top: { style: 'medium' },
      bottom: { style: 'medium' },
      left: { style: 'medium' },
      right: { style: 'medium' },
    });

    // 7. updated date merge (row 5)
    worksheet.mergeCells(`${dateStart}5:${lastCol}5`);
    const dateCell = worksheet.getCell(`${dateStart}5`);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    dateCell.value = `Updated: ${formattedDate}`;
    dateCell.font = {
      name: 'Calibri',
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
    };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA6A6A6' },
    };
    applyBorders(dateCell, {
      top: { style: 'medium' },
      bottom: { style: 'medium' },
      left: { style: 'medium' },
      right: { style: 'medium' },
    });

    // 8. dynamic column widths
    const dynamicWidths = columns.map((col: Column) => {
      let maxLen = (col.label ?? '').toString().length;
      data.forEach((row: RowData) => {
        maxLen = Math.max(maxLen, (row[col.key] ?? '').toString().length);
      });
      return maxLen + 2;
    });
    
    // Ensure the last column (date column) has enough width for the date text
    const dateText = `Updated: ${formattedDate}`;
    const dateColumnIndex = totalCols - 1;
    const requiredDateWidth = Math.max(dynamicWidths[dateColumnIndex] || 0, dateText.length + 5);
    dynamicWidths[dateColumnIndex] = requiredDateWidth;
    
    dynamicWidths.forEach((w: number, i: number) => (worksheet.getColumn(i + 1).width = w));

    // 9. header row (row 7)
    let currentRow = 7;
    const headerRow = worksheet.getRow(currentRow);
    columns.forEach((col: Column, idx: number) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = col.label;
      cell.font = {
        name: 'Calibri',
        bold: true,
        size: 11,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFBFBFBF' },
      };
      applyBorders(cell, {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: idx === 0 ? 'medium' : undefined },
        right: { style: idx === columns.length - 1 ? 'medium' : undefined },
      });
    });
    headerRow.height = 20;
    headerRow.commit();
    currentRow++;

    // 10. data rows
    data.forEach((rowObj: RowData, rIdx: number) => {
      const row = worksheet.getRow(currentRow);
      columns.forEach((col: Column, idx: number) => {
        const cell = row.getCell(idx + 1);
        cell.value = rowObj[col.key] ?? '';
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rIdx % 2 === 0 ? 'FFF2F2F2' : 'FFFFFFFF' },
        };
        applyBorders(cell, {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: idx === 0 ? 'medium' : 'thin' },
          right: { style: idx === columns.length - 1 ? 'medium' : 'thin' },
        });
      });
      row.height = 18;
      row.commit();
      currentRow++;
    });

    // 11. footer formatting
    const footerStyles = {
      font: {
        name: 'Calibri',
        bold: true,
        size: 10,
        color: { argb: 'FF000000' },
      },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    currentRow += 2;
    ['LIMS Coordinator on authority of GRIPCO MATERIAL TESTING'].forEach(
      (text) => {
        worksheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
        const c = worksheet.getCell(`A${currentRow}`);
        c.value = text;
        c.font = footerStyles.font;
        c.fill = footerStyles.fill;
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = footerStyles.border;
        worksheet.getRow(currentRow).height = 18;
        currentRow++;
      }
    );

    // blank line
    currentRow++;

    // Statement block with border only
    [
      {
        text: 'Statement:',
        bold: true,
        size: 11,
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'none' },
        },
      },
      {
        text: 'Commercial Registration No: 2015253768 (IAS accredited lab reference # TL-1305)',
        bold: false,
        size: 11,
        border: {
          top: { style: 'none' },
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'none' },
        },
      },
      {
        text:
          'All works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia) ' +
          'are subjected to and conducted with the standard terms and conditions of GRIPCO MATERIAL TESTING which are available ' +
          'at the GRIPCO Site Terms and Conditions or upon request. This document may not be reproduced other than in full except ' +
          'with the prior written approval of the issuing laboratory. These results relate only to the item(s) tested/sampling ' +
          'conducted by the organization indicated. No deviations were observed during the testing process.',
        bold: false,
        wrap: true,
        height: 60,
        border: {
          top: { style: 'none' },
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
        },
      },
    ].forEach((item) => {
      worksheet.mergeCells(`A${currentRow}:${lastCol}${currentRow}`);
      const c = worksheet.getCell(`A${currentRow}`);
      c.value = item.text;
      c.font = {
        name: 'Calibri',
        bold: item.bold,
        size: item.size ?? 10,
        color: { argb: 'FF000000' },
      };
      c.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
      c.alignment = {
        horizontal: 'left',
        vertical: item.wrap ? 'top' : 'middle',
        wrapText: !!item.wrap,
      };
      c.border = item.border;
      if (item.height) worksheet.getRow(currentRow).height = item.height;
      currentRow++;
    });

    // 12. write & return
    const buffer = await workbook.xlsx.writeBuffer();
    const outName = fileName ?? 'Proficiency_Testing.xlsx';
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename=${outName}`,
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}