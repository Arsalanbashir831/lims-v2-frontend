import { getSectionDataByAccessor } from '@/lib/pqr-utils';

export const BaseMetalsView = ({ baseMetalsData, isAsme }: { baseMetalsData: any; isAsme: boolean }) => {
  if (!baseMetalsData || !baseMetalsData.data) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Base Metals information not available.
      </p>
    );
  }

  const columns = baseMetalsData.columns || [];
  if (columns.length > 0) {
    return (
      <div className="mt-4 overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={columns.length}
                className="p-2 text-left font-semibold"
              >
                BASE METALS {isAsme && '(QW-403)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {(baseMetalsData.data || []).map((row: any) => (
              <tr key={row.id} className="border-b">
                {columns.map((col: any) => (
                  <td key={col.id} className="border-r p-2 last:border-r-0">
                    {getSectionDataByAccessor(row, col.accessorKey) as any}
                  </td>
                ))}
              </tr>
            ))}
            {baseMetalsData.data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="p-2 text-center text-gray-500"
                >
                  No base metals data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback to simple label/value rendering
  const otherRows = (baseMetalsData.data || []).filter(
    (d: any) => d.parameter !== 'P-No. & Group No. (1)'
  );

  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th
              colSpan={5 as any}
              className="p-2 text-left font-semibold text-gray-700"
            >
              BASE METALS {isAsme && '(QW-403)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {otherRows.map((item: any) => (
            <tr key={item.id} className="border-b">
              <td
                className="border-r p-2 font-medium text-gray-600"
                colSpan={1 as any}
              >
                {item.parameter || item.label || 'N/A'}
              </td>
              <td className="p-2" colSpan={4 as any}>
                {item.value1 !== undefined
                  ? String(item.value1)
                  : item.value !== undefined
                    ? String(item.value)
                    : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
