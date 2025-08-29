import { listSampleReceivings, type SampleReceiving } from "@/lib/sample-receiving"
import { listSamplePreparations, type SamplePreparation } from "@/lib/sample-preparation"
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

export function computeTrackingRows(): TrackingRow[] {
  const receivings = listSampleReceivings()
  const preparations = listSamplePreparations()
  const reports = listTestReports()
  const discards = listDiscardedMaterials()

  const prepByReceiving = new Map<string, SamplePreparation[]>()
  for (const p of preparations) {
    const arr = prepByReceiving.get(p.sampleReceivingId) ?? []
    arr.push(p)
    prepByReceiving.set(p.sampleReceivingId, arr)
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
    const preps = prepByReceiving.get(rec.id) ?? []
    const repList = preps.flatMap((p) => reportsByPrep.get(p.id) ?? [])
    const discList = discardsBySample.get(rec.sampleId) ?? []

    const itemsCount = rec.items?.length ?? 0
    const specimensCount = preps.reduce((sum, p) => sum + p.items.reduce((n, it) => n + (it.specimenIds?.length ?? 0), 0), 0)

    let latestStatus: TrackingStatus = "received"
    if (discList.length > 0) latestStatus = "discarded"
    else if (repList.length > 0) latestStatus = "reported"
    else if (preps.length > 0) latestStatus = "in_preparation"

    const receivedDate = rec.receiveDate
    const preparationDate = preps[0]?.createdAt
    const reportIssueDate = repList[0]?.certificate?.issueDate
    const discardDate = discList[0]?.discardDate

    return {
      id: rec.id,
      sampleId: rec.sampleId,
      projectName: rec.projectName,
      clientName: rec.clientName,
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


