
export const ElectricalTechniquesView = ({
  electricalData,
  techniquesData,
  isAsme,
}: { electricalData: DynamicRow; techniquesData: DynamicRow; isAsme: boolean }) => {
  const eCols = electricalData?.columns || [];
  const tCols = techniquesData?.columns || [];

  return (
    <div className="mt-4 grid gap-6 sm:gap-8 md:grid-cols-2">
      <div className="overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={eCols.length > 0 ? eCols.length : 2}
                className="p-2 text-left font-semibold"
              >
                ELECTRICAL CHARACTERISTICS {isAsme && '(QW-409)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {eCols.length > 0
              ? (electricalData?.data || []).map((row: DynamicRow) => (
                  <tr key={row.id} className="border-b">
                    {eCols.map((col: DynamicColumn) => (
                      <td key={col.id} className="border-r p-2 last:border-r-0">
                        {String(row[col.accessorKey] ?? 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))
              : (electricalData?.data || []).map((item: DynamicRow) => (
                  <tr key={item.id} className="border-b">
                    <td className="w-1/2 border-r p-2 font-medium text-gray-600">
                      {item.label}
                    </td>
                    <td className="w-1/2 p-2">{item.value}</td>
                  </tr>
                ))}
            {(!electricalData?.data || electricalData.data.length === 0) && (
              <tr>
                <td
                  colSpan={eCols.length > 0 ? eCols.length : 2}
                  className="p-2 text-center text-gray-500"
                >
                  No electrical data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="text-muted-foreground mt-1 p-2 text-xs">Notes:</p>
      </div>
      <div className="overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={tCols.length > 0 ? tCols.length : 2}
                className="p-2 text-left font-semibold"
              >
                TECHNIQUES {isAsme && '(QW-410)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {tCols.length > 0
              ? (techniquesData?.data || []).map((row: DynamicRow) => (
                  <tr key={row.id} className="border-b">
                    {tCols.map((col: DynamicColumn) => (
                      <td key={col.id} className="border-r p-2 last:border-r-0">
                        {String(row[col.accessorKey] ?? 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))
              : (techniquesData?.data || []).map((item: DynamicRow) => (
                  <tr key={item.id} className="border-b">
                    <td className="w-1/2 border-r p-2 font-medium text-gray-600">
                      {item.label}
                    </td>
                    <td className="w-1/2 p-2">{item.value}</td>
                  </tr>
                ))}
            {(!techniquesData?.data || techniquesData.data.length === 0) && (
              <tr>
                <td
                  colSpan={tCols.length > 0 ? tCols.length : 2}
                  className="p-2 text-center text-gray-500"
                >
                  No techniques data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
