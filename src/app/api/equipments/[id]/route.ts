import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { UpdateEquipmentSchema } from "@/lib/schemas/equipment"
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('lab_equipments')

    const { id } = await params
    const doc = await collection.findOne({ _id: new ObjectId(id), $or: [{ is_active: true }, { is_active: { $exists: false } }] })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: doc._id.toString(),
      equipmentName: doc.equipmentName,
      equipmentSerial: doc.equipmentSerial,
      status: doc.status ?? null,
      remarks: doc.remarks ?? null,
      lastVerification: doc.lastVerification ?? null,
      verificationDue: doc.verificationDue ?? null,
      createdBy: doc.createdBy ?? null,
      updatedBy: doc.updatedBy ?? null,
      is_active: doc.is_active !== false,
      createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
      updatedAt: doc.updatedAt ? (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString() : undefined,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const data = UpdateEquipmentSchema.parse(normalized)

    const update = { ...data, updatedAt: new Date() }
    const { id } = await params
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const doc = await collection.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: doc._id.toString(),
      equipmentName: doc.equipmentName,
      equipmentSerial: doc.equipmentSerial,
      status: doc.status ?? null,
      remarks: doc.remarks ?? null,
      lastVerification: doc.lastVerification ?? null,
      verificationDue: doc.verificationDue ?? null,
      createdBy: doc.createdBy ?? null,
      updatedBy: doc.updatedBy ?? null,
      is_active: doc.is_active !== false,
      createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
      updatedAt: doc.updatedAt ? (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString() : undefined,
    })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('lab_equipments')

    const { id } = await params
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { is_active: false, updatedAt: new Date() } })
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


