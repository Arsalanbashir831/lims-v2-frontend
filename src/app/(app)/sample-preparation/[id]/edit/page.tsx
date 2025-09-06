"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { samplePreparationService } from "@/lib/sample-preparation"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"
import { ROUTES } from "@/constants/routes"

export default function EditSamplePreparationPage() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<SamplePreparationFormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const rec = await samplePreparationService.getById(id)
        
        // Map the new API response structure to form data
        const apiResponse = rec as any
        const mappedData: SamplePreparationFormData = {
          id: apiResponse.request_id || apiResponse.id || '',
          job: apiResponse.job || apiResponse.job_id || '',
          test_items: (apiResponse.test_items || []).map((item: any) => {            
            return {
              id: item.id?.toString() || '',
              sample: item.sample_id || '', // Keep as string for now, will be converted to number when complete job loads
              test_method: item.test_method_details?.id || item.test_method_name || '', // Use test_method_details.id if available, fallback to name
              dimensions: item.dimensions || '',
              no_of_samples: parseInt(item.no_of_samples) || 0,
              no_of_specimens: parseInt(item.no_of_specimens) || 0,
              requested_by: item.requested_by || '',
              remarks: item.remarks || '',
              planned_test_date: item.planned_test_date || '',
              specimens: item.specimens?.map((spec: any) => ({
                id: spec.id?.toString() || '',
                specimen_id: spec.specimen_id || '',
                isFromInitialData: true // Mark specimens from initial data
              })) || []
            }
          })
        }
        
        setInitial(mappedData)
      } catch (error) {
        console.error("Failed to load sample preparation:", error)
        toast.error("Failed to load sample preparation")
      }
    }
    loadData()
  }, [id])


  return (
    <div className="grid gap-4">
      <FormHeader title="Edit Sample Preparation" description="Edit the sample preparation details" label={null} href={ROUTES.APP.SAMPLE_PREPARATION.ROOT}>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-1" /> Edit</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><XIcon className="w-4 h-4 mr-1" /> Cancel</Button>
        )}
      </FormHeader>
      {initial ? (
        <SamplePreparationForm initialData={initial} readOnly={!isEditing} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  )
}


