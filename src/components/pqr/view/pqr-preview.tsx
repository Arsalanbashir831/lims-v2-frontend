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
import { DynamicColumn, DynamicRow } from "../form/dynamic-table";
import { generatePdf } from "@/lib/pdf-utils";
import { BackButton } from "@/components/ui/back-button";
import { usePQR } from "@/hooks/use-pqr";
import { PQR } from "@/services/pqr.service";

interface PqrSection {
  columns: DynamicColumn[];
  data: DynamicRow[];
}

interface JointsSection extends PqrSection {
  designPhotoUrl?: string;
}

interface PqrDataToView {
  headerInfo: PqrSection;
  joints: JointsSection;
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

// Function to transform backend PQR data to view format
function transformPQRDataToView(pqr: PQR): PqrDataToView {
  // Get the backend base URL for media files
  const getMediaUrl = (relativePath?: string): string | undefined => {
    if (!relativePath) return undefined;
    if (relativePath.startsWith("http") || relativePath.startsWith("blob:"))
      return relativePath;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const cleanPath = relativePath.replace(/\\/g, "/");
    const separator = cleanPath.startsWith("/") ? "" : "/";
    return `${backendUrl}${separator}${cleanPath}`;
  };

  // Helper function to convert object to table format
  const objectToTableFormat = (
    obj: any,
    labelKey = "label",
    valueKey = "value"
  ): { columns: DynamicColumn[]; data: DynamicRow[] } => {
    // Guard
    if (!obj || typeof obj !== "object") {
      return { columns: [], data: [] };
    }
  
    // If rows exist
    if (Array.isArray((obj as any).rows) && (obj as any).rows.length > 0) {
      const rows = (obj as any).rows;
  
      // Explicit columns
      if (Array.isArray((obj as any).columns) && (obj as any).columns.length > 0) {
        const columns: DynamicColumn[] = (obj as any).columns.map((col: any, i: number) => ({
          id: `col-${col.key}-${i}`,
          header: col.header,
          accessorKey: col.key,
          type: col.key === "label" || col.key === "description" ? "label" : "input",
        }));
        const data: DynamicRow[] = rows.map((r: any, i: number) => ({ id: `row-${i}`, ...r }));
        return { columns, data };
      }
  
      // Infer columns from rows
      const keySet = new Set<string>();
      rows.forEach((r: any) => {
        if (r && typeof r === "object" && !Array.isArray(r)) Object.keys(r).forEach((k) => keySet.add(k));
      });
      keySet.delete("id");
      const keys = Array.from(keySet);
      const hasLabel = keys.includes("label") || keys.includes("description");
      const hasValue = keys.includes("value");
      const simpleLV = hasLabel && hasValue && keys.length === 2;
  
      if (!simpleLV && keys.length > 0) {
        const columns: DynamicColumn[] = keys.map((k, i) => ({
          id: `col-${k}-${i}`,
          header: k.charAt(0).toUpperCase() + k.slice(1),
          accessorKey: k,
          type: k === "label" || k === "description" ? "label" : "input",
        }));
        const data: DynamicRow[] = rows.map((r: any, i: number) => ({ id: `row-${i}`, ...r }));
        return { columns, data };
      }
  
      // Simple label/value
      const columns: DynamicColumn[] = [
        { id: `${labelKey}-col`, header: "Parameter", accessorKey: labelKey, type: "label" },
        { id: `${valueKey}-col`, header: "Details", accessorKey: valueKey, type: "input" },
      ];
      const data: DynamicRow[] = rows
        .map((r: any, i: number) => {
          if (Array.isArray(r) && r.length >= 2)
            return { id: `row-${i}`, [labelKey]: String(r[0] ?? ""), [valueKey]: r[1] ?? "" } as DynamicRow;
          if (r && typeof r === "object")
            return {
              id: `row-${i}`,
              [labelKey]: String(r.label ?? r[labelKey] ?? ""),
              [valueKey]: r.value ?? r[valueKey] ?? "",
            } as DynamicRow;
          return { id: `row-${i}`, [labelKey]: "", [valueKey]: "" } as DynamicRow;
        })
        .filter((r: any) => String((r as any)[labelKey] ?? "").trim() !== "");
      return { columns, data };
    }
  
    // No rows → key/value object
    const entries = Object.entries(obj).filter(([k, v]) => k !== "columns" && v !== undefined && v !== null);
    if (entries.length === 0) {
      return { columns: [], data: [] };
    }
    const columns: DynamicColumn[] = [
      { id: `${labelKey}-col`, header: "Parameter", accessorKey: labelKey, type: "label" },
      { id: `${valueKey}-col`, header: "Details", accessorKey: valueKey, type: "input" },
    ];
    const data: DynamicRow[] = entries.map(([k, v], i) => ({
      id: `row-${i}`,
      [labelKey]: String(k),
      [valueKey]: v as any,
    })) as DynamicRow[];
  
    return { columns, data };
  };
  
  return {
    headerInfo: pqr.basic_info
      ? objectToTableFormat(pqr.basic_info, "description", "value")
      : { columns: [], data: [] },
    joints: {
      columns: pqr.joints
        ? objectToTableFormat(pqr.joints, "label", "value").columns
        : [],
      data: pqr.joints
        ? objectToTableFormat(pqr.joints, "label", "value").data
        : [],
      designPhotoUrl: getMediaUrl(pqr.joint_design_sketch?.[0]),
    },
    baseMetals: pqr.base_metals
      ? objectToTableFormat(pqr.base_metals)
      : { columns: [], data: [] },
    fillerMetals: pqr.filler_metals
      ? objectToTableFormat(pqr.filler_metals)
      : { columns: [], data: [] },
    positions: pqr.positions
      ? objectToTableFormat(pqr.positions)
      : { columns: [], data: [] },
    preheat: pqr.preheat
      ? objectToTableFormat(pqr.preheat)
      : { columns: [], data: [] },
    pwht: pqr.post_weld_heat_treatment
      ? objectToTableFormat(pqr.post_weld_heat_treatment)
      : { columns: [], data: [] },
    gas: pqr.gas ? objectToTableFormat(pqr.gas) : { columns: [], data: [] },
    electrical: pqr.electrical_characteristics
      ? objectToTableFormat(pqr.electrical_characteristics)
      : { columns: [], data: [] },
    techniques: pqr.techniques
      ? objectToTableFormat(pqr.techniques)
      : { columns: [], data: [] },
    weldingParameters: pqr.welding_parameters
      ? objectToTableFormat(pqr.welding_parameters)
      : { columns: [], data: [] },
    tensileTest: pqr.tensile_test
      ? objectToTableFormat(pqr.tensile_test)
      : { columns: [], data: [] },
    guidedBendTest: pqr.guided_bend_test
      ? objectToTableFormat(pqr.guided_bend_test)
      : { columns: [], data: [] },
    toughnessTest: pqr.toughness_test
      ? objectToTableFormat(pqr.toughness_test)
      : { columns: [], data: [] },
    filletWeldTest: pqr.fillet_weld_test
      ? objectToTableFormat(pqr.fillet_weld_test)
      : { columns: [], data: [] },
    otherTests: pqr.other_tests
      ? objectToTableFormat(pqr.other_tests)
      : { columns: [], data: [] },
    welderTestingInfo: {
      columns: [
        {
          id: "wti-label",
          header: "Parameter",
          accessorKey: "label",
          type: "label" as const,
        },
        {
          id: "wti-value",
          header: "Details",
          accessorKey: "value",
          type: "input" as const,
        },
      ],
      data: [
        {
          id: "wti1",
          label: "Welder Name",
          value: pqr.welder_card_info?.welder_info?.operator_name || "",
        },
        {
          id: "wti2",
          label: "Welder ID",
          value: pqr.welder_card_info?.welder_info?.operator_id || "",
        },
        {
          id: "wti3",
          label: "Mechanical Testing Conducted by",
          value: pqr.mechanical_testing_conducted_by || "",
        },
        { id: "wti4", label: "Lab Test No.", value: pqr.lab_test_no || "" },
      ],
    },
    certification: {
      data: [{ id: "cert-ref", reference: pqr.type || "" }],
    },
    signatures: pqr.signatures
      ? objectToTableFormat(pqr.signatures, "label", "value")
      : { columns: [], data: [] },
  };
}

export default function PQRReportPreview({
  showButton = true,
  isPublic = false,
}) {
  const params = useParams<{ id: string }>();
  const pqrId = params?.id;

  const [pqrDataToView, setPqrDataToView] = useState<PqrDataToView | null>(
    null
  );
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const [frontendBase, setFrontendBase] = useState("");

  // Fetch PQR data from backend using the hook
  const {
    data: pqrResponse,
    isLoading: loadingView,
    error: errorResponse,
  } = usePQR(pqrId ?? "");

  useEffect(() => {
    const url =
      (process.env.NEXT_PUBLIC_FRONTEND_URL as string | undefined) ||
      (process.env.FRONTEND_URL as string | undefined) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    setFrontendBase(url);
  }, []);

  const publicPreviewBase = `${frontendBase}${ROUTES.PUBLIC?.PQR_PREVIEW(
    pqrId ?? ""
  )}`;

  // ref to the entire printable area
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Transform backend data to view format
  useEffect(() => {
    if (pqrResponse?.data) {
      try {
        const transformedData = transformPQRDataToView(pqrResponse.data);
        setPqrDataToView(transformedData);
      } catch (err) {
        console.error("Error transforming PQR data:", err);
        toast.error("Failed to transform PQR data for viewing.");
      }
    }
  }, [pqrResponse]);

  // Generate QR code
  useEffect(() => {
    if (!pqrId) return;

    (async () => {
      try {
        const url = `${publicPreviewBase}/${pqrId}`;
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 120 });
        setQrSrc(dataUrl);
      } catch (_e) {
        setQrSrc(null);
      }
    })();
  }, [pqrId, publicPreviewBase]);

  // Notify parent (if embedded in an iframe) when content is fully ready
  useEffect(() => {
    if (!loadingView && pqrDataToView) {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "DOCUMENT_READY", id: pqrId }, "*");
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
        toast.info("Preparing your document...");
      } else {
        toast.error("Failed to prepare the document. Please try again.");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to prepare the document. Please try again.");
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

  if (errorResponse) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading PQR</AlertTitle>
          <AlertDescription>
            {errorResponse?.message || "Failed to load PQR data"}
          </AlertDescription>
        </Alert>
        <BackButton
          variant="default"
          label="Go Back"
          href={ROUTES.APP.WELDERS.PQR.ROOT}
        />
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
        <BackButton
          variant="default"
          label="Go Back"
          href={ROUTES.APP.WELDERS.PQR.ROOT}
        />
      </div>
    );
  }

  if (!pqrDataToView) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>No data available for this PQR record.</p>
        <BackButton
          variant="default"
          label="Go Back"
          href={ROUTES.APP.WELDERS.PQR.ROOT}
        />
      </div>
    );
  }

  const isAsme = true; // preview layout only depends on provided section data in this project

  return (
    <div className="max-w-7xl mx-auto rounded-2xl p-2 sm:p-4 md:p-8 print:bg-white print:p-0">
      <header className="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <NextJSImage
            src="/gripco-logo.webp"
            alt="Logo"
            width={300}
            height={60}
            className="h-24 w-64 bg-background"
          />
        </div>
        {isPublic && (
          <div className="flex items-center gap-2">
            <div>
              <NextJSImage
                src="/ias-logo-vertical.webp"
                alt="Logo"
                width={80}
                height={60}
                className="h-24 w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              {qrSrc ? (
                <NextJSImage
                  src={qrSrc}
                  alt="PQR Public Link"
                  className="h-24 w-24"
                  width={80}
                  height={80}
                />
              ) : null}
            </div>
          </div>
        )}
        {showButton && (
          <div className="space-x-2 flex items-center print:hidden">
            <Button onClick={handleGeneratePdf} variant="outline">
              Export PDF
            </Button>
            <BackButton
              variant="default"
              label="Back to List"
              href={ROUTES.APP.WELDERS.PQR.ROOT}
            />
          </div>
        )}
      </header>

      <div ref={contentRef} className="pqr-view-content space-y-4">
        <HeaderInfoView headerInfoData={pqrDataToView.headerInfo} />
        <JointsView jointsData={pqrDataToView.joints} isAsme={isAsme} />
        <BaseMetalsView
          baseMetalsData={pqrDataToView.baseMetals}
          isAsme={isAsme}
        />
        <FillerMetalsView
          fillerMetalsData={pqrDataToView.fillerMetals}
          isAsme={isAsme}
        />
        <PositionsPreheatView
          positionsData={pqrDataToView.positions}
          preheatData={pqrDataToView.preheat}
          isAsme={isAsme}
        />
        <PWHTGasView
          pwhtData={pqrDataToView.pwht}
          gasData={pqrDataToView.gas}
          isAsme={isAsme}
        />
        <ElectricalTechniquesView
          electricalData={pqrDataToView.electrical}
          techniquesData={pqrDataToView.techniques}
          isAsme={isAsme}
        />
        <WeldingParametersView
          weldingParamsData={pqrDataToView.weldingParameters}
        />
        <TensileTestView
          tensileTestData={pqrDataToView.tensileTest}
          isAsme={isAsme}
        />
        <GuidedBendTestView
          guidedBendTestData={pqrDataToView.guidedBendTest}
          isAsme={isAsme}
        />
        <ToughnessTestView
          toughnessTestData={pqrDataToView.toughnessTest}
          isAsme={isAsme}
        />
        <FilletWeldTestView
          filletWeldTestData={pqrDataToView.filletWeldTest}
          isAsme={isAsme}
        />
        <OtherTestsView otherTestsData={pqrDataToView.otherTests} />
        <WelderTestingInfoView
          welderTestingInfoData={pqrDataToView.welderTestingInfo}
        />
        <CertificationView certificationData={pqrDataToView.certification} />
        <SignatureView signatureData={pqrDataToView.signatures} />
      </div>
    </div>
  );
}
