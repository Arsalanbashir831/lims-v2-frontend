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
    image?: { src: string; caption?: string };
}

interface TestReportData {
    certificate: CertificateInfo;
    sections: TestMethodSection[];
    comments?: string[];
    testedBy?: string;
    reviewedBy?: string;
}

const DUMMY: TestReportData = {
    certificate: {
        clientName: "ZEECO MIDDLE EAST LTD",
        poNo: "ST4A-MS-PO-020-4600066339",
        customerName: "ZEECO MIDDLE EAST LTD",
        projectName: "Mechanical & OES Testing",
        nameOfLaboratory:
            "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM",
        address:
            "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia",
        dateOfSampling: "09/08/2025",
        dateOfTesting: "17/08/2025",
        issueDate: "17/08/2025",
        gripcoRefNo: "MTL-2025-0092",
        revisionNo: "00",
        mtcNo: "00003650320/2",
        heatNo: "131521",
    },
    sections: [
        {
            title: "ASTM A751-CHEMICAL ANALYSIS-OES - SPECIMEN ID (982)",
            specimenId: "982",
            metaLeft: {
                "Test Equipment": "Optical Emission Spectrometer",
                "Test Method": "ASTM A751-Chemical Analysis-OES",
                "Sample Prep Method": "Cutting & Milling",
                "Sample Description": "RED ECENTRIC, A234, WPB- 4'' * 3''. SCH-40, BW",
            },
            metaRight: {
                "Material Grade": "ASTM A106, Gr.B",
                "Heat No.": "131521",
                Temperature: "30 °C",
                Humidity: "40 %RH",
            },
            table: {
                columns: [
                    "C (%)",
                    "Mn (%)",
                    "P (%)",
                    "S (%)",
                    "Si (%)",
                    "Cr (%)",
                    "Mo (%)",
                    "Al (%)",
                    "Cu (%)",
                    "Nb (%)",
                    "Ti (%)",
                    "V (%)",
                    "Ta (%)",
                ],
                rows: [{ "C (%)": 0, "Mn (%)": 0 }],
            },
        },
        {
            title: "ASTM E 10-BRINELL HARDNESS TEST - SPECIMEN ID (983)",
            specimenId: "983",
            metaLeft: {
                "Test Equipment": "Brinell Hardness Tester",
                "Test Method": "ASTM E 10-Brineell Hardness Test",
                "Sample Prep Method": "Cutting & Milling",
                "Sample Description": "RED ECENTRIC, A234, WPB- 4'' * 3''. SCH-40, BW",
            },
            metaRight: {
                "Material Grade": "ASTM A106, Gr.B",
                "Heat No.": "131521",
                Temperature: "30 °C",
                Humidity: "40 %RH",
            },
            table: {
                columns: [
                    "Sample ID",
                    "Point 1",
                    "Point 2",
                    "POINT 3",
                    "Average",
                    "Unit",
                    "Test Method",
                    "images",
                    "notes",
                    "Remarks",
                ],
                rows: [
                    {
                        "Sample ID": "983",
                        "Point 1": 115.6,
                        "Point 2": 118.9,
                        "POINT 3": 121.1,
                        Average: 118.5,
                        Unit: "HBW",
                        "Test Method": "ASTM E10",
                    },
                ],
            },
            image: { src: "https://images.unsplash.com/photo-1570615541379-e6b7ab6d4eb9?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", caption: "Specimen 983 – macro image" },
        },
    ],
    comments: [
        "ASTM E 10-BRINELL HARDNESS TEST - Specimen (983): Result is acceptable as per ASTM A 106 Gr.B & AMIMS-L-1035",
    ],
    testedBy: "Jawad Al-Hajri",
    reviewedBy: "Ahmed Al-Khalil",
};

export default function TestReportPreview({ showButton = true, isPublic = true }) {
    const params = useParams();
    const id = (params as any)?.id as string | undefined;
    const [data, setData] = useState<TestReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [qr, setQr] = useState<string | null>(null);

    const baseUrl =
        (process.env.NEXT_PUBLIC_FRONTEND_URL as string | undefined) ||
        (process.env.FRONTEND_URL as string | undefined) ||
        (typeof window !== "undefined" ? window.location.origin : "");
    const publicUrl = `${baseUrl}${ROUTES.PUBLIC.TEST_REPORT_PREVIEW(id ?? "")}`;

    useEffect(() => {
        setLoading(true);
        // TODO: Replace with real store fetch
        setTimeout(() => {
            setData(DUMMY);
            setLoading(false);
        }, 200);
    }, [id]);

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
                    window.parent.postMessage({ type: "TEST_REPORT_PREVIEW_READY", id }, "*");
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
                    if (dataMsg && dataMsg.type === "TEST_REPORT_PREVIEW_READY" && dataMsg.id === id) {
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

    if (!data) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p>No test report found.</p>
                <BackButton variant="default" label="Back to List" href={ROUTES.APP.TEST_REPORTS.ROOT} />
            </div>
        );
    }

    return (
        <div className="container mx-auto rounded-2xl p-2 sm:p-4 md:p-8 print:bg-white print:text-black print:border-0">
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
                    {data.certificate.projectName && (
                        <div><span className="font-medium">Project Name:</span> {data.certificate.projectName}</div>
                    )}
                    {data.certificate.nameOfLaboratory && (
                        <div><span className="font-medium">Name of Laboratory:</span> {data.certificate.nameOfLaboratory}</div>
                    )}
                    {data.certificate.address && (
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
                                            <TableHead key={c} className="border px-2 py-1 text-left font-medium print:border-gray-300">{c}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.table.rows.map((row, i) => (
                                        <TableRow key={i}>
                                            {section.table.columns.map((c) => (
                                                <TableCell key={c} className="border px-2 py-1 print:border-gray-300">{String(row[c] ?? "")}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        
                    </section>
                ))}
            </div>

            {/* Images Section */}
            {data.sections.some(s => s.image?.src) && (
                <section className="mt-10 print:mt-6">
                    <div className="space-y-6 print:space-y-4">
                        {data.sections
                            .filter(s => s.image?.src)
                            .map((section, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    {section.image?.caption && (
                                        <span className="mb-2 text-xl font-semibold self-start print:text-lg">{section.image.caption}</span>
                                    )}
                                    <Image
                                        src={section.image!.src}
                                        alt={section.image!.caption || "section image"}
                                        width={500}
                                        height={300}
                                        className="bg-white print:border print:border-gray-300"
                                    />
                                </div>
                            ))}
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


