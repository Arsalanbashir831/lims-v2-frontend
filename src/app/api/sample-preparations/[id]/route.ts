import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { ObjectId } from 'mongodb'
import { UpdateSamplePreparationSchema } from "@/lib/schemas/sample-preparation"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('sample_preparations')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    const baseFilter = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    
    // Use aggregation to join with sample_lots and jobs for additional data
    const pipeline = [
      {
        $match: {
          ...(isObjectId ? { _id: new ObjectId(id) } : { request_no: id }),
          ...baseFilter
        }
      },
      {
        $lookup: {
          from: 'sample_lots',
          let: { requestIds: "$sample_lots.request_id" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $in: [
                    "$_id",
                    { $map: { input: { $ifNull: ["$$requestIds", []] }, as: "id", in: { $toObjectId: "$$id" } } }
                  ]
                },
                $or: [{ is_active: true }, { is_active: { $exists: false } }]
              }
            },
            {
              $lookup: {
                from: 'jobs',
                let: { jobIdVal: "$job_id" },
                pipeline: [
                  { $match: { $expr: { $or: [
                    { $eq: [
                      "$_id",
                      { $cond: [
                        { $eq: [ { $type: "$$jobIdVal" }, "objectId" ] },
                        "$$jobIdVal",
                        { $convert: { input: "$$jobIdVal", to: "objectId", onError: null, onNull: null } }
                      ] }
                    ] },
                    { $eq: ["$job_id", "$$jobIdVal"] }
                  ] } } }
                ],
                as: 'jobDoc'
              }
            },
            {
              $lookup: {
                from: 'clients',
                localField: 'jobDoc.client_id',
                foreignField: '_id',
                as: 'clientDoc'
              }
            },
            {
              $addFields: {
                job_id: { $arrayElemAt: ["$jobDoc.job_id", 0] },
                project_name: { $arrayElemAt: ["$jobDoc.project_name", 0] },
                client_name: { $arrayElemAt: ["$clientDoc.client_name", 0] }
              }
            }
          ],
          as: 'sampleLotData'
        }
      },
      {
        $addFields: {
          job_id: { $arrayElemAt: ["$sampleLotData.job_id", 0] },
          client_name: { $arrayElemAt: ["$sampleLotData.client_name", 0] },
          project_name: { $arrayElemAt: ["$sampleLotData.project_name", 0] }
        }
      },
      { $project: { sampleLotData: 0 } }
    ]
    
    const result = await collection.aggregate(pipeline).toArray()
    const doc = result[0]
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const toValidDate = (v: any) => { 
      const d = v instanceof Date ? v : (v ? new Date(v) : undefined)
      return d && !isNaN(d.getTime()) ? d : undefined 
    }
    
    // Enrich each request_item/sample_lot with specimen_ids resolved from specimen_oids
    const items = Array.isArray(doc.request_items) ? doc.request_items : (Array.isArray(doc.sample_lots) ? doc.sample_lots : [])
    const allOids: string[] = items.flatMap((it: any) => Array.isArray(it.specimen_oids) ? it.specimen_oids.map((x: any) => String(x)) : [])
    let oidToId = new Map<string, string>()
    if (allOids.length) {
      const specimensCol = db.collection('specimens')
      const specs = await specimensCol.find({ _id: { $in: allOids.filter((s) => ObjectId.isValid(s)).map((s) => new ObjectId(s)) } }).project({ specimen_id: 1 }).toArray()
      oidToId = new Map(specs.map((s: any) => [String(s._id), String(s.specimen_id)]))
    }
    const enrichedItems = items.map((it: any) => ({
      ...it,
      specimen_ids: Array.isArray(it.specimen_oids) ? it.specimen_oids.map((x: any) => oidToId.get(String(x)) || null).filter(Boolean) : []
    }))

    return NextResponse.json({
      id: doc._id.toString(),
      request_no: doc.request_no,
      request_items: enrichedItems,
      job_id: doc.job_id || "",
      client_name: doc.client_name || "",
      project_name: doc.project_name || "",
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
    const collection = db.collection('sample_preparations')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    const baseFilter = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    
    const body = await request.json()
    const validatedData = UpdateSamplePreparationSchema.parse(body)
    
    const doc = await collection.findOne({ 
      ...(isObjectId ? { _id: new ObjectId(id) } : { request_no: id }), 
      ...baseFilter 
    })
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const updateDoc = {
      ...validatedData,
      updated_at: new Date(),
    }
    
    await collection.updateOne(
      { _id: doc._id },
      { $set: updateDoc }
    )
    
    const updatedDoc = await collection.findOne({ _id: doc._id })
    
    const toValidDate = (v: any) => { 
      const d = v instanceof Date ? v : (v ? new Date(v) : undefined)
      return d && !isNaN(d.getTime()) ? d : undefined 
    }
    
    return NextResponse.json({
      id: updatedDoc!._id.toString(),
      request_no: updatedDoc!.request_no,
      request_items: updatedDoc!.request_items || [],
      is_active: updatedDoc!.is_active !== false,
      created_at: (toValidDate(updatedDoc!.created_at) || new Date()).toISOString(),
      updated_at: toValidDate(updatedDoc!.updated_at)?.toISOString(),
    })
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
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
    const collection = db.collection('sample_preparations')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    const baseFilter = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    
    const doc = await collection.findOne({ 
      ...(isObjectId ? { _id: new ObjectId(id) } : { request_no: id }), 
      ...baseFilter 
    })
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Soft delete
    await collection.updateOne(
      { _id: doc._id },
      { $set: { is_active: false, updated_at: new Date() } }
    )
    
    return NextResponse.json({ message: 'Sample preparation deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
