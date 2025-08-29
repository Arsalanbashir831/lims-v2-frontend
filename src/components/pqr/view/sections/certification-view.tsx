export const CertificationView = ({ certificationData }: { certificationData: { data: { id: string; reference: string }[] } }) => {
  if (!certificationData || !certificationData.data) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Certification data not available.
      </p>
    );
  }
  const certificationText = certificationData.data[0].reference || 'N/A';
  return (
    <div className="mt-4 border p-4 text-sm">
      <p className="mb-2 font-bold">
        We certify that the statements in this record are correct and that the
        test welds were prepared, welded and tested in accordance with the
        requirements of:
      </p>
      <p className="w-fit font-medium whitespace-pre-wrap">
        {certificationText}
      </p>
    </div>
  );
};
