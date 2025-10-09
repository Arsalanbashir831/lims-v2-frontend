import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/auth/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { ObjectId } from "mongodb"
import { CreateSampleLotSchema, SampleLotResponseSchema, SampleLotListResponseSchema } from "@/lib/schemas/sample-lot"

function safeDate(value: any): string | null {
  try {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch { return null }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = await clientPromise
    const db = client.db("lims")
    const collection = db.collection("sample_lots")

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20
    const skip = (page - 1) * limit

    const baseFilter: any = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }

    // Use aggregation to join with jobs collection to get job_id string
    const pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job_id',
          foreignField: '_id',
          as: 'jobDoc'
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]

    const [results, count] = await Promise.all([
      collection.aggregate(pipeline).toArray(),
      collection.countDocuments(baseFilter)
    ])

    const mapped = results.map((doc: any) => ({
      id: doc._id.toString(),
      job_id: doc.jobDoc?.[0]?.job_id || doc.job_id?.toString() || "", // Get job_id string from joined job document
      item_no: doc.item_no,
      sample_type: doc.sample_type ?? null,
      material_type: doc.material_type ?? null,
      condition: doc.condition ?? null,
      heat_no: doc.heat_no ?? null,
      description: doc.description ?? null,
      mtc_no: doc.mtc_no ?? null,
      storage_location: doc.storage_location ?? null,
      test_method_oids: Array.isArray(doc.test_method_oids) ? doc.test_method_oids.map(String) : [],
      is_active: doc.is_active ?? true,
      created_at: safeDate(doc.created_at) ?? new Date().toISOString(),
      updated_at: safeDate(doc.updated_at) ?? new Date().toISOString(),
      created_by: doc.created_by ? String(doc.created_by) : undefined,
      updated_by: doc.updated_by ? String(doc.updated_by) : undefined,
    }))

    const payload = { count, next: count > page * limit ? page + 1 : null, previous: page > 1 ? page - 1 : null, results: mapped }
    const validated = SampleLotListResponseSchema.parse(payload)
    return NextResponse.json(validated)
  } catch (error: any) {
    console.error("GET /api/sample-lots error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = await clientPromise
    const db = client.db("lims")
    const collection = db.collection("sample_lots")

    const body = await request.json()
    const normalized = {
      ...body,
      sample_type: body.sample_type === "" ? null : body.sample_type,
      material_type: body.material_type === "" ? null : body.material_type,
      condition: body.condition === "" ? null : body.condition,
      heat_no: body.heat_no === "" ? null : body.heat_no,
      description: body.description === "" ? null : body.description,
      mtc_no: body.mtc_no === "" ? null : body.mtc_no,
      storage_location: body.storage_location === "" ? null : body.storage_location,
      test_method_oids: Array.isArray(body.test_method_oids) ? body.test_method_oids.map(String) : [],
    }

    const validated = CreateSampleLotSchema.parse(normalized)

    // Look up the job ObjectId from the job_id string
    const jobsCollection = db.collection("jobs")
    const jobDoc = await jobsCollection.findOne({ job_id: validated.job_id })
    if (!jobDoc) {
      return NextResponse.json({ error: `Job not found: ${validated.job_id}` }, { status: 404 })
    }
    const jobObjectId = jobDoc._id

    // Generate sequential 3-digit item_no per job_id if not provided
    let itemNo = validated.item_no
    if (!itemNo) {
      const last = await collection.find({ job_id: jobObjectId }).sort({ item_no: -1 }).limit(1).toArray()
      let nextIndex = 1
      if (last.length > 0 && typeof last[0].item_no === 'string') {
        const parts = String(last[0].item_no).split('-')
        const tail = parts[parts.length - 1]
        const parsed = parseInt(tail, 10)
        if (!isNaN(parsed)) nextIndex = parsed + 1
      }
      itemNo = `${validated.job_id}-${String(nextIndex).padStart(3, '0')}`
    }

    const doc = {
      ...validated,
      job_id: jobObjectId, // Use the ObjectId instead of the string
      item_no: itemNo,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: session.user.id,
    }
    const result = await collection.insertOne(doc)

    // For the response, convert the job_id ObjectId back to string for the schema
    const responseDoc = {
      ...doc,
      id: result.insertedId.toString(),
      job_id: validated.job_id, // Use the original string job_id for the response
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    }
    
    const response = SampleLotResponseSchema.parse(responseDoc)
    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/sample-lots error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}


