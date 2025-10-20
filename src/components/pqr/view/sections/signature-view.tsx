import { getSectionDataByAccessor } from '@/lib/pqr-utils';
import { DynamicColumn, DynamicRow } from '../../form/dynamic-table';

interface SectionData {
  columns: DynamicColumn[];
  data: DynamicRow[];
}

export const SignatureView = ({ signatureData }: { signatureData: SectionData }) => {
  if (
    !signatureData ||
    !signatureData.data ||
    signatureData.data.length === 0
  ) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Signature data not available.
      </p>
    );
  }

  const columns = signatureData.columns || [];

  return (
    <div className="mt-4 border overflow-hidden">
      <div className="dark:bg-sidebar p-2 text-center text-sm font-semibold">
        GLOBAL RESOURCES INSPECTION CONTRACTING CO.
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            {columns.map((col) => (
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
          {signatureData.data.map((row: DynamicRow) => (
            <tr key={row.id} className="border-b last:border-b-0">
              {columns.map((col) => (
                <td 
                  key={col.id} 
                  className="border-r p-2 text-center last:border-r-0"
                >
                  {getSectionDataByAccessor(row, col.accessorKey) || (
                    <span className="text-gray-400 italic">(No entry)</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
