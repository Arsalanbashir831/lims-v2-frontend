"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TrackingRow } from "@/services/tracking.service"
import { useSampleLotsByJob } from "@/hooks/use-sample-lots"
import { useSamplePreparationsByJob } from "@/hooks/use-sample-preparations"
import { useCertificatesByJob } from "@/hooks/use-certificates"

// Types for API responses
interface TestMethod {
  id: string;
  test_name: string;
}

interface Specimen {
  specimen_id: string;
  specimen_oid: string;
}

interface SampleLot {
  id: string;
  item_no: string;
  description: string;
  sample_type: string;
  material_type: string;
  heat_no: string;
  mtc_no: string;
  test_methods: TestMethod[];
}

interface SamplePreparation {
  id: string;
  request_no: string;
  created_at: string;
  sample_lots: Array<{
    sample_lot_info?: {
      item_no: string;
    };
    item_description: string;
    test_method?: {
      test_name: string;
    };
    planned_test_date?: string;
    specimens_count: number;
    specimens: Specimen[];
  }>;
}

interface Certificate {
  id: string;
  certificate_id: string;
  issue_date: string;
  request_info?: {
    request_no: string;
    sample_lots_count: number;
    total_specimens: number;
    specimens: Specimen[];
  };
}
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  row?: TrackingRow | null
}

