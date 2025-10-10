/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import React from 'react';

export const OtherTestsView = ({ otherTestsData }: { otherTestsData: any }) => {
  const cols = otherTestsData?.columns || [];
  const rows = otherTestsData?.data || [];

  if (rows.length === 0 || cols.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Other Tests data not available.
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
              Other Tests
            </th>
          </tr>
          <tr className="border-y dark:bg-sidebar">
            {cols.map((col: any) => (
              <th
                key={col.id}
                className={'p-2 font-medium text-gray-600 dark:text-gray-300' + (cols.indexOf(col) < cols.length - 1 ? ' border-r' : '')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id} className="border-b">
              {cols.map((col: any, i: number) => (
                <td
                  key={col.id}
                  className={'p-2' + (i < cols.length - 1 ? ' border-r' : '')}
                >
                  {row[col.accessorKey] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
