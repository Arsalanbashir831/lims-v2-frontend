"use client";

import { useEffect, useRef, useState } from "react";
import NextJSImage from "next/image";
import { useParams, useRouter } from "next/navigation";
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
import { OtherTestsView } from "./sections/other-tests-view";
import { PositionsPreheatView } from "./sections/position-preheat-view";
import { PWHTGasView } from "./sections/pwht-gas-view";
import { SignatureView } from "./sections/signature-view";
import { TensileTestView } from "./sections/tensile-test-view";
import { ToughnessTestView } from "./sections/toughness-test-view";
import { WelderTestingInfoView } from "./sections/welder-testing-info-view";
import { WeldingParametersView } from "./sections/welding-parameters-view";
import { DynamicColumn, DynamicRow } from "../form/dynamic-table";
import { generatePdf } from "@/lib/pdf-utils";

const DUMMY_PQR_DATA = {
  headerInfo: {
    columns: [
      { id: "h-desc", header: "Description", accessorKey: "description", type: "label" },
      { id: "h-val", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "s1r1", description: "Contractor Name", value: "ACME Corp" },
      { id: "s1r2", description: "Document No.", value: "DOC-2025-001" },
      { id: "s1r3", description: "PQR No.", value: "PQR-001" },
      { id: "s1r4", description: "Page No.", value: "1 of 5" },
      { id: "s1r5", description: "Supporting PWPS No.", value: "PWPS-42" },
      { id: "s1r6", description: "Date of Issue", value: "2025-01-15" },
      { id: "s1r7", description: "Welding Process(es)", value: "GTAW + SMAW" },
      { id: "s1r8", description: "Date of Welding", value: "2025-01-20" },
      { id: "s1r9", description: "Type", value: "Procedure Qualification" },
      { id: "s1r10", description: "Code Reference", value: "ASME SEC IX" },
      { id: "s1r11", description: "BI #", value: "BI-7788" },
      { id: "s1r12", description: "Contract #", value: "CT-555-AX" },
      { id: "s1r13", description: "Client/End User", value: "Globex" },
      { id: "s1r14", description: "Date of Testing", value: "2025-01-25" },
    ],
  },

  joints: {
    columns: [
      { id: "j-label", header: "Parameter", accessorKey: "label", type: "label" },
      { id: "j-value", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "jd", label: "Joint Design", value: "V-groove, 60° included angle" },
      { id: "jb", label: "Backing (Yes/No)", value: "No" },
      { id: "jbm", label: "Backing Material Type", value: "-" },
      { id: "jo", label: "Others", value: "—" },
    ],
    designPhotoUrl: "",
  },

  baseMetals: {
    columns: [
      { id: "bm-label", header: "Parameter", accessorKey: "label", type: "label" },
      { id: "bm-value", header: "Specification", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "bm1", label: "Process(es)", value: "GTAW / SMAW" },
      { id: "bm2", label: "SFA Specification", value: "SFA-5.5" },
      { id: "bm3", label: "AWS Classification", value: "E7018" },
      { id: "bm4", label: "Base Metal F-No.", value: "—" },
      { id: "bm5", label: "Base Metal Analysis A-No.", value: "—" },
      { id: "bm6", label: "Base Metal Thickness", value: "12 mm" },
      { id: "bm7", label: "Base Metal Product Form", value: "Plate" },
      { id: "bm8", label: "Base Metal Heat Treatment", value: "None" },
    ],
  },

  fillerMetals: {
    columns: [
      { id: "fm-label", header: "Parameter", accessorKey: "label", type: "label" },
      { id: "fm-value", header: "Specification", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "fm1", label: "Filler Metal F-No.", value: "4" },
      { id: "fm2", label: "Weld Metal Analysis A-No.", value: "1" },
      { id: "fm3", label: "Size of Filler Metal", value: "2.4 mm / 3.2 mm" },
    ],
  },

  positions: {
    columns: [
      { id: "pos-label", header: "Position Parameter", accessorKey: "label", type: "label" },
      { id: "pos-value", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "pos1", label: "Position(s)", value: "2G" },
      { id: "pos2", label: "Weld Progression", value: "Uphill" },
      { id: "pos3", label: "Others", value: "—" },
    ],
  },

  preheat: {
    columns: [
      { id: "ph-label", header: "Preheat Parameter", accessorKey: "label", type: "label" },
      { id: "ph-value", header: "Temperature/Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "ph1", label: "Preheat Temp", value: "80 °C" },
      { id: "ph2", label: "Interpass Temp", value: "150 °C" },
    ],
  },

  pwht: {
    columns: [
      { id: "pwht-label", header: "PWHT Parameter", accessorKey: "label", type: "label" },
      { id: "pwht-value", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "pwht1", label: "Soaking Temperature", value: "—" },
      { id: "pwht2", label: "Soaking Time", value: "—" },
    ],
  },

  gas: {
    columns: [
      { id: "gas-dash", header: "-", accessorKey: "dash", type: "input" },
      { id: "gas-process", header: "Process", accessorKey: "process", type: "input" },
      { id: "gas-gases", header: "Gas(es)", accessorKey: "gases", type: "input" },
      { id: "gas-mix", header: "Mix (%) Purity", accessorKey: "mix", type: "input" },
      { id: "gas-flow", header: "Flow Rate", accessorKey: "flow", type: "input" },
    ],
    data: [
      { id: "gas1", dash: "", process: "GTAW", gases: "Argon", mix: "99.9%", flow: "10 lpm" },
    ],
  },

  electrical: {
    columns: [
      { id: "ec-label", header: "Characteristic", accessorKey: "label", type: "label" },
      { id: "ec-value", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "ec1", label: "Current AC/DC", value: "DC" },
      { id: "ec2", label: "Polarity", value: "DCEP" },
      { id: "ec3", label: "Amperes", value: "95 A" },
      { id: "ec4", label: "Volts", value: "12 V" },
    ],
  },

  techniques: {
    columns: [
      { id: "tq-label", header: "Technique", accessorKey: "label", type: "label" },
      { id: "tq-value", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "tq1", label: "Travel Speed", value: "120 mm/min" },
      { id: "tq2", label: "String or Weave Bead", value: "Stringer" },
    ],
  },

  weldingParameters: {
    columns: [
      { id: "wp-label", header: "Parameter", accessorKey: "label", type: "label" },
      { id: "wp-value", header: "Value", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "wp1", label: "Arc Length", value: "Short" },
      { id: "wp2", label: "Electrode Diameter", value: "3.2 mm" },
    ],
  },

  tensileTest: {
    columns: [
      { id: "tt-item", header: "Item No.", accessorKey: "itemNo", type: "input" },
      { id: "tt-thk", header: "Thickness (mm)", accessorKey: "thickness", type: "numeric" },
      { id: "tt-uts", header: "UTS (MPa)", accessorKey: "utsMpa", type: "numeric" },
      { id: "tt-fail", header: "Type of Failure & Location", accessorKey: "failureType", type: "input" },
      { id: "tt-report", header: "Report No.", accessorKey: "reportNo", type: "input" },
    ],
    data: [
      { id: "tt1", itemNo: "1", thickness: 12, utsMpa: 460, failureType: "Base metal", reportNo: "LAB-TEN-001" },
    ],
  },

  guidedBendTest: {
    columns: [
      { id: "gb-item", header: "Item No.", accessorKey: "itemNo", type: "input" },
      { id: "gb-type", header: "Type of Bend", accessorKey: "typeOfBend", type: "input" },
      { id: "gb-result", header: "Result", accessorKey: "result", type: "input" },
      { id: "gb-report", header: "Report No.", accessorKey: "reportNo", type: "input" },
    ],
    data: [
      { id: "gb1", itemNo: "1", typeOfBend: "Face bend", result: "Accept", reportNo: "LAB-GB-001" },
    ],
  },

  toughnessTest: {
    columns: [
      { id: "tk-item", header: "Item No.", accessorKey: "itemNo", type: "input" },
      { id: "tk-temp", header: "Test Temp.", accessorKey: "testTemp", type: "input" },
      { id: "tk-impact1", header: "Impact Value 1 (J)", accessorKey: "impact1", type: "numeric" },
      { id: "tk-avg", header: "Average (J)", accessorKey: "average", type: "numeric" },
      { id: "tk-report", header: "Report No.", accessorKey: "reportNo", type: "input" },
    ],
    data: [
      { id: "tk1", itemNo: "1", testTemp: "-20°C", impact1: 48, average: 52, reportNo: "LAB-CH-001" },
    ],
  },

  filletWeldTest: {
    columns: [
      { id: "fwt-item", header: "Item No.", accessorKey: "itemNo", type: "input" },
      { id: "fwt-result", header: "Result - Satisfactory (Yes/No)", accessorKey: "result", type: "input" },
      { id: "fwt-report", header: "Report No.", accessorKey: "reportNo", type: "input" },
    ],
    data: [
      { id: "fwt1", itemNo: "1", result: "Yes", reportNo: "LAB-FIL-001" },
    ],
  },

  otherTests: {
    columns: [
      { id: "ot-item", header: "Item No.", accessorKey: "itemNo", type: "input" },
      { id: "ot-type", header: "Type of Test", accessorKey: "typeOfTest", type: "input" },
      { id: "ot-results", header: "Results", accessorKey: "results", type: "input" },
      { id: "ot-report", header: "Report No.", accessorKey: "reportNo", type: "input" },
    ],
    data: [
      { id: "ot1", itemNo: "1", typeOfTest: "DP Test", results: "Accept", reportNo: "LAB-DP-001" },
    ],
  },

  welderTestingInfo: {
    columns: [
      { id: "wti-label", header: "Parameter", accessorKey: "label", type: "label" },
      { id: "wti-value", header: "Details", accessorKey: "value", type: "input" },
    ],
    data: [
      { id: "wti1", label: "Welder Name", value: "John Doe" },
      { id: "wti2", label: "Welder ID", value: "WD-1001" },
      { id: "wti3", label: "Mechanical Testing Conducted by", value: "Aladdin" },
      { id: "wti4", label: "Lab Test No.", value: "LAB-TEST-001" },
    ],
  },

  certification: {
    data: [{ id: "cert-ref", reference: "ASME SEC IX" }],
  },

  signatures: {
    columns: [
      { id: "sig-ins", header: "Witnessing / Welding Inspector", accessorKey: "inspector", type: "input" },
      { id: "sig-sup", header: "Welding Supervisor", accessorKey: "supervisor", type: "input" },
      { id: "sig-lab", header: "Lab Testing Supervisor", accessorKey: "lab", type: "input" },
    ],
    data: [
      { id: "sig1", inspector: "WI-12", supervisor: "WS-27", lab: "LS-07" },
    ],
  },
} as PqrDataToView

interface PqrSection {
  columns: DynamicColumn[];
  data: DynamicRow[];
}

interface PqrDataToView {
  headerInfo: PqrSection;
  baseMetals: PqrSection;
  fillerMetals: PqrSection;
  positions: PqrSection;
  preheat: PqrSection;
  pwht: PqrSection;
  gas: PqrSection;
  electrical: PqrSection;
  techniques: PqrSection;
  weldingParameters: PqrSection;
  tensileTest: PqrSection;
  guidedBendTest: PqrSection;
  toughnessTest: PqrSection;
  filletWeldTest: PqrSection;
  otherTests: PqrSection;
  welderTestingInfo: PqrSection;
  certification: { data: { id: string; reference: string }[] };
  signatures: PqrSection;
}

export default function PQRReportPreview({ showButton = true, isPublic = false }) {
  const params = useParams();
  const pqrId = (params as any)?.id as string | undefined;
  const router = useRouter();

  const [pqrDataToView, setPqrDataToView] = useState<PqrDataToView | null>(null);
  const [loadingView, setLoadingView] = useState(true);
  const [errorView, setErrorView] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const frontendBase =
    (process.env.NEXT_PUBLIC_FRONTEND_URL as string | undefined) ||
    (process.env.FRONTEND_URL as string | undefined) ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const publicPreviewBase = `${frontendBase}${ROUTES.PUBLIC?.PQR_PREVIEW(pqrId ?? "")}`;

  console.log("publicPreviewBase", publicPreviewBase);

  // ref to the entire printable area
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pqrId) {
      setErrorView("No PQR ID provided for viewing.");
      setLoadingView(false);
      return;
    }
    const fetchPqrDataForView = async () => {
      setLoadingView(true);
      setErrorView(null);
      try {
        const data = DUMMY_PQR_DATA
        if (data) {
          setPqrDataToView(data);
        } else {
          setErrorView("PQR record not found.");
          toast.error("PQR record not found.");
        }
      } catch (err) {
        setErrorView("Failed to load PQR data for viewing.");
        toast.error("Failed to load PQR data.");
      } finally {
        setLoadingView(false);
      }
    };
    fetchPqrDataForView();
    // Generate QR for public view URL
    (async () => {
      try {
        const url = `${publicPreviewBase}/${pqrId}`;
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 120 });
        setQrSrc(dataUrl);
      } catch (_e) {
        setQrSrc(null);
      }
    })();
  }, [pqrId]);

  // Notify parent (if embedded in an iframe) when content is fully ready
  useEffect(() => {
    if (!loadingView && pqrDataToView) {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'PQR_PREVIEW_READY', id: pqrId }, '*');
        }
      } catch {}
    }
  }, [loadingView, pqrDataToView, pqrId]);

  // === PDF generation ===
  const handleGeneratePdf = async () => {
    if (!pqrId) return;

    try {
      const success = await generatePdf(publicPreviewBase, pqrId);
      if (success) {
        toast.info('Preparing your document...');
      } else {
        toast.error('Failed to prepare the document. Please try again.');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to prepare the document. Please try again.');
    }
  };

  if (loadingView) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="mb-4 h-10 w-2/5" />
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (errorView) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading PQR</AlertTitle>
          <AlertDescription>{errorView}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!pqrDataToView) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>No data available for this PQR record.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const isAsme = true; // preview layout only depends on provided section data in this project

  return (
    <div className="container mx-auto rounded-2xl p-2 sm:p-4 md:p-8 print:bg-white print:p-0">
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
              {qrSrc ? (
                <NextJSImage src={qrSrc} alt="PQR Public Link" className="h-24 w-24" width={80} height={80} />
              ) : null}
            </div>
          </div>
        )}
        {showButton && (
          <div className="space-x-2">
                            <Button onClick={handleGeneratePdf} variant="outline">
              Export PDF
            </Button>
            <Button onClick={() => router.back()}>Back to List</Button>
          </div>
        )}
      </header>

      <div ref={contentRef} className="pqr-view-content space-y-4">
        <HeaderInfoView headerInfoData={(pqrDataToView as any).headerInfo} />
        <BaseMetalsView baseMetalsData={(pqrDataToView as any).baseMetals} isAsme={isAsme} />
        <FillerMetalsView fillerMetalsData={(pqrDataToView as any).fillerMetals} isAsme={isAsme} />
        <PositionsPreheatView positionsData={(pqrDataToView as any).positions} preheatData={(pqrDataToView as any).preheat} isAsme={isAsme} />
        <PWHTGasView pwhtData={(pqrDataToView as any).pwht} gasData={(pqrDataToView as any).gas} isAsme={isAsme} />
        <ElectricalTechniquesView electricalData={(pqrDataToView as any).electrical} techniquesData={(pqrDataToView as any).techniques} isAsme={isAsme} />
        <WeldingParametersView weldingParamsData={(pqrDataToView as any).weldingParameters} />
        <TensileTestView tensileTestData={(pqrDataToView as any).tensileTest} isAsme={isAsme} />
        <GuidedBendTestView guidedBendTestData={(pqrDataToView as any).guidedBendTest} isAsme={isAsme} />
        <ToughnessTestView toughnessTestData={(pqrDataToView as any).toughnessTest} isAsme={isAsme} />
        <FilletWeldTestView filletWeldTestData={(pqrDataToView as any).filletWeldTest} isAsme={isAsme} />
        <OtherTestsView otherTestsData={(pqrDataToView as any).otherTests} />
        <WelderTestingInfoView welderTestingInfoData={(pqrDataToView as any).welderTestingInfo} />
        <CertificationView certificationData={(pqrDataToView as any).certification} />
        <SignatureView signatureData={(pqrDataToView as any).signatures} />
      </div>
    </div>
  );
}
