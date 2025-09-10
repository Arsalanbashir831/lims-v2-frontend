import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateEquipmentSchema } from "@/lib/schemas/equipment"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('lab_equipments')

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
            { equipmentName: { $regex: q, $options: 'i' } },
            { equipmentSerial: { $regex: q, $options: 'i' } },
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

    const transformed = results.map(eq => ({
      id: eq._id.toString(),
      equipmentName: eq.equipmentName,
      equipmentSerial: eq.equipmentSerial,
      status: eq.status ?? null,
      remarks: eq.remarks ?? null,
      lastVerification: eq.lastVerification ?? null,
      verificationDue: eq.verificationDue ?? null,
      createdBy: eq.createdBy ?? null,
      updatedBy: eq.updatedBy ?? null,
      is_active: eq.is_active !== false,
      createdAt: (() => {
        if (!eq.createdAt) return new Date().toISOString()
        if (eq.createdAt instanceof Date) return eq.createdAt.toISOString()
        const date = new Date(eq.createdAt)
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
      })(),
      updatedAt: (() => {
        if (!eq.updatedAt) return undefined
        if (eq.updatedAt instanceof Date) return eq.updatedAt.toISOString()
        const date = new Date(eq.updatedAt)
        return isNaN(date.getTime()) ? undefined : date.toISOString()
      })(),
    }))

    return NextResponse.json({
      results: transformed,
      count,
      next: page * limit < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    })
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
    const collection = db.collection('lab_equipments')

    const body = await request.json()
    const normalized = {
      ...body,
      status: body.status === "" ? null : body.status,
      remarks: body.remarks === "" ? null : body.remarks,
      lastVerification: body.lastVerification === "" ? null : body.lastVerification,
      verificationDue: body.verificationDue === "" ? null : body.verificationDue,
      createdBy: body.createdBy === "" ? null : body.createdBy,
      updatedBy: body.updatedBy === "" ? null : body.updatedBy,
    }
    const data = CreateEquipmentSchema.parse(normalized)

    const now = new Date()
    const doc = {
      ...data,
      is_active: true,
      createdAt: now,
      updatedAt: now,
    }
    const result = await collection.insertOne(doc)
    return NextResponse.json({
      id: result.insertedId.toString(),
      ...doc,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


