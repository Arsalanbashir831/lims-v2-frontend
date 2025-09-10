"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { samplePreparationService } from "@/lib/sample-preparation-new"
import { testMethodService } from "@/lib/test-methods"
import { SamplePreparationResponse } from "@/lib/schemas/sample-preparation"
import { formatDateSafe } from "@/utils/hydration-fix"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
  const [testMethodNames, setTestMethodNames] = useState<Record<string, string>>({})
  const [loadingTestMethodNames, setLoadingTestMethodNames] = useState(false)

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

  // Fetch test method names when sample preparation data is loaded
  useEffect(() => {
    if (samplePrep?.request_items) {
      const fetchTestMethodNames = async () => {
        const testMethodIds = new Set<string>()
        
        // Collect all unique test method IDs from request items
        samplePrep.request_items.forEach((item: any) => {
          if (item.test_method_oid) {
            testMethodIds.add(item.test_method_oid)
          }
        })
        
        if (testMethodIds.size > 0) {
          setLoadingTestMethodNames(true)
          const names: Record<string, string> = {}
          
          try {
            for (const id of testMethodIds) {
              try {
                const testMethod = await testMethodService.getById(id)
                names[id] = testMethod.test_name || id
              } catch (error) {
                console.warn(`Failed to fetch test method ${id}:`, error)
                names[id] = id // Fallback to ID if fetch fails
              }
            }
            setTestMethodNames(names)
          } finally {
            setLoadingTestMethodNames(false)
          }
        }
      }
      
      fetchTestMethodNames()
    }
  }, [samplePrep])

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
                <Badge variant={samplePrep.is_active ? "default" : "secondary"} className="text-xs">
                  {samplePrep.is_active ? "Active" : "Inactive"}
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
                        {getStatusBadge(samplePrep.is_active ? 'active' : 'inactive')}
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

              {/* Job & Client Information */}
              <div className="border border-border rounded-lg bg-card">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Job & Client Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job ID</label>
                      <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border">{samplePrep.job_id || "N/A"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client Name</label>
                      <p className="text-sm flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md border">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {samplePrep.client_name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Name</label>
                      <p className="text-sm bg-muted/50 px-3 py-2 rounded-md border">{samplePrep.project_name || "N/A"}</p>
                    </div>
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
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Number of Specimens</label>
                    <p className="text-sm bg-muted/50 px-3 py-2 rounded-md border">
                      {samplePrep.specimen_ids?.length || 0} specimens
                    </p>
                  </div>
                  
                  {samplePrep.specimen_ids && samplePrep.specimen_ids.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Specimen IDs</label>
                      <div className="flex flex-wrap gap-2">
                        {samplePrep.specimen_ids.map((specimenId, index) => (
                          <Badge key={index} variant="outline" className="font-mono text-xs">
                            {specimenId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Items */}
              {samplePrep.request_items && samplePrep.request_items.length > 0 && (
                <div className="border border-border rounded-lg bg-card">
                  <div className="px-6 py-4 border-b border-border bg-muted/30">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      Request Items ({samplePrep.request_items.length})
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {samplePrep.request_items.map((item, index) => {
                      const itemNumber = String(index + 1).padStart(3, '0')
                      const itemId = samplePrep.job_id ? `${samplePrep.job_id}-${itemNumber}` : `ITEM-${itemNumber}`
                      
                      return (
                        <div key={index} className="border border-border rounded-lg p-4 space-y-4 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium font-mono">{itemId}</h4>
                            {item.planned_test_date && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(item.planned_test_date)}
                              </Badge>
                            )}
                          </div>
                        
                        {item.item_description && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="text-sm mt-1">{item.item_description}</p>
                          </div>
                        )}
                        
                        {item.test_method_oid && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Test Method</label>
                            <p className="text-sm mt-1 font-medium">
                              {loadingTestMethodNames 
                                ? "Loading..." 
                                : (testMethodNames[item.test_method_oid] || item.test_method_oid)
                              }
                            </p>
                          </div>
                        )}
                        
                        {item.dimension_spec && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Dimension Specification</label>
                            <p className="text-sm mt-1">{item.dimension_spec}</p>
                          </div>
                        )}
                        
                        {item.request_by && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                            <p className="text-sm mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.request_by}
                            </p>
                          </div>
                        )}
                        
                        {item.remarks && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                            <p className="text-sm mt-1">{item.remarks}</p>
                          </div>
                        )}
                        
                        {item.specimen_ids && item.specimen_ids.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Specimen IDs</label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.specimen_ids.map((specimenId, idIndex) => (
                                <Badge key={idIndex} variant="secondary" className="text-xs font-mono">
                                  {specimenId}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {index < samplePrep.request_items.length - 1 && <Separator />}
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
