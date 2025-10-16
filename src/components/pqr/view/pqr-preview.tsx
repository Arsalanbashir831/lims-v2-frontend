"use client";

import { useEffect, useRef, useState } from "react";
import NextJSImage from "next/image";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { BaseMetalsView } from "./sections/base-metal-view";
import { CertificationView } from "./sections/certification-view";
import { ElectricalTechniquesView } from "./sections/electrical-techniques-view";
import { FillerMetalsView } from "./sections/filler-metals-view";
import { FilletWeldTestView } from "./sections/fillet-weld-test-view";
import { GuidedBendTestView } from "./sections/guided-bend-test-view";
import { HeaderInfoView } from "./sections/header-info-view";
import { JointsView } from "./sections/joints-view";
import { OtherTestsView } from "./sections/other-tests-view";
import { PositionsPreheatView } from "./sections/position-preheat-view";
import { PWHTGasView } from "./sections/pwht-gas-view";
import { SignatureView } from "./sections/signature-view";
import { TensileTestView } from "./sections/tensile-test-view";
import { ToughnessTestView } from "./sections/toughness-test-view";
import { WelderTestingInfoView } from "./sections/welder-testing-info-view";
import { WeldingParametersView } from "./sections/welding-parameters-view";

import { generatePdf } from "@/lib/pdf-utils";
import { BackButton } from "@/components/ui/back-button";
import { usePQR } from "@/hooks/use-pqr";


import { buildPqrView } from "@/utils/pqr-handlers";
import { PqrDataToView } from "@/types/pqr";
export default function PQRReportPreview({ showButton = true, isPublic = false }) {
  const params = useParams<{ id: string }>();
  const pqrId = params?.id;

  const [pqrDataToView, setPqrDataToView] = useState<PqrDataToView | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const { data: pqrResponse, isLoading: loadingView, error: errorResponse } = usePQR(pqrId ?? "");
  const contentRef = useRef<HTMLDivElement | null>(null);

  const publicPreviewBase = `${process.env.NEXT_PUBLIC_FRONTEND_URL}${ROUTES.PUBLIC?.PQR_PREVIEW(pqrId ?? "")}`;

  useEffect(() => {
    if (!pqrResponse?.data) return;
    try {
      setPqrDataToView(buildPqrView(pqrResponse.data));
    } catch (err) {
      console.error("Error transforming PQR data:", err);
      toast.error("Failed to transform PQR data for viewing.");
    }
  }, [pqrResponse]);

  useEffect(() => {
    if (!pqrId) return;
    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(publicPreviewBase, { margin: 1, width: 120 });
        setQrSrc(dataUrl);
      } catch {
        setQrSrc(null);
      }
    })();
  }, [pqrId, publicPreviewBase]);

  useEffect(() => {
    if (!loadingView && pqrDataToView) {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "DOCUMENT_READY", id: pqrId }, "*");
        }
      } catch {}
    }
  }, [loadingView, pqrDataToView, pqrId]);

  const handleGeneratePdf = async () => {
    if (!pqrId) return;
    try {
      const ok = await generatePdf(publicPreviewBase, pqrId);
      ok ? toast.info("Preparing your document...") : toast.error("Failed to prepare the document. Please try again.");
    } catch (e) {
      console.error("PDF generation failed:", e);
      toast.error("Failed to prepare the document. Please try again.");
    }
  };

  if (loadingView) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="mb-4 h-10 w-2/5" />
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="mb-4">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (errorResponse) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading PQR</AlertTitle>
          <AlertDescription>{errorResponse?.message || "Failed to load PQR data"}</AlertDescription>
        </Alert>
        <BackButton variant="default" label="Go Back" href={ROUTES.APP.WELDERS.PQR.ROOT} />
      </div>
    );
  }

  if (!pqrId) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No PQR ID provided for viewing.</AlertDescription>
        </Alert>
        <BackButton variant="default" label="Go Back" href={ROUTES.APP.WELDERS.PQR.ROOT} />
      </div>
    );
  }

  if (!pqrDataToView) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>No data available for this PQR record.</p>
        <BackButton variant="default" label="Go Back" href={ROUTES.APP.WELDERS.PQR.ROOT} />
      </div>
    );
  }

  const isAsme = true;

  return (
    <div className="max-w-7xl mx-auto rounded-2xl p-2 sm:p-4 md:p-8 print:bg-white print:p-0">
      <header className="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <NextJSImage src="/gripco-logo.webp" alt="Logo" width={300} height={60} className="h-24 w-64 bg-background" />
        </div>
        {isPublic && (
          <div className="flex items-center gap-2">
            <div>
              <NextJSImage src="/ias-logo-vertical.webp" alt="Logo" width={80} height={60} className="h-24 w-20" />
            </div>
            <div className="flex items-center gap-2">
              {qrSrc ? <NextJSImage src={qrSrc} alt="PQR Public Link" className="h-24 w-24" width={80} height={80} /> : null}
            </div>
          </div>
        )}
        {showButton && (
          <div className="space-x-2 flex items-center print:hidden">
            <Button onClick={handleGeneratePdf} variant="outline">Export PDF</Button>
            <BackButton variant="default" label="Back to List" href={ROUTES.APP.WELDERS.PQR.ROOT} />
          </div>
        )}
      </header>

      <div ref={contentRef} className="pqr-view-content space-y-4">
        <HeaderInfoView headerInfoData={pqrDataToView.headerInfo} />
        <JointsView jointsData={pqrDataToView.joints} isAsme={isAsme} />
        <BaseMetalsView baseMetalsData={pqrDataToView.baseMetals} isAsme={isAsme} />
        <FillerMetalsView fillerMetalsData={pqrDataToView.fillerMetals} isAsme={isAsme} />
        <PositionsPreheatView positionsData={pqrDataToView.positions} preheatData={pqrDataToView.preheat} isAsme={isAsme} />
        <PWHTGasView pwhtData={pqrDataToView.pwht} gasData={pqrDataToView.gas} isAsme={isAsme} />
        <ElectricalTechniquesView electricalData={pqrDataToView.electrical} techniquesData={pqrDataToView.techniques} isAsme={isAsme} />
        <WeldingParametersView weldingParamsData={pqrDataToView.weldingParameters} />
        <TensileTestView tensileTestData={pqrDataToView.tensileTest} isAsme={isAsme} />
        <GuidedBendTestView guidedBendTestData={pqrDataToView.guidedBendTest} isAsme={isAsme} />
        <ToughnessTestView toughnessTestData={pqrDataToView.toughnessTest} isAsme={isAsme} />
        <FilletWeldTestView filletWeldTestData={pqrDataToView.filletWeldTest} isAsme={isAsme} />
        <OtherTestsView otherTestsData={pqrDataToView.otherTests} />
        <WelderTestingInfoView welderTestingInfoData={pqrDataToView.welderTestingInfo} />
        <CertificationView certificationData={pqrDataToView.certification} />
        <SignatureView signatureData={pqrDataToView.signatures} />
      </div>
    </div>
  );
}
