import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/auth/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { ObjectId } from "mongodb"

function safeDate(value: any): string | null {
  try {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch { return null }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const client = await clientPromise
    const db = client.db("lims")

    // Job: allow lookup by ObjectId or job_id string
    const jobsCol = db.collection("jobs")
    const clientsCol = db.collection("clients")
    const sampleLotsCol = db.collection("sample_lots")
    const testMethodsCol = db.collection("test_methods")

    let jobDoc: any = null
    if (ObjectId.isValid(id)) {
      jobDoc = await jobsCol.findOne({ _id: new ObjectId(id) })
    }
    if (!jobDoc) {
      jobDoc = await jobsCol.findOne({ job_id: id })
    }
    if (!jobDoc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const clientDoc = await clientsCol.findOne({ _id: new ObjectId(jobDoc.client_id) })

    // Lots by job reference (support both string job_id and ObjectId variants)
    const jobIdStr = jobDoc.job_id || String(jobDoc._id)
    const jobObjectId = jobDoc._id instanceof ObjectId ? jobDoc._id : (ObjectId.isValid(String(jobDoc._id)) ? new ObjectId(String(jobDoc._id)) : null)
    const lotFilter: any = {
      $or: [
        { job_id: jobIdStr },
        ...(jobObjectId ? [{ job_id: jobObjectId }, { job_id: String(jobObjectId) }] : []),
      ]
    }
    const lots = await sampleLotsCol.find(lotFilter).sort({ item_no: 1 }).toArray()

    // Resolve test method names in one go
    const methodIds = Array.from(new Set(lots.flatMap((l: any) => Array.isArray(l.test_method_oids) ? l.test_method_oids.map(String) : [])))
    let methodMap = new Map<string, string>()
    if (methodIds.length > 0) {
      const methods = await testMethodsCol.find({ _id: { $in: methodIds.filter(ObjectId.isValid).map((s) => new ObjectId(s)) } }).project({ test_name: 1 }).toArray()
      methodMap = new Map(methods.map((m: any) => [m._id.toString(), m.test_name as string]))
    }

    console.log(jobDoc, clientDoc)

    const job = {
      job_id: jobDoc.job_id,
      project_name: jobDoc.project_name ?? null,
      client_name: clientDoc?.client_name ?? null,
      end_user: jobDoc.end_user ?? null,
      receive_date: safeDate(jobDoc.receive_date),
      received_by: jobDoc.received_by ?? null,
      remarks: jobDoc.remarks ?? null,
    }

    const lotsOut = lots.map((doc: any) => ({
      id: doc._id.toString(),
      job_id: typeof doc.job_id === 'string' ? doc.job_id : (doc.job_id ? String(doc.job_id) : ''),
      item_no: typeof doc.item_no === 'string' ? doc.item_no : (doc.item_no != null ? String(doc.item_no) : ''),
      sample_type: doc.sample_type == null ? null : String(doc.sample_type),
      material_type: doc.material_type == null ? null : String(doc.material_type),
      condition: doc.condition == null ? null : String(doc.condition),
      heat_no: doc.heat_no == null ? null : String(doc.heat_no),
      description: doc.description == null ? null : String(doc.description),
      mtc_no: doc.mtc_no == null ? null : String(doc.mtc_no),
      storage_location: doc.storage_location == null ? null : String(doc.storage_location),
      test_method_oids: Array.isArray(doc.test_method_oids) ? doc.test_method_oids.map(String) : [],
      test_method_names: Array.isArray(doc.test_method_oids) ? doc.test_method_oids.map((x: any) => methodMap.get(String(x)) || String(x)) : [],
      // created_at: safeDate(doc.created_at),
      // updated_at: safeDate(doc.updated_at),
    }))

    return NextResponse.json({ job, lots: lotsOut })
  } catch (error: any) {
    console.error("GET /api/sample-information/[id]/complete-info error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}


