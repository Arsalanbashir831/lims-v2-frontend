import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { UpdateCalibrationTestingSchema } from "@/lib/schemas/calibration-testing"
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
    const collection = db.collection('calibration_testing')
    const { id } = await params
    const doc = await collection.findOne({ _id: new ObjectId(id), $or: [{ is_active: true }, { is_active: { $exists: false } }] })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const toValidDate = (v: any) => { const d = v instanceof Date ? v : (v ? new Date(v) : undefined); return d && !isNaN(d.getTime()) ? d : undefined }
    return NextResponse.json({
      id: doc._id.toString(),
      equipmentName: doc.equipmentName,
      equipmentSerial: doc.equipmentSerial ?? null,
      calibrationVendor: doc.calibrationVendor ?? null,
      calibrationDate: doc.calibrationDate ?? null,
      calibrationDueDate: doc.calibrationDueDate ?? null,
      calibrationCertification: doc.calibrationCertification ?? null,
      remarks: doc.remarks ?? null,
      createdBy: doc.createdBy ?? null,
      updatedBy: doc.updatedBy ?? null,
      is_active: doc.is_active !== false,
      createdAt: (toValidDate(doc.createdAt) || new Date()).toISOString(),
      updatedAt: toValidDate(doc.updatedAt)?.toISOString(),
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
    const collection = db.collection('calibration_testing')
    const body = await request.json()
    const normalized = {
      ...body,
      equipmentSerial: body.equipmentSerial === "" ? null : body.equipmentSerial,
      calibrationVendor: body.calibrationVendor === "" ? null : body.calibrationVendor,
      calibrationDate: body.calibrationDate === "" ? null : body.calibrationDate,
      calibrationDueDate: body.calibrationDueDate === "" ? null : body.calibrationDueDate,
      calibrationCertification: body.calibrationCertification === "" ? null : body.calibrationCertification,
      remarks: body.remarks === "" ? null : body.remarks,
      createdBy: body.createdBy === "" ? null : body.createdBy,
      updatedBy: body.updatedBy === "" ? null : body.updatedBy,
    }
    const data = UpdateCalibrationTestingSchema.parse(normalized)
    const update = { ...data, updatedAt: new Date() }
    const { id } = await params
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const doc = await collection.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const toValidDate = (v: any) => { const d = v instanceof Date ? v : (v ? new Date(v) : undefined); return d && !isNaN(d.getTime()) ? d : undefined }
    return NextResponse.json({
      id: doc._id.toString(),
      equipmentName: doc.equipmentName,
      equipmentSerial: doc.equipmentSerial ?? null,
      calibrationVendor: doc.calibrationVendor ?? null,
      calibrationDate: doc.calibrationDate ?? null,
      calibrationDueDate: doc.calibrationDueDate ?? null,
      calibrationCertification: doc.calibrationCertification ?? null,
      remarks: doc.remarks ?? null,
      createdBy: doc.createdBy ?? null,
      updatedBy: doc.updatedBy ?? null,
      is_active: doc.is_active !== false,
      createdAt: (toValidDate(doc.createdAt) || new Date()).toISOString(),
      updatedAt: toValidDate(doc.updatedAt)?.toISOString(),
    })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
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
    const collection = db.collection('calibration_testing')
    const { id } = await params
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { is_active: false, updatedAt: new Date() } })
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


