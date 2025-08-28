import { getSectionDataByAccessor } from '@/lib/pqr-utils';

export const GuidedBendTestView = ({ guidedBendTestData, isAsme }: { guidedBendTestData: any; isAsme: boolean }) => {
  if (!guidedBendTestData || !guidedBendTestData.data)
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Guided Bend Test data not available.
      </p>
    );
  const columns = guidedBendTestData.columns || [];
  return (
    <div className="mt-4 overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="dark:bg-sidebar">
            <th
              colSpan={columns.length || 1}
              className="p-2 text-left font-semibold"
            >
              Guided Bend Test {isAsme && '(QW-160)'}
            </th>
          </tr>
          <tr className="border-b dark:bg-sidebar">
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
          {guidedBendTestData.data.map((row: any) => (
            <tr key={row.id} className="border-b">
              {columns.map((col: any) => (
                <td key={col.id} className="border-r p-2 last:border-r-0">
                  {getSectionDataByAccessor(row, col.accessorKey) as any}
                </td>
              ))}
            </tr>
          ))}
          {guidedBendTestData.data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="p-2 text-center text-gray-500"
              >
                No guided bend test data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
