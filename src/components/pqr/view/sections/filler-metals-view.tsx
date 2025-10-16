
import { getSectionDataByAccessor } from '@/lib/pqr-utils';
import { SectionData } from '@/types/pqr';
import { DynamicColumn, DynamicRow } from '../../form/dynamic-table';


export const FillerMetalsView = ({ fillerMetalsData, isAsme }: { fillerMetalsData: SectionData; isAsme: boolean }) => {
  if (!fillerMetalsData || !fillerMetalsData.data) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Filler Metals information not available.
      </p>
    );
  }

  const columns = fillerMetalsData.columns || [];
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
                FILLER METALS {isAsme && '(QW-404)'}
              </th>
            </tr>
            <tr className="border-y dark:bg-sidebar">
              {columns.map((col: DynamicColumn) => (
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
            {(fillerMetalsData.data || []).map((row: DynamicRow) => (
              <tr key={row.id} className="border-b">
                {columns.map((col: DynamicColumn) => (
                  <td key={col.id} className="border-r p-2 last:border-r-0">
                    {getSectionDataByAccessor(row, col.accessorKey)}
                  </td>
                ))}
              </tr>
            ))}
            {fillerMetalsData.data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="p-2 text-center text-gray-500"
                >
                  No filler metals data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback to simple label/value
  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            <th
              colSpan={2}
              className="p-2 text-left font-semibold"
            >
              FILLER METALS {isAsme && '(QW-404)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {(fillerMetalsData.data || []).map((item: DynamicRow) => (
            <tr key={item.id} className="border-b">
              <td className="w-1/3 border-r p-2 font-medium text-gray-600 dark:text-gray-300">
                {item.label || item.description || 'N/A'}
              </td>
              <td className="w-2/3 p-2">
                {item.value !== undefined ? String(item.value) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
