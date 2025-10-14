import { getSectionDataByAccessor } from '@/lib/pqr-utils';
import { DynamicColumn, DynamicRow } from '../../form/dynamic-table';

interface SectionData {
  columns: DynamicColumn[];
  data: DynamicRow[];
}

export const WeldingParametersView = ({ weldingParamsData }: { weldingParamsData: SectionData }) => {
  if (!weldingParamsData || !weldingParamsData.data)
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Welding Parameters not available.
      </p>
    );
  const columns = weldingParamsData.columns || [];
  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            <th
              colSpan={columns.length || 1}
              className="p-2 text-left font-semibold"
            >
              WELDING PARAMETERS
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
          {weldingParamsData.data.map((row: DynamicRow) => (
            <tr key={row.id} className="border-b">
              {columns.map((col: DynamicColumn) => (
                <td key={col.id} className="border-r p-2 last:border-r-0">
                  {getSectionDataByAccessor(row, col.accessorKey)}
                </td>
              ))}
            </tr>
          ))}
          {weldingParamsData.data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="p-2 text-center text-gray-500"
              >
                No welding parameters data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-muted-foreground mt-1 p-2 text-xs">
        Note: Heat input calculated based on average values of welding
        parameters
      </p>
    </div>
  );
};
