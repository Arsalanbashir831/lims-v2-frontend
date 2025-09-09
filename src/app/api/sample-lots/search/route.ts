import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/auth/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { SampleLotListResponseSchema } from "@/lib/schemas/sample-lot"

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
    const query = (searchParams.get("q") || "").trim()
    const limit = 20
    const skip = (page - 1) * limit

    const baseFilter: any = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }

    let filter: any = baseFilter
    if (query) {
      filter = {
        $and: [
          baseFilter,
          {
            $or: [
              { item_no: { $regex: query, $options: "i" } },
              { job_id: { $regex: query, $options: "i" } },
              { sample_type: { $regex: query, $options: "i" } },
              { material_type: { $regex: query, $options: "i" } },
              { condition: { $regex: query, $options: "i" } },
              { heat_no: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { storage_location: { $regex: query, $options: "i" } },
            ],
          },
        ],
      }
    }

    const cursor = collection.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit)
    const [results, count] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)])

    const mapped = results.map((doc: any) => ({
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
    console.error("GET /api/sample-lots/search error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}


