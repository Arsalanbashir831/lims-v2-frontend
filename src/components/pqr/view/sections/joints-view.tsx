import { getSectionDataByAccessor } from '@/lib/pqr-utils';

interface JointColumn {
  id: string;
  accessorKey: string;
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
    <div className="mt-4 overflow-hidden border">
      <div className="dark:bg-sidebar  p-2">
        <h3 className="text-left font-semibold">
          JOINTS {isAsme && '(QW-402)'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Left side - Table */}
        <div className="overflow-x-auto ">
          <table className="w-full text-sm border">
            {columns.length > 0 && !columns.some(col => col.accessorKey === 'label' || col.accessorKey === 'value') && (
              <thead>
                <tr className="border-y dark:bg-sidebar">
                  {columns.map((col: JointColumn) => (
                    <th
                      key={col.id}
                      className="border-r p-2 font-medium text-gray-600 dark:text-gray-300 last:border-r-0"
                    >
                      {(col as any).header || col.accessorKey}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody >
              {hasData ? (
                // Check if this is a label-value table or multi-column table
                // Label-value tables have columns with accessorKey 'label' and 'value'
                columns.some(col => col.accessorKey === 'label' || col.accessorKey === 'value')
                  ? (data || []).map((item: JointRow | JointItem) => {
                      if (isJointItem(item)) {
                        return (
                          <tr key={item.id} className="border-b  last:border-b-0">
                            <td className="border-r p-3 font-medium w-1/2">
                              {item.label}
                            </td>
                            <td className="p-3 w-1/2">
                              {item.value !== undefined && item.value !== null && item.value !== '' 
                                ? String(item.value) 
                                : '-'}
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })
                  : (data || []).map((item: JointRow | JointItem) => {
                      if (isJointRow(item)) {
                        return (
                          <tr key={item.id} className="border-b">
                            {columns.map((col: JointColumn) => (
                              <td key={col.id} className="border-r border-gray-200 p-3 last:border-r-0">
                                {getSectionDataByAccessor(item, col.accessorKey)}
                              </td>
                            ))}
                          </tr>
                        );
                      }
                      return null;
                    })
              ) : (
                <tr>
                  <td
                    colSpan={(columns && columns.length) || 2}
                    className="p-4 text-center text-gray-500"
                  >
                    No joints data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Right side - Image */}
        <div className="flex items-center justify-center">
          {designPhotoUrl ? (
            <img
              src={designPhotoUrl}
              alt="Joint Design Sketch"
              className="max-h-64 w-full object-contain p-2"
            />
          ) : (
            <div className="text-center text-gray-400 p-4">
              No joint design sketch available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
