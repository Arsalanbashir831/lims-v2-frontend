"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TrackingRow } from "@/lib/tracking"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  row?: TrackingRow | null
}

export function TrackingDrawer({ open, onOpenChange, row }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:max-w-[70vw] lg:max-w-[60vw] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between w-full">
            <span>{row?.sampleId} — {row?.projectName}</span>
            <Badge variant="secondary" className="capitalize">{row?.latestStatus?.replaceAll("_"," ")}</Badge>
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="m-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="preparation">Preparation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="discards">Discards</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="p-4 pt-0 space-y-4">
            <section className="rounded-lg border">
              <header className="px-4 py-3 border-b flex items-center justify-between">
                <div className="text-sm font-medium">Summary</div>
                <Badge variant="secondary" className="capitalize">{row?.latestStatus?.replaceAll("_"," ")}</Badge>
              </header>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Field label="Client" value={row?.clientName} />
                <Field label="Project" value={row?.projectName} />
                <Field label="Items" value={String(row?.itemsCount ?? 0)} />
                <Field label="Specimens" value={String(row?.specimensCount ?? 0)} />
              </div>
            </section>

            <section className="rounded-lg border">
              <header className="px-4 py-3 border-b text-sm font-medium">Timeline</header>
              <ol className="p-4 space-y-3">
                <TimelineItem title="Received" date={row?.receivedDate} active={!!row?.receivedDate} />
                <TimelineItem title="Preparation" date={row?.preparationDate} active={!!row?.preparationDate} />
                <TimelineItem title="Report Issued" date={row?.reportIssueDate} active={!!row?.reportIssueDate} />
                <TimelineItem title="Discarded" date={row?.discardDate} active={!!row?.discardDate} />
              </ol>
            </section>
          </TabsContent>
          <TabsContent value="items" className="p-4 pt-0">
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Heat #</TableHead>
                    <TableHead>Methods</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row?.receiving?.items?.length ? (
                    row!.receiving!.items!.map((it: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell className="max-w-[360px] truncate" title={it?.description}>{it?.description ?? "—"}</TableCell>
                        <TableCell>{it?.heatNo ?? "—"}</TableCell>
                        <TableCell className="max-w-[280px] truncate" title={(it?.testMethods ?? []).join(', ')}>
                          {(it?.testMethods ?? []).join(", ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No items</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="preparation" className="p-4 pt-0">
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Specimens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row?.preparations?.length ? (
                    row!.preparations!.flatMap((p) => p.items.map((it) => ({ p, it }))).map(({ p, it }) => (
                      <TableRow key={`${p.id}-${it.id}`}>
                        <TableCell>{p.prepNo}</TableCell>
                        <TableCell className="max-w-[320px] truncate" title={it.description}>{`Item ${it.indexNo} — ${it.description}`}</TableCell>
                        <TableCell>{it.testMethodName ?? "—"}</TableCell>
                        <TableCell className="font-mono">{(it.specimenIds ?? []).join(", ") || "—"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No preparation records</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="reports" className="p-4 pt-0">
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report #</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row?.reports?.length ? (
                    row!.reports!.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.reportNo}</TableCell>
                        <TableCell>{r.certificate?.issueDate ?? "—"}</TableCell>
                        <TableCell>{r.items?.length ?? 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No reports</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="discards" className="p-4 pt-0">
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Specimens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row?.discards?.length ? (
                    row!.discards!.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="max-w-[360px] truncate" title={d.discardReason}>{d.discardReason}</TableCell>
                        <TableCell>{d.discardDate}</TableCell>
                        <TableCell className="max-w-[280px] truncate" title={(d.items ?? []).map(i=>i.specimenId).join(', ')}>
                          {(d.items ?? []).map(i => i.specimenId).join(", ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No discards</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
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

function TimelineItem({ title, date, active }: { title: string; date?: string; active?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/40"}`} />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{date || "—"}</div>
      </div>
    </li>
  )
}


