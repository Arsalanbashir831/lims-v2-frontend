/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { getSectionDataByAccessor } from '@/lib/pqr-utils';

export const TensileTestView = ({ tensileTestData, isAsme }: { tensileTestData: any; isAsme: boolean }) => {
  if (!tensileTestData || !tensileTestData.data)
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Tensile Test data not available.
      </p>
    );
  const columns = tensileTestData.columns || [];
  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            <th
              colSpan={columns.length || 1}
              className="p-2 text-left font-semibold"
            >
              Tensile Test {isAsme && '(QW-150)'}
            </th>
          </tr>
          <tr className="border-y dark:bg-sidebar">
            {columns.map((col: any) => (
              <th
                key={col.id}
                className="border-r p-2 font-medium text-gray-600 dark:text-gray-300 last:border-r-0"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tensileTestData.data.map((row: any) => (
            <tr key={row.id} className="border-b">
              {columns.map((col: any) => (
                <td key={col.id} className="border-r p-2 last:border-r-0">
                  {getSectionDataByAccessor(row, col.accessorKey) as any}
                </td>
              ))}
            </tr>
          ))}
          {tensileTestData.data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="p-2 text-center text-gray-500"
              >
                No tensile test data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
