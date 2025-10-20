import { getSectionDataByAccessor } from '@/lib/pqr-utils';

interface JointColumn {
  id: string;
  accessorKey: string;
  header?: string;
}

interface JointRow {
  id: string;
  [key: string]: string | number | boolean | undefined;
}

interface JointItem {
  id: string;
  label: string;
  value?: string | number;
}

interface JointsData {
  data: JointRow[] | JointItem[];
  designPhotoUrl?: string;
  columns: JointColumn[];
}

// Type guard functions
function isJointRow(item: JointRow | JointItem): item is JointRow {
  return 'id' in item && !('label' in item);
}

function isJointItem(item: JointRow | JointItem): item is JointItem {
  return 'label' in item;
}

export const JointsView = ({ jointsData, isAsme }: { jointsData: JointsData; isAsme: boolean }) => {
  const { data = [], designPhotoUrl, columns = [] } = jointsData || {};


  // Show section even if only image exists
  const hasData = data.length > 0;
  const hasImage = !!designPhotoUrl;

  if (!hasData && !hasImage) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Joints information not available.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden border pqr-joints-section">
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="align-top w-1/2 border-y">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
            {/* Show column headers for multi-column tables */}
            {columns.length > 0 && (
              <thead>
                <tr className="dark:bg-sidebar border-y">
                  <th
                    colSpan={columns.length}
                    className="p-2 text-left font-semibold"
                  >
                    JOINTS {isAsme && '(QW-402)'}
                  </th>
                </tr>
                <tr className="border-y dark:bg-sidebar">
                  {columns.map((col: JointColumn) => (
                    <th
                      key={col.id}
                      className="border-r p-2 font-medium text-gray-600 dark:text-gray-300 last:border-r-0"
                    >
                      {col.header || col.accessorKey}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {hasData ? (
                (data || []).map((item: JointRow | JointItem) => (
                  <tr key={item.id} className="border-b">
                    {columns.map((col: JointColumn) => (
                      <td key={col.id} className="border-r p-3 last:border-r-0">
                        {getSectionDataByAccessor(item, col.accessorKey) || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(columns && columns.length) || 2} className="p-4 text-center text-gray-500">
                    No joints data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
            </td>
            <td className="align-top w-1/2">
              <div className="flex items-center justify-center">
                {designPhotoUrl ? (
                  <img
                    src={designPhotoUrl}
                    alt="Joint Design Sketch"
                    className="max-h-60 w-full object-contain p-2 pqr-joints-image"
                  />
                ) : (
                  <div className="text-center text-gray-400 p-4">No joint design sketch available</div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
