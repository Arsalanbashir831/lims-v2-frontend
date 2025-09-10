"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { samplePreparationService } from "@/lib/sample-preparation-new"
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
        
        // Map the API response structure to form data
        const apiResponse = rec as any
        console.log('Sample preparation data for edit:', apiResponse)
        
        const mappedData: SamplePreparationFormData = {
          id: apiResponse.id || '',
          job: apiResponse.job_id || '', // Use job_id directly since we removed job selector
          test_items: (apiResponse.request_items || []).map((item: any, index: number) => {            
            return {
              id: item.id?.toString() || `item-${index}`,
              sample: 0, // Will be mapped to correct sample ID when job data loads
              request_id_for_edit: item.sample_lot_id || item.request_id || apiResponse.id || '',
              item_description: item.item_description || '',
              test_method: item.test_method_oid || item.test_method || '',
              dimensions: item.dimension_spec || item.dimensions || '',
              no_of_specimens: Number(item.no_of_specimens) || (Array.isArray(item.specimen_oids) ? item.specimen_oids.length : 0),
              requested_by: item.request_by || item.requested_by || '',
              remarks: item.remarks || '',
              planned_test_date: item.planned_test_date || '',
              specimens: Array.isArray(item.specimen_ids) && item.specimen_ids.length > 0
                ? item.specimen_ids.map((specimenId: string, idx: number) => ({
                    id: `specimen-${idx}`,
                    specimen_id: String(specimenId),
                    isFromInitialData: true,
                  }))
                : Array.isArray(item.specimen_oids) && item.specimen_oids.length > 0
                ? item.specimen_oids.map((oid: string, idx: number) => ({
                    id: String(oid),
                    specimen_id: String(oid), // Fallback to OID if specimen_ids not available
                    isFromInitialData: true,
                  }))
                : []
            }
          })
        }
        
        console.log('Mapped form data:', mappedData)
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


