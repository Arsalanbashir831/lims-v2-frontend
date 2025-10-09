"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { samplePreparationService } from "@/services/sample-preparation.service"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  User,
  Building,
  FileText,
  Package,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"

interface SamplePrepDrawerProps {
  isOpen: boolean
  onClose: () => void
  samplePrepId: string | null
}

export function SamplePrepDrawer({ isOpen, onClose, samplePrepId }: SamplePrepDrawerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch detailed sample preparation data
  const { data: samplePrep, isLoading, error } = useQuery({
    queryKey: ['sample-preparation-detail', samplePrepId],
    queryFn: () => samplePrepId ? samplePreparationService.getById(samplePrepId) : null,
    enabled: !!samplePrepId && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })


  if (!mounted) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'inactive':
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="!w-[70vw] !max-w-[70vw] overflow-y-auto p-0">
        <SheetTitle className="sr-only">Sample Preparation Details</SheetTitle>
        <SheetDescription className="sr-only">
          Complete information about the selected sample preparation request
        </SheetDescription>

        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Sample Preparation Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Complete information about the selected request</p>
            </div>
            <div className="flex items-center gap-2">
              {samplePrep && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load sample preparation details</span>
            </div>
          ) : samplePrep ? (
            <>
              {/* Basic Information */}
              <div className="border border-border rounded-lg bg-card">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Request Number</label>
                      <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border">{samplePrep.request_no || "N/A"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                      <div>
                        {getStatusBadge('active')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created Date</label>
                      <p className="text-sm flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md border">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(samplePrep.created_at)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated Date</label>
                      <p className="text-sm flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md border">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(samplePrep.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="border border-border rounded-lg bg-card">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Job Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {samplePrep.sample_lots && samplePrep.sample_lots.length > 0 && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job ID</label>
                          <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border">
                            {samplePrep.sample_lots[0]?.job_id || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Name</label>
                    <p className="text-sm bg-muted/50 px-3 py-2 rounded-md border">
                      {samplePrep.sample_lots[0]?.project_name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client Name</label>
                    <p className="text-sm bg-muted/50 px-3 py-2 rounded-md border">
                      {samplePrep.sample_lots[0]?.client_name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specimen Information */}
              <div className="border border-border rounded-lg bg-card">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    Specimen Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Specimens</label>
                    <p className="text-sm bg-muted/50 px-3 py-2 rounded-md border">
                      {samplePrep.sample_lots?.reduce((total, lot) => total + (lot.specimens_count || 0), 0) || 0} specimens
                    </p>
                  </div>

                  {samplePrep.sample_lots && samplePrep.sample_lots.length > 0 && (
                    <div className="space-y-4">
                      {samplePrep.sample_lots.map((lot: any, lotIndex: number) => (
                        <div key={lotIndex} className="border border-border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">Sample Lot {lotIndex + 1}</h4>
                            <Badge variant="outline" className="text-xs">
                              {lot.specimens_count || 0} specimens
                            </Badge>
                          </div>

                          {lot.specimens && lot.specimens.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Specimen IDs</label>
                              <div className="flex flex-wrap gap-2">
                                {lot.specimens.map((specimen: any, specIndex: number) => (
                                  <Badge key={specIndex} variant="outline" className="font-mono text-xs">
                                    {specimen.specimen_id}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Lots */}
              {samplePrep.sample_lots && samplePrep.sample_lots.length > 0 && (
                <div className="border border-border rounded-lg bg-card">
                  <div className="px-6 py-4 border-b border-border bg-muted/30">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      Sample Lots ({samplePrep.sample_lots.length})
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {samplePrep.sample_lots.map((lot: any, index: number) => {
                      const itemNumber = String(index + 1).padStart(3, '0')
                      const itemId = lot.job_id ? `${lot.job_id}-${itemNumber}` : `ITEM-${itemNumber}`

                      return (
                        <div key={index} className="border border-border rounded-lg p-4 space-y-4 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium font-mono">{lot.item_no || itemId}</h4>
                            {lot.planned_test_date && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(lot.planned_test_date)}
                              </Badge>
                            )}
                          </div>

                          {lot.item_description && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Description</label>
                              <p className="text-sm mt-1">{lot.item_description}</p>
                            </div>
                          )}

                           {lot.test_method?.test_method_oid && (
                             <div>
                               <label className="text-sm font-medium text-muted-foreground">Test Method</label>
                               <p className="text-sm mt-1 font-medium">
                                 {lot.test_method.test_name || lot.test_method.test_method_oid}
                               </p>
                             </div>
                           )}

                          {lot.dimension_spec && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Dimension Specification</label>
                              <p className="text-sm mt-1">{lot.dimension_spec}</p>
                            </div>
                          )}

                          {lot.request_by && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                              <p className="text-sm mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {lot.request_by}
                              </p>
                            </div>
                          )}

                          {lot.remarks && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                              <p className="text-sm mt-1">{lot.remarks}</p>
                            </div>
                          )}

                          {lot.specimens && lot.specimens.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Specimen IDs</label>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {lot.specimens.map((specimen: any, specIndex: number) => (
                                  <Badge key={specIndex} variant="secondary" className="text-xs font-mono">
                                    {specimen.specimen_id}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {index < samplePrep.sample_lots.length - 1 && <Separator />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sample preparation data available</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
