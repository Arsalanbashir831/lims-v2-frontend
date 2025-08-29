export const SignatureView = ({ signatureData }: { signatureData: any }) => {
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
  const sigRow = signatureData.data[0] || {};
  return (
    <div className="mt-4 border overflow-hidden">
      <div className="dark:bg-sidebar p-2 text-center text-sm font-semibold">
        GLOBAL RESOURCES INSPECTION CONTRACTING CO.
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y dark:bg-sidebar">
            <th className="w-1/3 border-r p-2 font-medium text-gray-600 dark:text-gray-300">
              Witnessing / Welding Inspector
            </th>
            <th className="w-1/3 border-r p-2 font-medium text-gray-600 dark:text-gray-300">
              Welding Supervisor
            </th>
            <th className="w-1/3 p-2 font-medium text-gray-600 dark:text-gray-300">
              Lab Testing Supervisor
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="h-16 border-r p-2 text-center">
              {sigRow.inspector || (
                <span className="text-gray-400 italic">(No entry)</span>
              )}
            </td>
            <td className="h-16 border-r p-2 text-center">
              {sigRow.supervisor || (
                <span className="text-gray-400 italic">(No entry)</span>
              )}
            </td>
            <td className="h-16 p-2 text-center">
              {sigRow.lab || (
                <span className="text-gray-400 italic">(No entry)</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
