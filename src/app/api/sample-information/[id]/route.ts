import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { UpdateSampleInformationSchema } from "@/lib/schemas/sample-information"
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
    const jobsCollection = db.collection('jobs')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    const baseFilter = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    
    // Use aggregation to join with clients collection
    const pipeline = [
      {
        $match: {
          ...(isObjectId ? { _id: new ObjectId(id) } : { job_id: id }),
          ...baseFilter
        }
      },
      {
        $addFields: {
          clientObjectId: {
            $convert: { input: "$client_id", to: "objectId", onError: null, onNull: null }
          }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientObjectId',
          foreignField: '_id',
          as: 'clientDoc'
        }
      },
      {
        $addFields: {
          client_name: { $ifNull: [ { $arrayElemAt: ["$clientDoc.client_name", 0] }, { $arrayElemAt: ["$clientDoc.name", 0] } ] }
        }
      },
      {
        $project: { clientDoc: 0, clientObjectId: 0 }
      }
    ]
    
    const result = await jobsCollection.aggregate(pipeline).toArray()
    const doc = result[0]
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const toValidDate = (v: any) => { const d = v instanceof Date ? v : (v ? new Date(v) : undefined); return d && !isNaN(d.getTime()) ? d : undefined }
    return NextResponse.json({
      id: doc._id.toString(),
      job_id: doc.job_id,
      client_id: String(doc.client_id),
      client_name: doc.client_name ?? "",
      end_user: doc.end_user ?? null,
      receive_date: doc.receive_date ?? null,
      received_by: doc.received_by ?? null,
      project_name: doc.project_name ?? null,
      remarks: doc.remarks ?? null,
      is_active: doc.is_active !== false,
      created_at: (toValidDate(doc.created_at) || new Date()).toISOString(),
      updated_at: toValidDate(doc.updated_at)?.toISOString(),
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
    const collection = db.collection('jobs')
    const body = await request.json()
    const normalized = {
      ...body,
      end_user: body.end_user === "" ? null : body.end_user,
      receive_date: body.receive_date === "" ? null : body.receive_date,
      received_by: body.received_by === "" ? null : body.received_by,
      project_name: body.project_name === "" ? null : body.project_name,
      remarks: body.remarks === "" ? null : body.remarks,
      client_id: String(body.client_id),
    }
    const data = UpdateSampleInformationSchema.parse(normalized)
    const update = { ...data, updated_at: new Date() }
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    const result = await collection.updateOne(
      isObjectId ? { _id: new ObjectId(id) } : { job_id: id },
      { $set: update }
    )
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const doc = await collection.findOne(isObjectId ? { _id: new ObjectId(id) } : { job_id: id })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const toValidDate = (v: any) => { const d = v instanceof Date ? v : (v ? new Date(v) : undefined); return d && !isNaN(d.getTime()) ? d : undefined }
    return NextResponse.json({
      id: doc._id.toString(),
      job_id: doc.job_id,
      client_id: String(doc.client_id),
      end_user: doc.end_user ?? null,
      receive_date: doc.receive_date ?? null,
      received_by: doc.received_by ?? null,
      project_name: doc.project_name ?? null,
      remarks: doc.remarks ?? null,
      is_active: doc.is_active !== false,
      created_at: (toValidDate(doc.created_at) || new Date()).toISOString(),
      updated_at: toValidDate(doc.updated_at)?.toISOString(),
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
    const collection = db.collection('jobs')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    const result = await collection.updateOne(
      isObjectId ? { _id: new ObjectId(id) } : { job_id: id },
      { $set: { is_active: false, updated_at: new Date() } }
    )
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


