import { getSectionDataByAccessor } from '@/lib/pqr-utils';
import { SectionData } from '@/types/pqr';
import { DynamicColumn, DynamicRow } from '../../form/dynamic-table';

export const PWHTGasView = ({ pwhtData, gasData, isAsme }: { pwhtData: SectionData; gasData: SectionData; isAsme: boolean }) => {
  const pwhtCols = pwhtData?.columns || [];
  const gasCols = gasData?.columns || [];

  return (
    <div className="mt-4 grid gap-6 sm:gap-8 md:grid-cols-2">
      <div className="overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y dark:bg-sidebar">
              <th
                colSpan={pwhtCols.length > 0 ? pwhtCols.length : 2}
                className="p-2 text-left font-semibold"
              >
                POST WELD HEAT TREATMENT {isAsme && '(QW-407)'}
              </th>
            </tr>
            {pwhtCols.length > 0 && (
              <tr className="border-y dark:bg-sidebar">
                {pwhtCols.map((col: DynamicColumn) => (
                  <th
                    key={col.id}
                    className="border-r p-2 font-medium text-gray-600 dark:text-gray-300 last:border-r-0"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {pwhtCols.length > 0
              ? (pwhtData?.data || []).map((row: DynamicRow) => (
                  <tr key={row.id} className="border-b">
                    {pwhtCols.map((col: DynamicColumn) => (
                      <td key={col.id} className="border-r p-2 last:border-r-0">
                        {getSectionDataByAccessor(row, col.accessorKey)}
                      </td>
                    ))}
                  </tr>
                ))
              : (pwhtData?.data || []).map((item: DynamicRow) => (
                  <tr key={item.id} className="border-b">
                    <td className="w-1/2 border-r p-2 font-medium text-gray-600">
                      {item.label}
                    </td>
                    <td className="w-1/2 p-2">{item.value}</td>
                  </tr>
                ))}
            {(!pwhtData?.data || pwhtData.data.length === 0) && (
              <tr>
                <td
                  colSpan={pwhtCols.length > 0 ? pwhtCols.length : 2}
                  className="p-2 text-center text-gray-500"
                >
                  No PWHT data.
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
                colSpan={gasCols.length || 1}
                className="p-2 text-left font-semibold"
              >
                GAS {isAsme && '(QW-408)'}
              </th>
            </tr>
            {gasCols.length > 0 && (
              <tr className="border-y dark:bg-sidebar">
                {gasCols.map((col: DynamicColumn) => (
                  <th
                    key={col.id}
                    className="border-r p-2 font-medium text-gray-600 dark:text-gray-300 last:border-r-0"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {(gasData?.data || []).map((row: DynamicRow) => (
              <tr key={row.id} className="border-b">
                {gasCols.map((col: DynamicColumn) => (
                  <td key={col.id} className="border-r p-2 last:border-r-0">
                    {getSectionDataByAccessor(row, col.accessorKey)}
                  </td>
                ))}
              </tr>
            ))}
            {(!gasData?.data || gasData.data.length === 0) && (
              <tr>
                <td
                  colSpan={gasCols.length || 1}
                  className="p-2 text-center text-gray-500"
                >
                  No gas data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="text-muted-foreground mt-1 p-2 text-xs">Note:</p>
      </div>
    </div>
  );
};
