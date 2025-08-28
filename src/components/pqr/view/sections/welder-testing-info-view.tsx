import React from 'react';

// utility to split array into chunks of size N
function chunkArray(arr: any[], size: number) {
  const chunks: any[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export const WelderTestingInfoView = ({ welderTestingInfoData }: { welderTestingInfoData: any }) => {
  const items = welderTestingInfoData?.data || [];

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Welder & Testing Info not available.
      </p>
    );
  }

  // make rows of two items
  const rows = chunkArray(items, 2);

  return (
    <div className="mt-4 overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((pair: any[], rowIndex: number) => (
            <tr key={rowIndex} className="border-b">
              {pair.map((item: any) => (
                <React.Fragment key={item.id}>
                  <td className="w-1/4 border-r p-2 font-medium text-gray-600 dark:text-gray-300">
                    {item.label}
                  </td>
                  <td className="w-1/4 border-r p-2">{item.value}</td>
                </React.Fragment>
              ))}
              {pair.length < 2 && (
                <>
                  <td className="w-1/4 border-r p-2"></td>
                  <td className="w-1/4 p-2"></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
