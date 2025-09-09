import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateCalibrationTestingSchema } from "@/lib/schemas/calibration-testing"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('calibration_testing')

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
            { calibrationVendor: { $regex: q, $options: 'i' } },
            { calibrationCertification: { $regex: q, $options: 'i' } },
            { remarks: { $regex: q, $options: 'i' } },
          ]}
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
      equipmentName: item.equipmentName,
      equipmentSerial: item.equipmentSerial ?? null,
      calibrationVendor: item.calibrationVendor ?? null,
      calibrationDate: item.calibrationDate ?? null,
      calibrationDueDate: item.calibrationDueDate ?? null,
      calibrationCertification: item.calibrationCertification ?? null,
      remarks: item.remarks ?? null,
      createdBy: item.createdBy ?? null,
      updatedBy: item.updatedBy ?? null,
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
    const data = CreateCalibrationTestingSchema.parse(normalized)

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


