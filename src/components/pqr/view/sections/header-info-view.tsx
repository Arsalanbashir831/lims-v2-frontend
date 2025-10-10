/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { getSectionDataByAccessor } from '@/lib/pqr-utils';

export const HeaderInfoView = ({ headerInfoData }: { headerInfoData: any }) => {
  if (!headerInfoData || !headerInfoData.data) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Header information not available.
      </p>
    );
  }

  const columns = headerInfoData.columns || [];

  if (columns.length > 0) {
    return (
      <div className="overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={columns.length}
                className="p-2 text-center font-semibold"
              >
                WELDING PROCEDURE QUALIFICATION RECORD (PQR)
              </th>
            </tr>
          </thead>
          <tbody>
            {(headerInfoData.data || []).map((row: any) => (
              <tr key={row.id} className="border-b">
                {columns.map((col: any) => (
                  <td key={col.id} className="border-r p-2 last:border-r-0">
                    {getSectionDataByAccessor(row, col.accessorKey) as any}
                  </td>
                ))}
              </tr>
            ))}
            {headerInfoData.data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="p-2 text-center text-gray-500"
                >
                  No header data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback to 2xN paired layout when columns are not defined
  const pairedData: any[] = [];
  for (let i = 0; i < (headerInfoData.data || []).length; i += 2) {
    pairedData.push([
      headerInfoData.data[i],
      headerInfoData.data[i + 1], // Might be undefined if odd
    ]);
  }

  return (
    <div className="overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th
              colSpan={4 as any}
              className="p-2 text-center font-semibold text-gray-700"
            >
              WELDING PROCEDURE QUALIFICATION RECORD (PQR)
            </th>
          </tr>
        </thead>
        <tbody>
          {pairedData.map((rowPair: any[], rowIndex: number) => (
            <tr key={rowIndex} className="border-b">
              <td className="w-1/4 border-r p-2 font-medium text-gray-600">
                {rowPair[0]?.description || 'N/A'}
              </td>
              <td className="w-1/4 border-r p-2">
                {rowPair[0]?.value || 'N/A'}
              </td>
              <td className="w-1/4 border-r p-2 font-medium text-gray-600">
                {rowPair[1]?.description || (rowPair[0] ? '' : 'N/A')}
              </td>
              <td className="w-1/4 p-2">
                {rowPair[1]?.value || (rowPair[0] ? '' : 'N/A')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
