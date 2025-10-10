"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { BackButton } from "@/components/ui/back-button";
import { useTestReportDetail, useTestReportItems } from "@/hooks/use-test-reports";
import { toast } from "sonner";

// Helper function to get full image URL
function getFullImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.2:8000"
  return `${backendUrl}${imageUrl}`
}

interface CertificateInfo {
    clientName: string;
    poNo: string;
    customerName: string;
    atten?: string;
    projectName?: string;
    nameOfLaboratory?: string;
    address?: string;
    dateOfSampling?: string;
    dateOfTesting?: string;
    issueDate?: string;
    gripcoRefNo?: string;
    revisionNo?: string;
    mtcNo?: string;
    heatNo?: string;
}

interface TestMethodSection {
    title: string;
    specimenId: string;
    metaLeft?: Record<string, string>;
    metaRight?: Record<string, string>;
    table: { columns: string[]; rows: Array<Record<string, string | number>> };
    images?: Array<{ src: string; caption?: string }>;
}

interface TestReportData {
    certificate: CertificateInfo;
    sections: TestMethodSection[];
    comments?: string[];
    testedBy?: string;
    reviewedBy?: string;
}


export default function TestReportPreview({ showButton = true, isPublic = true }) {
    const params = useParams();
    const id = (params as any)?.id as string | undefined;
    const [data, setData] = useState<TestReportData | null>(null);
    const [qr, setQr] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState("")

    // Fetch certificate and certificate items data
    const { data: certificate, isLoading: certificateLoading, error: certificateError } = useTestReportDetail(id || "", !!id);
    const { data: certificateItems, isLoading: itemsLoading, error: itemsError } = useTestReportItems(id || "", !!id);

    const loading = certificateLoading || itemsLoading;
    
    useEffect(() => {
        const url = (process.env.NEXT_PUBLIC_FRONTEND_URL as string | undefined) ||
                   (process.env.FRONTEND_URL as string | undefined) ||
                   (typeof window !== "undefined" ? window.location.origin : "");
        setBaseUrl(url)
    }, [])
    
    const publicUrl = `${baseUrl}${ROUTES.PUBLIC.TEST_REPORT_PREVIEW(id ?? "")}`;

    // Transform API data to component format
    useEffect(() => {
        if (!certificate?.data || !certificateItems?.data) {
            setData(null);
            return;
        }

        try {
            const cert = certificate.data;
            const items = certificateItems.data;

            // Map certificate info using new flattened structure
            const certificateInfo: CertificateInfo = {
                clientName: cert.client_name || "N/A",
                poNo: cert.customer_po || "N/A",
                customerName: cert.customers_name_no || "N/A",
                atten: cert.atten || "N/A",
                projectName: cert.project_name || "N/A",
                nameOfLaboratory: "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM",
                address: "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia",
                dateOfSampling: cert.date_of_sampling || "N/A",
                dateOfTesting: cert.date_of_testing || "N/A",
                issueDate: cert.issue_date || "N/A",
                gripcoRefNo: cert.job_id || cert.certificate_id || "N/A",
                revisionNo: cert.revision_no || "N/A",
                mtcNo: "N/A",
                heatNo: "N/A"
            };

            // Map certificate items to sections
            const sections: TestMethodSection[] = items.map((item, index) => {
                // Parse test results JSON
                let testResults: { columns: string[]; data: any[][] } = { columns: [], data: [] };
                try {
                    if (item.specimen_sections?.[0]?.test_results) {
                        testResults = JSON.parse(item.specimen_sections[0].test_results);
                    }
                } catch (error) {
                    console.error("Failed to parse test results:", error);
                }

                // Get specimen info
                const specimenSection = item.specimen_sections?.[0];
                const specimenId = specimenSection?.specimen_id || "N/A";
                
                // Find specimen name from certificate request info
                let specimenName = specimenId;
                if (cert.request_info?.specimens) {
                    const specimen = cert.request_info.specimens.find(s => s.specimen_oid === specimenId);
                    if (specimen?.specimen_id) {
                        specimenName = specimen.specimen_id;
                    }
                }

                // Get test method name
                const testMethodName = cert.request_info?.sample_lots?.[0]?.test_method?.test_name || "N/A";

                return {
                    title: `${testMethodName} - SPECIMEN ID (${specimenName})`,
                    specimenId: specimenName,
                    metaLeft: {
                        "Test Equipment": item.equipment_name || "N/A",
                        "Test Method": testMethodName,
                        "Sample Prep Method": item.sample_preparation_method || "N/A",
                        "Sample Description": cert.request_info?.sample_lots?.[0]?.item_description || "N/A",
                    },
                    metaRight: {
                        "Material Grade": item.material_grade || "N/A",
                        "Heat No.": item.heat_no || "N/A",
                        "Temperature": item.temperature || "N/A",
                        "Humidity": item.humidity || "N/A",
                    },
                    table: {
                        columns: testResults.columns || [],
                        rows: testResults.data?.map(row => {
                            const rowObj: Record<string, string | number> = {};
                            testResults.columns.forEach((col, colIndex) => {
                                rowObj[col] = row[colIndex] || "";
                            });
                            return rowObj;
                        }) || []
                    },
                    // Map all images if available
                    images: specimenSection?.images_list?.map(img => ({
                        src: getFullImageUrl(img.image_url),
                        caption: img.caption || `Specimen ${specimenName} – image`
                    })) || []
                };
            });

            const transformedData: TestReportData = {
                certificate: certificateInfo,
                sections,
                comments: items.length > 0 ? [items[0].comments || "N/A"] : [],
                testedBy: cert.tested_by || "N/A",
                reviewedBy: cert.reviewed_by || "N/A",
            };

            setData(transformedData);
        } catch (error) {
            console.error("Failed to transform certificate data:", error);
            toast.error("Failed to load certificate data");
            setData(null);
        }
    }, [certificate, certificateItems]);

    // Handle API errors
    useEffect(() => {
        if (certificateError) {
            console.error("Certificate fetch error:", certificateError);
            toast.error("Failed to load certificate");
        }
        if (itemsError) {
            console.error("Certificate items fetch error:", itemsError);
            toast.error("Failed to load certificate items");
        }
    }, [certificateError, itemsError]);

    useEffect(() => {
        if (!isPublic) return;
        if (!id) return;
        QRCode.toDataURL(publicUrl, { margin: 1, width: 120 })
            .then(setQr)
            .catch(() => setQr(null));
    }, [publicUrl, id, isPublic]);

    // Notify parent (if embedded in an iframe) when content is fully ready
    useEffect(() => {
        if (!loading && data) {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: "DOCUMENT_READY", id }, "*");
                }
            } catch {}
        }
    }, [loading, data, id]);

    // Hidden-iframe print/export, similar to PQR flow
    const exportPdf = async () => {
        if (!id) return;
        try {
            const url = new URL(publicUrl);
            url.searchParams.set("print", "1");
            const printUrl = url.toString();

            const iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.left = "-9999px";
            iframe.style.top = "-9999px";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            iframe.setAttribute("aria-hidden", "true");

            let printed = false;
            const cleanup = () => {
                try {
                    window.removeEventListener("message", onMessage as any);
                } catch {}
                try {
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                } catch {}
            };

            const tryPrint = () => {
                if (printed) return;
                printed = true;
                try {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                } catch {}
                setTimeout(cleanup, 500);
            };

            const onMessage = (event: MessageEvent) => {
                try {
                    const dataMsg = event.data as any;
                    if (dataMsg && dataMsg.type === "DOCUMENT_READY" && dataMsg.id === id) {
                        tryPrint();
                    }
                } catch {}
            };

            window.addEventListener("message", onMessage as any);

            const fallbackTimer = setTimeout(() => {
                tryPrint();
            }, 5000);

            iframe.onload = () => {
                clearTimeout(fallbackTimer);
            };

            iframe.src = printUrl;
            document.body.appendChild(iframe);
        } catch (e) {
            // no-op
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto space-y-6 p-6">
                <Skeleton className="mb-4 h-10 w-2/5" />
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-40" />
                ))}
            </div>
        );
    }

    if (!loading && (!data || (certificateError || itemsError))) {
        return (
            <div className="container mx-auto p-6 text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                    {certificateError || itemsError ? "Failed to load test report data." : "No test report found."}
                </p>
                {showButton && (
                    <BackButton variant="default" label="Back to List" href={ROUTES.APP.TEST_REPORTS.ROOT} />
                )}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto rounded p-2 sm:p-4 md:p-8 print:bg-white print:text-black print:border-0">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between sm:mb-8 print:mb-4">
                <div>
                    <Image src="/gripco-logo.webp" alt="Logo" width={260} height={50} />
                </div>
                {isPublic && (
                    <div className="flex items-center gap-3">
                        <Image src="/ias-logo-vertical.webp" alt="IAS" width={80} height={60} className="h-24 w-20" />
                        {qr && <Image src={qr} alt="Public Link" width={96} height={96} className="h-24 w-24" />}
                    </div>
                )}
                {showButton && (
                    <div className="space-x-2 flex items-center print:hidden">
                        <Button variant="outline" onClick={exportPdf}>
                            Export PDF
                        </Button>
                        <BackButton variant="default" label="Back to List" href={ROUTES.APP.TEST_REPORTS.ROOT} />
                    </div>
                )}
            </header>

            {/* Certificate Info */}
            <section className="mb-6 grid grid-cols-12 gap-4 text-sm print:mb-4">
                <div className="col-span-8 space-y-1">
                    <div className="font-semibold text-2xl mb-4 col-span-full print:text-xl print:mb-2">TEST CERTIFICATE</div>
                    <div><span className="font-medium">Client Name:</span> {data.certificate.clientName}</div>
                    <div><span className="font-medium">PO #:</span> {data.certificate.poNo}</div>
                    <div><span className="font-medium">Customer Name:</span> {data.certificate.customerName}</div>
                    {data.certificate.projectName && data.certificate.projectName !== "N/A" && (
                        <div><span className="font-medium">Project Name:</span> {data.certificate.projectName}</div>
                    )}
                    {data.certificate.nameOfLaboratory && data.certificate.nameOfLaboratory !== "N/A" && (
                        <div><span className="font-medium">Name of Laboratory:</span> {data.certificate.nameOfLaboratory}</div>
                    )}
                    {data.certificate.address && data.certificate.address !== "N/A" && (
                        <div><span className="font-medium">Address:</span> {data.certificate.address}</div>
                    )}
                </div>
                <div className="col-span-4 space-y-1">
                    <div><span className="font-medium">Date of Sampling:</span> {data.certificate.dateOfSampling}</div>
                    <div><span className="font-medium">Date of Testing:</span> {data.certificate.dateOfTesting}</div>
                    <div><span className="font-medium">Issue Date:</span> {data.certificate.issueDate}</div>
                    <div><span className="font-medium">Gripco Ref No:</span> {data.certificate.gripcoRefNo}</div>
                    <div><span className="font-medium">Revision #:</span> {data.certificate.revisionNo}</div>
                </div>
            </section>

            {/* Sections per Test Method */}
            <div className="space-y-8 print:space-y-4">
                {data.sections.map((section, idx) => (
                    <section key={idx}>
                        <div className="mb-2 grid grid-cols-12 gap-x-2 text-sm">
                            <div className="font-semibold col-span-full mb-2 text-xl print:text-lg">{section.title}</div>
                            <div className="col-span-8">
                                {section.metaLeft && (
                                    <div>
                                        {Object.entries(section.metaLeft).map(([k, v]) => (
                                            <div key={k} ><span className="font-semibold">{k}:</span> <span>{v}</span></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-4 text-sm">
                                {section.metaRight && (
                                    <div>
                                        {Object.entries(section.metaRight).map(([k, v]) => (
                                            <div key={k}><span className="font-semibold">{k}:</span> <span>{v}</span></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                            <Table className="text-xs print:text-[10px]">
                                <TableHeader>
                                    <TableRow className="bg-muted print:bg-gray-100">
                                        {section.table.columns.map((c) => (
                                            <TableHead key={c} className="border px-2 py-1 text-left font-medium print:border-gray-300 print:text-black">{c}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.table.rows.map((row, i) => (
                                        <TableRow key={i}>
                                            {section.table.columns.map((c) => (
                                                <TableCell key={c} className="border px-2 py-1 print:border-gray-300 print:text-black">{String(row[c] ?? "")}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        
                    </section>
                ))}
            </div>

            {/* Images Section */}
            {data.sections.some(s => s.images && s.images.length > 0) && (
                <section className="mt-10 print:mt-6">
                    <div className="space-y-6 print:space-y-4">
                        {data.sections
                            .filter(s => s.images && s.images.length > 0)
                            .map((section, sectionIdx) => 
                                section.images!.map((image, imageIdx) => (
                                    <div key={`${sectionIdx}-${imageIdx}`} className="flex flex-col items-center">
                                        {image.caption && (
                                            <span className="mb-2 text-xl font-semibold self-start print:text-lg">
                                                {image.caption}
                                            </span>
                                        )}
                                        <Image
                                            src={image.src}
                                            alt={image.caption || `${section.specimenId} image ${imageIdx + 1}`}
                                            width={500}
                                            height={300}
                                            className="bg-white print:border print:border-gray-300"
                                        />
                                    </div>
                                ))
                            )}
                    </div>
                </section>
            )}

            {/* Comments */}
            {data.comments && data.comments.length > 0 && (
                <section className="mt-10 print:mt-6">
                    <div className="mb-2 text-xl font-semibold print:text-lg">Certificate Comments:</div>
                    <pre className="whitespace-pre-wrap text-xs leading-6 text-center print:text-[10px]">{data.comments.join("\n")}</pre>
                </section>
            )}

            {/* Tested By */}
            <section className="mt-32 grid grid-cols-2 text-sm print:mt-16">
                <div className="font-semibold">Tested By: <span className="font-normal">{data.testedBy ?? ""}</span></div>
                <div className="text-right font-semibold">Reviewed By: <span className="font-normal">{data.reviewedBy ?? ""}</span></div>
            </section>

            {/* Footer */}
            <footer className="mt-8 border-t pt-3 text-[11px] leading-5 text-muted-foreground print:mt-6 print:border-gray-300 print:text-gray-700">
                <div>Commercial Registration No: 2015253768</div>
                <div>
                    All Works and services carried out by GRIPCO Material Testing Saudia are subjected to and conducted with the standard terms and conditions of GRIPCO Material Testing, which are available on the GRIPCO Site or upon request.
                </div>
                <div>
                    These results relate only to the item(s) tested/sampling conducted by the organization indicated. No deviations were observed during the testing process.
                </div>
            </footer>
        </div>
    );
}


