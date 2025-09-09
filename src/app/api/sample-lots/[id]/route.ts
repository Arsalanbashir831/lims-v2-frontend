import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/auth/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { ObjectId } from "mongodb"
import { UpdateSampleLotSchema, SampleLotResponseSchema } from "@/lib/schemas/sample-lot"

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
    const collection = db.collection("sample_lots")

    const doc = await collection.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const mapped = {
      id: doc._id.toString(),
      job_id: doc.job_id,
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
    }

    const validated = SampleLotResponseSchema.parse(mapped)
    return NextResponse.json(validated)
  } catch (error: any) {
    console.error("GET /api/sample-lots/[id] error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
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
      test_method_oids: Array.isArray(body.test_method_oids) ? body.test_method_oids.map(String) : undefined,
    }
    const validated = UpdateSampleLotSchema.parse(normalized)

    const updateDoc = { ...validated, updated_at: new Date(), updated_by: session.user.id }
    // Support updating by either Mongo _id (24 hex) or UUID-like client id -> fallback to item_no if provided
    let filter: any
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      filter = { _id: new ObjectId(id) }
    } else {
      // If not a valid ObjectId, attempt not to update; return error
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const result = await collection.updateOne(filter, { $set: updateDoc })
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await collection.findOne(filter)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const mapped = {
      id: updated._id.toString(),
      job_id: updated.job_id,
      item_no: updated.item_no,
      sample_type: updated.sample_type ?? null,
      material_type: updated.material_type ?? null,
      condition: updated.condition ?? null,
      heat_no: updated.heat_no ?? null,
      description: updated.description ?? null,
      mtc_no: updated.mtc_no ?? null,
      storage_location: updated.storage_location ?? null,
      test_method_oids: Array.isArray(updated.test_method_oids) ? updated.test_method_oids.map(String) : [],
      is_active: updated.is_active ?? true,
      created_at: safeDate(updated.created_at) ?? new Date().toISOString(),
      updated_at: safeDate(updated.updated_at) ?? new Date().toISOString(),
      created_by: updated.created_by ? String(updated.created_by) : undefined,
      updated_by: updated.updated_by ? String(updated.updated_by) : undefined,
    }
    const validatedOut = SampleLotResponseSchema.parse(mapped)
    return NextResponse.json(validatedOut)
  } catch (error: any) {
    console.error("PATCH /api/sample-lots/[id] error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const client = await clientPromise
    const db = client.db("lims")
    const collection = db.collection("sample_lots")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE /api/sample-lots/[id] error", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}


