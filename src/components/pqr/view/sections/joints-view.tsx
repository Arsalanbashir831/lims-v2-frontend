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

  if (data.length === 0 && columns.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Joints information not available.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th
              colSpan={(columns && columns.length) || 2}
              className="p-2 text-left font-semibold text-gray-700"
            >
              JOINTS {isAsme && '(QW-402)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {columns && columns.length > 0
            ? (data || []).map((item: JointRow | JointItem) => {
                if (isJointRow(item)) {
                  return (
                    <tr key={item.id} className="border-b">
                      {columns.map((col: JointColumn) => (
                        <td key={col.id} className="border-r p-2 last:border-r-0">
                          {getSectionDataByAccessor(item, col.accessorKey)}
                        </td>
                      ))}
                    </tr>
                  );
                }
                return null;
              })
            : (data || []).map((item: JointRow | JointItem) => {
                if (isJointItem(item)) {
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="border-r p-2 font-medium text-gray-600">
                        {item.label}
                      </td>
                      <td className="p-2">
                        {item.value !== undefined ? String(item.value) : 'N/A'}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={(columns && columns.length) || 2}
                className="p-2 text-center text-gray-500"
              >
                No joints data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {designPhotoUrl && (
        <div className="p-2 text-center">
          <img
            src={designPhotoUrl}
            alt="Joint Design Photo"
            className="mx-auto max-h-64 object-contain"
          />
        </div>
      )}
    </div>
  );
};
