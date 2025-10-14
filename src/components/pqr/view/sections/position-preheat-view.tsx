
export const PositionsPreheatView = ({
  positionsData,
  preheatData,
  isAsme,
}: { positionsData: DynamicRow; preheatData: DynamicRow; isAsme: boolean }) => {
  const posCols = positionsData?.columns || [];
  const preCols = preheatData?.columns || [];

  return (
    <div className="mt-4 grid gap-6 sm:gap-8 md:grid-cols-2">
      <div className="overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={posCols.length > 0 ? posCols.length : 2}
                className="p-2 text-left font-semibold"
              >
                POSITIONS {isAsme && '(QW-405)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {posCols.length > 0
              ? (positionsData?.data || []).map((row: DynamicRow) => (
                  <tr key={row.id} className="border-b">
                    {posCols.map((col: DynamicColumn) => (
                      <td key={col.id} className="border-r p-2 last:border-r-0">
                        {String(row[col.accessorKey] ?? 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))
              : (positionsData?.data || []).map((item: DynamicRow) => (
                  <tr key={item.id} className="border-b">
                    <td className="w-1/2 border-r p-2 font-medium text-gray-600">
                      {item.label}
                    </td>
                    <td className="w-1/2 p-2">{item.value}</td>
                  </tr>
                ))}
            {(!positionsData?.data || positionsData.data.length === 0) && (
              <tr>
                <td
                  colSpan={posCols.length > 0 ? posCols.length : 2}
                  className="p-2 text-center text-gray-500"
                >
                  No position data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={preCols.length > 0 ? preCols.length : 2}
                className="p-2 text-left font-semibold"
              >
                PREHEAT {isAsme && '(QW-406)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {preCols.length > 0
              ? (preheatData?.data || []).map((row: DynamicRow) => (
                  <tr key={row.id} className="border-b">
                    {preCols.map((col: DynamicColumn) => (
                      <td key={col.id} className="border-r p-2 last:border-r-0">
                        {String(row[col.accessorKey] ?? 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))
              : (preheatData?.data || []).map((item: DynamicRow) => (
                  <tr key={item.id} className="border-b">
                    <td className="w-1/2 border-r p-2 font-medium text-gray-600">
                      {item.label}
                    </td>
                    <td className="w-1/2 p-2">{item.value}</td>
                  </tr>
                ))}
            {(!preheatData?.data || preheatData.data.length === 0) && (
              <tr>
                <td
                  colSpan={preCols.length > 0 ? preCols.length : 2}
                  className="p-2 text-center text-gray-500"
                >
                  No preheat data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