export function TrackingDrawer({ open, onOpenChange, row }: Props) {
  // Fetch sample lots data for the selected job
  const { data: sampleLotsData, isLoading: isLoadingSampleLots, error: sampleLotsError } = useSampleLotsByJob(row?.id || "")
  
  // Fetch sample preparations data for the selected job
  const { data: samplePreparationsData, isLoading: isLoadingSamplePreparations, error: samplePreparationsError } = useSamplePreparationsByJob(row?.id || "")
  
  // Fetch certificates data for the selected job
  const { data: certificatesData, isLoading: isLoadingCertificates, error: certificatesError } = useCertificatesByJob(row?.id || "")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:max-w-[70vw] lg:max-w-[60vw] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between w-full">
            <span>{row?.sampleId} — {row?.projectName}</span>
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="m-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preparation">Preparation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            {/* <TabsTrigger value="discards">Discards</TabsTrigger> */}
          </TabsList>
          <TabsContent value="overview" className="p-4 pt-0 space-y-4">
            <section className="rounded-lg border">
              <header className="px-4 py-3 border-b flex items-center justify-between">
                <div className="text-sm font-medium">Summary</div>
              </header>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Field label="Client" value={row?.clientName} />
                <Field label="Project" value={row?.projectName} />
                <Field label="Items" value={String(sampleLotsData?.total ?? row?.itemsCount ?? 0)} />
                <Field label="End User" value={(sampleLotsData?.job_info as Record<string, unknown>)?.end_user as string ?? row?.endUser} />
                <Field label="Received By" value={(sampleLotsData?.job_info as Record<string, unknown>)?.received_by as string ?? row?.receivedBy} />
                <Field label="Received Date" value={(sampleLotsData?.job_info as Record<string, unknown>)?.receive_date ? new Date((sampleLotsData?.job_info as Record<string, unknown>).receive_date as string).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : row?.receivedDate} />
                <Field label="Remarks" value={(sampleLotsData?.job_info as Record<string, unknown>)?.remarks as string ?? row?.remarks} />
              </div>
            </section>

            <section className="rounded-lg border">
              <header className="px-4 py-3 border-b text-sm font-medium">Items</header>
              <div className="p-4">
                {isLoadingSampleLots ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading sample lots...
                  </div>
                ) : sampleLotsError ? (
                  <div className="text-center text-red-500 py-8">
                    Error loading sample lots: {sampleLotsError.message}
                  </div>
                ) : sampleLotsData?.data && sampleLotsData.data.length > 0 ? (
                  <div className="space-y-3">
                    {sampleLotsData.data.map((sampleLot) => (
                      <div key={sampleLot.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{sampleLot.item_no}</div>
                          <div className="text-sm text-muted-foreground">{sampleLot.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Type: {sampleLot.sample_type} | Material: {sampleLot.material_type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Heat #: {sampleLot.heat_no} | MTC #: {sampleLot.mtc_no}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {(sampleLot.test_method_oids || []).slice(0, 2).map((methodId: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {methodId.length > 12 ? methodId.substring(0, 12) + "..." : methodId}
                              </Badge>
                            ))}
                            {(sampleLot.test_method_oids || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(sampleLot.test_method_oids || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No sample lots available for this job
                  </div>
                )}
              </div>
            </section>
          </TabsContent>
          <TabsContent value="preparation" className="p-4 pt-0">
            <div className="rounded border">
              {isLoadingSamplePreparations ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading preparations...
                </div>
              ) : samplePreparationsError ? (
                <div className="p-8 text-center text-red-500">
                  Error loading preparations: {samplePreparationsError.message}
                </div>
              ) : samplePreparationsData?.data && samplePreparationsData.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request #</TableHead>
                      <TableHead>Sample Lots</TableHead>
                      <TableHead>Test Methods</TableHead>
                      <TableHead>Specimens</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samplePreparationsData.data.map((preparation) => (
                      <TableRow key={preparation.id}>
                        <TableCell className="font-medium">{preparation.request_no}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {preparation.sample_lots.map((lot: Record<string, unknown>, index: number) => (
                              <div key={index} className="text-sm">
                                <div className="font-medium">{(lot.sample_lot_info as { item_no?: string })?.item_no}</div>
                                <div className="text-xs text-muted-foreground">{lot.item_description as string}</div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {preparation.sample_lots.map((lot: Record<string, unknown>, index: number) => (
                              <div key={index} className="text-sm">
                                <div className="font-medium">{(lot.test_method as { test_name?: string })?.test_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {lot.planned_test_date ? new Date(lot.planned_test_date as string).toLocaleDateString() : 'No date'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {preparation.sample_lots.map((lot: Record<string, unknown>, index: number) => (
                              <div key={index} className="text-sm">
                                <div className="font-medium">{String(lot.specimens_count || 0)} specimens</div>
                                <div className="text-xs text-muted-foreground">
                                  {Array.isArray(lot.specimens) ? (
                                    <>
                                      {lot.specimens.slice(0, 2).map((spec: Specimen) => spec.specimen_id).join(', ')}
                                      {lot.specimens.length > 2 && ` +${lot.specimens.length - 2} more`}
                                    </>
                                  ) : (
                                    'No specimens'
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(preparation.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Link href={ROUTES.APP.SAMPLE_PREPARATION.EDIT(preparation.id)}>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No preparation data available for this job
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reports" className="p-4 pt-0">
            <div className="rounded border">
              {isLoadingCertificates ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading certificates...
                </div>
              ) : certificatesError ? (
                <div className="p-8 text-center text-red-500">
                  Error loading certificates: {certificatesError.message}
                </div>
              ) : certificatesData?.data && certificatesData.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Request Info</TableHead>
                      <TableHead>Specimens</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificatesData.data.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">{certificate.certificate_id}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{certificate.request_info?.request_no}</div>
                            <div className="text-xs text-muted-foreground">
                              {certificate.request_info?.sample_lots_count} sample lots
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{certificate.request_info?.total_specimens} specimens</div>
                            <div className="text-xs text-muted-foreground">
                              {certificate.request_info?.specimens?.slice(0, 2).map((spec: Specimen) => spec.specimen_id).join(', ')}
                              {certificate.request_info?.specimens && certificate.request_info.specimens.length > 2 && 
                                ` +${certificate.request_info.specimens.length - 2} more`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(certificate.issue_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Link href={ROUTES.APP.TEST_REPORTS.EDIT(certificate.id)}>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No certificates available for this job
                </div>
              )}
            </div>
          </TabsContent>
          {/* <TabsContent value="discards" className="p-4 pt-0">
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Specimens</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row?.discards && row.discards.length > 0 ? (
                    row.discards.map((discard, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{discard.reason}</TableCell>
                        <TableCell>{discard.date}</TableCell>
                        <TableCell>{discard.specimens}</TableCell>
                        <TableCell>{discard.operator}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={discard.notes}>
                            {discard.notes || "—"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No discards data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent> */}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function PlaceholderTable({ headers }: { headers: string[] }) {
  return (
    <div className="rounded border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(h => (<TableHead key={h}>{h}</TableHead>))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={headers.length} className="text-center text-muted-foreground">Data will appear here</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <div className="col-span-1 text-xs text-muted-foreground">{label}</div>
      <div className="col-span-2 text-sm">{value || "—"}</div>
    </div>
  )
}



