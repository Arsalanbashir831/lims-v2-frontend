"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { SamplePreparationForm, type SamplePreparationFormData } from "@/components/sample-preparation/form"
import { useSamplePreparationDetail } from "@/hooks/use-sample-preparations"
import { sampleInformationService } from "@/services/sample-information.service"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { FormHeader } from "@/components/common/form-header"
import { ROUTES } from "@/constants/routes"

export default function EditSamplePreparationPage() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<SamplePreparationFormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Use the new hook for data fetching
  const { data: rec, error, isLoading } = useSamplePreparationDetail(id || '')
  
  // Debug logging for data fetching
  console.log('Edit page - ID:', id)
  console.log('Edit page - Data:', rec)
  console.log('Edit page - Error:', error)
  console.log('Edit page - Loading:', isLoading)

  useEffect(() => {
    if (!rec || !id) return
    const loadData = async () => {
      try {
        
        // Map the new API response structure to form data
        const apiResponse = rec as any
        console.log('Sample preparation data for edit:', apiResponse)
        console.log('rec data:', rec)
        
        // Get the first sample lot for job information
        const firstSampleLot = apiResponse.sample_lots?.[0]
        
        // For edit mode, we need to find the job's document ID
        // The job_id in the response is the business ID, not the document ID
        // We need to search for the job to get its document ID
        const businessJobId = firstSampleLot?.job_id || firstSampleLot?.sample_lot_info?.job_id
        let jobDocumentId = ''
        
        if (businessJobId) {
          try {
            console.log('Searching for job with business ID:', businessJobId)
            // Search for the job by business ID to get the document ID
            const jobSearchResponse = await sampleInformationService.search(businessJobId, 1)
            console.log('Job search response:', jobSearchResponse)
            const matchingJob = jobSearchResponse.results.find((job: any) => job.job_id === businessJobId)
            console.log('Matching job:', matchingJob)
            if (matchingJob) {
              jobDocumentId = matchingJob.id
              console.log('Found job document ID:', jobDocumentId)
            } else {
              console.log('No matching job found')
            }
          } catch (error) {
            console.error('Failed to find job document ID:', error)
          }
        }
        
        const mappedData: SamplePreparationFormData = {
          id: apiResponse.id || '',
          job: jobDocumentId, // Use the job's document ID
          request_id: firstSampleLot?.sample_lot_id || '',
          test_items: (apiResponse.sample_lots || []).map((lot: any, index: number) => {            
            return {
              id: lot.sample_lot_id || `item-${index}`,
              item_description: lot.item_description || '',
              test_method: lot.test_method?.test_method_oid || lot.test_method_info?.test_method_oid || '',
              dimensions: lot.dimension_spec || '',
              no_of_specimens: lot.specimens_count || lot.specimens?.length || 0,
              requested_by: lot.request_by || '',
              remarks: lot.remarks || '',
              planned_test_date: lot.planned_test_date || '',
              specimens: Array.isArray(lot.specimens) && lot.specimens.length > 0
                ? lot.specimens.map((specimen: any, idx: number) => ({
                    id: specimen.specimen_oid || `specimen-${idx}`,
                    specimen_id: specimen.specimen_id || '',
                    isFromInitialData: true,
                  }))
                : []
            }
          })
        }
        
        console.log('Mapped form data:', mappedData)
        console.log('Setting initial data:', mappedData)
        setInitial(mappedData)
      } catch (error) {
        console.error("Failed to load sample preparation:", error)
        toast.error("Failed to load sample preparation")
      }
    }
    loadData()
  }, [rec, id])

  // Handle loading and error states
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground mt-2">
          Failed to load sample preparation: {error.message}
        </p>
      </div>
    )
  }


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
        <>
          {console.log('Rendering form with initial data:', initial)}
          <SamplePreparationForm 
            key={`${id}-${initial.id}-${isEditing}`} 
            initialData={initial} 
            readOnly={!isEditing} 
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  )
}


