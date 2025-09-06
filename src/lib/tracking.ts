import { listSampleReceivings, type SampleReceiving } from "@/lib/sample-receiving"
import { samplePreparationService, type SamplePreparation } from "@/lib/sample-preparation"
import { listTestReports, type TestReport } from "@/lib/test-reports"
import { listDiscardedMaterials, type DiscardedMaterial } from "@/lib/discarded-materials"

export type TrackingStatus = "received" | "in_preparation" | "reported" | "discarded"

export interface TrackingRow {
  id: string
  sampleId: string
  projectName: string
  clientName: string
  itemsCount: number
  specimensCount: number
  latestStatus: TrackingStatus
  receivedDate?: string
  preparationDate?: string
  reportIssueDate?: string
  discardDate?: string
  receiving?: SampleReceiving
  preparations?: SamplePreparation[]
  reports?: TestReport[]
  discards?: DiscardedMaterial[]
}

export async function computeTrackingRows(): Promise<TrackingRow[]> {
  const receivings = listSampleReceivings()
  const preparationsResponse = await samplePreparationService.getAll(1)
  const preparations = preparationsResponse.results
  const reports = listTestReports()
  const discards = listDiscardedMaterials()

  const prepByReceiving = new Map<string, SamplePreparation[]>()
  for (const p of preparations) {
    // Note: The new structure uses job_id instead of sampleReceivingId
    // We'll need to map this differently or update the tracking logic
    const arr = prepByReceiving.get(p.job_id) ?? []
    arr.push(p)
    prepByReceiving.set(p.job_id, arr)
  }

  const reportsByPrep = new Map<string, TestReport[]>()
  for (const r of reports) {
    const arr = reportsByPrep.get(r.preparationId) ?? []
    arr.push(r)
    reportsByPrep.set(r.preparationId, arr)
  }

  const discardsBySample = new Map<string, DiscardedMaterial[]>()
  for (const d of discards) {
    const arr = discardsBySample.get(d.sampleId) ?? []
    arr.push(d)
    discardsBySample.set(d.sampleId, arr)
  }

  return receivings.map((rec) => {
    // Map by job_id instead of sampleReceivingId
    const preps = prepByReceiving.get(rec.sampleId) ?? []
    const repList = preps.flatMap((p) => reportsByPrep.get(p.id) ?? [])
    const discList = discardsBySample.get(rec.sampleId) ?? []

    const itemsCount = rec.items?.length ?? 0
    const specimensCount = preps.reduce((sum, p) => sum + p.items.reduce((n, it) => n + (it.specimen_ids?.length ?? 0), 0), 0)

    let latestStatus: TrackingStatus = "received"
    if (discList.length > 0) latestStatus = "discarded"
    else if (repList.length > 0) latestStatus = "reported"
    else if (preps.length > 0) latestStatus = "in_preparation"

    const receivedDate = rec.receiveDate
    const preparationDate = preps[0]?.created_at
    const reportIssueDate = repList[0]?.certificate?.issueDate
    const discardDate = discList[0]?.discardDate

    return {
      id: rec.id,
      sampleId: rec.sampleId,
      projectName: rec.projectName,
      clientName: rec.clientId, // Using clientId as clientName for now
      itemsCount,
      specimensCount,
      latestStatus,
      receivedDate,
      preparationDate,
      reportIssueDate,
      discardDate,
      receiving: rec,
      preparations: preps,
      reports: repList,
      discards: discList,
    }
  })
}


