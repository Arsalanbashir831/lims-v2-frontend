import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateProficiencyTestingSchema } from "@/lib/schemas/proficiency-testing"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('proficiency_testing')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const q = searchParams.get('q') || ''
    const limit = 20
    const skip = (page - 1) * limit

    const baseFilter: any = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    let query: any = baseFilter
    if (q) {
      query = {
        $and: [
          baseFilter,
          { $or: [
            { description: { $regex: q, $options: 'i' } },
            { provider1: { $regex: q, $options: 'i' } },
            { provider2: { $regex: q, $options: 'i' } },
            { status: { $regex: q, $options: 'i' } },
            { remarks: { $regex: q, $options: 'i' } },
          ] }
        ]
      }
    }

    const [results, count] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query)
    ])

    const toValidDate = (v: any) => { const d = v instanceof Date ? v : (v ? new Date(v) : undefined); return d && !isNaN(d.getTime()) ? d : undefined }

    const transformed = results.map(item => ({
      id: item._id.toString(),
      description: item.description,
      provider1: item.provider1 ?? null,
      provider2: item.provider2 ?? null,
      lastTestDate: item.lastTestDate ?? null,
      nextScheduledDate: item.nextScheduledDate ?? null,
      dueDate: item.dueDate ?? null,
      status: item.status ?? null,
      remarks: item.remarks ?? null,
      is_active: item.is_active !== false,
      createdAt: (toValidDate(item.createdAt) || new Date()).toISOString(),
      updatedAt: toValidDate(item.updatedAt)?.toISOString(),
    }))

    return NextResponse.json({ results: transformed, count, next: page * limit < count ? page + 1 : null, previous: page > 1 ? page - 1 : null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('proficiency_testing')

    const body = await request.json()
    const normalized = {
      ...body,
      provider1: body.provider1 === "" ? null : body.provider1,
      provider2: body.provider2 === "" ? null : body.provider2,
      lastTestDate: body.lastTestDate === "" ? null : body.lastTestDate,
      nextScheduledDate: body.nextScheduledDate === "" ? null : body.nextScheduledDate,
      dueDate: body.dueDate === "" ? null : body.dueDate,
      status: body.status === "" ? null : body.status,
      remarks: body.remarks === "" ? null : body.remarks,
    }
    const data = CreateProficiencyTestingSchema.parse(normalized)

    const now = new Date()
    const doc = { ...data, is_active: true, createdAt: now, updatedAt: now }
    const result = await collection.insertOne(doc)
    return NextResponse.json({ id: result.insertedId.toString(), ...doc, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


