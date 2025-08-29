import { getSectionDataByAccessor } from '@/lib/pqr';

export const JointsView = ({ jointsData, isAsme }) => {
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
            ? (data || []).map((row) => (
                <tr key={row.id} className="border-b">
                  {columns.map((col) => (
                    <td key={col.id} className="border-r p-2 last:border-r-0">
                      {getSectionDataByAccessor(row, col.accessorKey)}
                    </td>
                  ))}
                </tr>
              ))
            : (data || []).map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="border-r p-2 font-medium text-gray-600">
                    {item.label}
                  </td>
                  <td className="p-2">
                    {item.value !== undefined ? String(item.value) : 'N/A'}
                  </td>
                </tr>
              ))}
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
