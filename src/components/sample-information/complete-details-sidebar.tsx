"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { TrashIcon, EditIcon, CalendarIcon, BuildingIcon, PackageIcon } from "lucide-react"
import { ConfirmPopover } from "@/components/ui/confirm-popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { sampleInformationService } from "@/services/sample-information.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { toast } from "sonner"
import { sampleLotService } from "@/services/sample-lots.service"
import { ScrollArea } from "../ui/scroll-area"

export default function CompleteDetailsSidebar({
    selectedJobId,
    isSidebarOpen,
    setIsSidebarOpen,
}: {
    selectedJobId: string | null
    isSidebarOpen: boolean
    setIsSidebarOpen: (open: boolean) => void
}) {
    const queryClient = useQueryClient()

    const { data: sidebarData, isFetching } = useQuery({
        queryKey: ['sample-lots-by-job', selectedJobId],
        queryFn: () => selectedJobId ? sampleLotService.getByJobDocumentId(selectedJobId) : Promise.resolve(null),
        enabled: !!selectedJobId,
    })

    const deleteMutation = useMutation({
        mutationFn: sampleLotService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sample-lots-by-job', selectedJobId] })
            toast.success("Sample lot deleted successfully")
        },
        onError: () => {
            toast.error("Failed to delete sample lot")
        },
    })

    const doDelete = useCallback((id: string) => {
        deleteMutation.mutate(id)
    }, [deleteMutation])

    return (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent className="w-full sm:max-w-4xl p-6">
                <ScrollArea className="h-[95vh]">
                    <SheetHeader>
                        <div className="flex items-center justify-between">
                            <SheetTitle className="flex items-center gap-2">
                                <PackageIcon className="w-5 h-5" />
                                Job Details
                            </SheetTitle>
                            {selectedJobId && (
                                <Button size="sm" asChild>
                                    <Link href={ROUTES.APP.SAMPLE_INFORMATION.EDIT(selectedJobId)}>
                                        <EditIcon className="w-4 h-4 mr-1" />
                                        Edit Job
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Job Information Card */}
                        {isFetching ? (
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-64" />
                                    <Skeleton className="h-4 w-48" />
                                </CardContent>
                            </Card>
                        ) : sidebarData?.job_info ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Job Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-muted-foreground">Job ID</div>
                                            <Badge variant="secondary" className="font-mono">
                                                {sidebarData.job_info.job_id}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                Received Date
                                            </div>
                                            <div className="text-sm">
                                                {new Date(sidebarData.job_info.receive_date).toLocaleDateString() ?? "N/A"}
                                            </div>
                                        </div>
                                   
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-muted-foreground">Project Name</div>
                                        <div className="text-sm font-medium">{sidebarData.job_info.project_name ?? "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <BuildingIcon className="w-3 h-3" />
                                            Client
                                        </div>
                                        <div className="text-sm font-medium">{sidebarData.job_info.client_name ?? "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-muted-foreground">End User</div>
                                        <div className="text-sm">{sidebarData.job_info.end_user ?? "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-muted-foreground">Received By</div>
                                        <div className="text-sm">{sidebarData.job_info.received_by ?? "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-muted-foreground">Remarks</div>
                                        <div className="text-sm">{sidebarData.job_info.remarks ?? "N/A"}</div>
                                    </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <PackageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">Select a job to view details</p>
                                </CardContent>
                            </Card>
                        )}

                        <Separator />

                        {/* Sample Lots Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <PackageIcon className="w-5 h-5" />
                                        Sample Lots
                                    </CardTitle>
                                    {selectedJobId && (
                                        <Button size="sm" asChild>
                                            <Link href={ROUTES.APP.SAMPLE_DETAILS.EDIT(selectedJobId)}>
                                                <EditIcon className="w-4 h-4 mr-1" />
                                                Edit Sample Lots
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isFetching ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                        <Skeleton className="h-4 w-4/6" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {(sidebarData?.data ?? []).length === 0 ? (
                                            <div className="text-center py-8">
                                                <PackageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No sample lots found for this job.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {(sidebarData?.data ?? []).map((lot: any) => (
                                                    <Card key={lot.id} className="border-l-4 border-l-primary">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-2 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="font-mono">
                                                                            {lot.item_no}
                                                                        </Badge>
                                                                        {lot.sample_type && (
                                                                            <Badge variant="secondary">
                                                                                {lot.sample_type ?? "N/A"}
                                                                            </Badge>
                                                                        )}
                                                                        {lot.material_type && (
                                                                            <Badge variant="secondary">
                                                                                {lot.material_type ?? "N/A"}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                        <div className="md:col-span-2">
                                                                            <span className="text-muted-foreground">Description: </span>
                                                                            <span>{lot.description ?? "N/A"}</span>
                                                                        </div>

                                                                        <div>
                                                                            <span className="text-muted-foreground">Sample Type: </span>
                                                                            <span className="font-medium">{lot.sample_type ?? "N/A"}</span>
                                                                        </div>

                                                                        <div>
                                                                            <span className="text-muted-foreground">Material Type: </span>
                                                                            <span className="font-medium">{lot.material_type ?? "N/A"}</span>
                                                                        </div>

                                                                        <div>
                                                                            <span className="text-muted-foreground">Test Methods Count: </span>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {lot.test_methods_count ?? 0}
                                                                            </Badge>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground">Created: </span>
                                                                            <span className="font-medium">{new Date(lot.created_at).toLocaleDateString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="ml-4">
                                                                    <ConfirmPopover
                                                                        trigger={
                                                                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                                                                <TrashIcon className="w-4 h-4" />
                                                                            </Button>
                                                                        }
                                                                        title="Delete Sample Lot"
                                                                        description={`Are you sure you want to delete sample lot ${lot.item_no}? This action cannot be undone.`}
                                                                        confirmText="Delete"
                                                                        cancelText="Cancel"
                                                                        onConfirm={() => doDelete(lot.id)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}