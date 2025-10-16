
import React from 'react';
import { getSectionDataByAccessor } from '@/lib/pqr-utils';
import { SectionData } from '@/types/pqr';
import { DynamicColumn, DynamicRow } from '../../form/dynamic-table';


export const FilletWeldTestView = ({ filletWeldTestData, isAsme }: { filletWeldTestData: SectionData; isAsme: boolean }) => {
  const cols = filletWeldTestData?.columns || [];
  const rows = filletWeldTestData?.data || [];

  if (cols.length === 0 || rows.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Fillet Weld Test data not available.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            <th
              colSpan={cols.length}
              className="p-2 text-left font-semibold"
            >
              Fillet Weld Test {isAsme && '(QW-180)'}
            </th>
          </tr>
          <tr className="border-y dark:bg-sidebar">
            {cols.map((col: DynamicColumn, i: number) => (
              <th
                key={col.id}
                className={
                  'p-2 font-medium text-gray-600 dark:text-gray-300' +
                  (i < cols.length - 1 ? ' border-r' : '')
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: DynamicRow) => (
            <tr key={row.id} className="border-b">
              {cols.map((col: DynamicColumn, i: number) => (
                <td
                  key={col.id}
                  className={'p-2' + (i < cols.length - 1 ? ' border-r' : '')}
                >
                  {getSectionDataByAccessor(row, col.accessorKey)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
