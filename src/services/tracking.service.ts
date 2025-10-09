import { listSampleReceivings, type SampleReceiving } from "@/lib/sample-receiving"
import { samplePreparationService } from "@/services/sample-preparation.service"
import { testReportService } from "@/services/test-reports.service"
import { listDiscardedMaterials, type DiscardedMaterial } from "@/lib/discarded-materials"

export type TrackingStatus = "received" | "in_preparation" | "reported" | "discarded"

export interface TrackingRow {
  id: string
  sampleId: string
  status: TrackingStatus
  receivedDate: string
  preparationDate?: string
  reportDate?: string
  discardedDate?: string
  clientName: string
  projectName: string
  sampleType: string
  materialGrade: string
  testMethods: string[]
  equipmentUsed: string[]
  operatorName: string
  notes?: string
}

export async function computeTrackingRows(): Promise<TrackingRow[]> {
  // This function would typically fetch data from various services
  // and compute the tracking status for each sample
  // For now, returning mock data structure
  return []
}

export { listSampleReceivings, listDiscardedMaterials }
export type { SampleReceiving, DiscardedMaterial }
