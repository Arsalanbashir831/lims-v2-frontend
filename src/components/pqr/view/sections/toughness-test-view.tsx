
import { getSectionDataByAccessor } from '@/lib/pqr-utils';
import { SectionData } from '@/types/pqr';
import { DynamicColumn, DynamicRow } from '../../form/dynamic-table';


export const ToughnessTestView = ({ toughnessTestData, isAsme }: { toughnessTestData: SectionData; isAsme: boolean }) => {
  if (!toughnessTestData || !toughnessTestData.data)
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Toughness Test data not available.
      </p>
    );
  const columns = toughnessTestData.columns || [];
  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            <th
              colSpan={columns.length || 1}
              className="p-2 text-left font-semibold"
            >
              Toughness Test {isAsme && '(QW-170)'}
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
          {toughnessTestData.data.map((row: DynamicRow) => (
            <tr key={row.id} className="border-b">
              {columns.map((col: DynamicColumn) => (
                <td key={col.id} className="border-r p-2 last:border-r-0">
                  {getSectionDataByAccessor(row, col.accessorKey)}
                </td>
              ))}
            </tr>
          ))}
          {toughnessTestData.data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="p-2 text-center text-gray-500"
              >
                No toughness test data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
