"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TrackingRow } from "@/services/tracking.service"

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
            <Badge variant="secondary" className="capitalize">{row?.status?.replaceAll("_"," ")}</Badge>
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
                <Badge variant="secondary" className="capitalize">{row?.status?.replaceAll("_"," ")}</Badge>
              </header>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <Field label="Client" value={row?.clientName} />
                <Field label="Project" value={row?.projectName} />
                <Field label="Items" value={String(row?.testMethods?.length ?? 0)} />
                <Field label="Specimens" value={String(row?.equipmentUsed?.length ?? 0)} />
              </div>
            </section>

            <section className="rounded-lg border">
              <header className="px-4 py-3 border-b text-sm font-medium">Timeline</header>
              <ol className="p-4 space-y-3">
                <TimelineItem title="Received" date={row?.receivedDate} active={!!row?.receivedDate} />
                <TimelineItem title="Preparation" date={row?.preparationDate} active={!!row?.preparationDate} />
                <TimelineItem title="Report Issued" date={row?.reportDate} active={!!row?.reportDate} />
                <TimelineItem title="Discarded" date={row?.discardedDate} active={!!row?.discardedDate} />
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
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No items data available</TableCell>
                  </TableRow>
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
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No preparation data available</TableCell>
                  </TableRow>
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
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No reports data available</TableCell>
                  </TableRow>
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
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No discards data available</TableCell>
                  </TableRow>
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


