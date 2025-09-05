"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSidebar } from "../ui/sidebar"
import { cn } from "@/lib/utils"
import { SampleDetail, CreateSampleDetailData, UpdateSampleDetailData, TestMethodRef, sampleDetailService } from "@/lib/sample-details"
import { sampleInformationService } from "@/lib/sample-information"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"
import { useQueryClient } from "@tanstack/react-query"
import { JobSelector } from "@/components/common/job-selector"
import { TestMethodsSelector } from "@/components/common/test-methods-selector"

interface Props {
  initial?: SampleDetail
  readOnly?: boolean
}


export function SampleDetailForm({ initial, readOnly = false }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { state } = useSidebar()
  const [job, setJob] = useState(initial?.job_id ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [mtcNo, setMtcNo] = useState(initial?.mtc_no ?? "")
  const [sampleType, setSampleType] = useState(initial?.sample_type ?? "")
  const [materialType, setMaterialType] = useState(initial?.material_type ?? "")
  const [heatNo, setHeatNo] = useState(initial?.heat_no ?? "")
  const [storageLocation, setStorageLocation] = useState(initial?.material_storage_location ?? "")
  const [condition, setCondition] = useState(initial?.condition ?? "")
  const [testMethods, setTestMethods] = useState<string[]>(initial?.test_methods ?? [])
  const [selectedJob, setSelectedJob] = useState<{job_id: string, project_name: string, client_name: string} | undefined>(undefined)

  const isEditing = Boolean(initial)
  const maxWidth = useMemo(() => (state === "expanded" ? "lg:max-w-[calc(100vw-24.5rem)]" : "lg:max-w-screen"), [state])

  // Load selected job data when editing
  useEffect(() => {
    const loadSelectedJob = async () => {
      if (initial?.job_id) {
        try {
          const response = await sampleInformationService.search(initial.job_id, 1)
          const job = response.results.find(j => j.job_id === initial.job_id)
          if (job) {
            setSelectedJob({
              job_id: job.job_id,
              project_name: job.project_name,
              client_name: job.client_name
            })
          }
        } catch (error) {
          console.error("Failed to load selected job:", error)
        }
      }
    }

    loadSelectedJob()
  }, [initial?.job_id])

  // Update form when initial data changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setJob(initial.job_id ?? "")
      setDescription(initial.description ?? "")
      setMtcNo(initial.mtc_no ?? "")
      setSampleType(initial.sample_type ?? "")
      setMaterialType(initial.material_type ?? "")
      setHeatNo(initial.heat_no ?? "")
      setStorageLocation(initial.material_storage_location ?? "")
      setCondition(initial.condition ?? "")
      setTestMethods(initial.test_methods ?? [])
    }
  }, [initial])


  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!job.trim()) {
      toast.error("Job ID is required")
      return
    }
    
    if (!description.trim()) {
      toast.error("Description is required")
      return
    }

    const payload: CreateSampleDetailData = {
      job: job.trim(),
      description: description.trim(),
      mtc_no: mtcNo.trim() || undefined,
      sample_type: sampleType.trim() || undefined,
      material_type: materialType.trim() || undefined,
      heat_no: heatNo.trim() || undefined,
      material_storage_location: storageLocation.trim() || undefined,
      condition: condition.trim() || undefined,
      test_methods: testMethods,
    }

    if (isEditing && initial) {
      sampleDetailService.update(initial.id.toString(), payload as UpdateSampleDetailData)
        .then(() => { 
          queryClient.invalidateQueries({ queryKey: ['sample-details'] })
          toast.success("Sample detail updated"); 
          router.push(ROUTES.APP.SAMPLE_DETAILS.ROOT) 
        })
        .catch((error) => {
          console.error("Failed to update sample detail:", error)
          toast.error("Failed to update sample detail")
        })
      return
    }

    sampleDetailService.create(payload)
      .then(() => { 
        queryClient.invalidateQueries({ queryKey: ['sample-details'] })
        toast.success("Sample detail created"); 
        router.push(ROUTES.APP.SAMPLE_DETAILS.ROOT) 
      })
      .catch((error) => {
        console.error("Failed to create sample detail:", error)
        toast.error("Failed to create sample detail")
      })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card className="border-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Sample Detail</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Individual sample item details and test methods.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Job ID</Label>
            <JobSelector
              value={job}
              onValueChange={setJob}
              placeholder="Select job..."
              disabled={readOnly}
              selectedJob={selectedJob}
            />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label>Description</Label>
            <Textarea placeholder="Item description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={readOnly} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label>MTC No</Label>
            <Input placeholder="MTC-001" value={mtcNo} onChange={(e) => setMtcNo(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Sample Type</Label>
            <Input placeholder="TENSILE" value={sampleType} onChange={(e) => setSampleType(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Material Type</Label>
            <Input placeholder="STEEL" value={materialType} onChange={(e) => setMaterialType(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Heat No</Label>
            <Input placeholder="H123456" value={heatNo} onChange={(e) => setHeatNo(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Storage Location</Label>
            <Input placeholder="Storage A1" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2">
            <Label>Condition</Label>
            <Input placeholder="AS_RECEIVED" value={condition} onChange={(e) => setCondition(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-2 md:col-span-2 xl:col-span-3">
            <Label>Test Methods</Label>
            <TestMethodsSelector
              value={testMethods}
              onValueChange={setTestMethods}
              placeholder="Select test methods..."
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
          <div className="flex justify-end">
            <Button type="submit" className="px-6">{isEditing ? "Update Sample Detail" : "Save Sample Detail"}</Button>
          </div>
        </div>
      )}
    </form>
  )
}
