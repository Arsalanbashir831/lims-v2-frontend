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
        $unwind: {
          path: "$request_items",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'sample_lots',
          let: { requestId: "$request_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    // Match if request_id is already an ObjectId
                    { $eq: ["$_id", "$$requestId"] },
                    // Match if request_id is a string that needs to be converted
                    { $eq: [
                      "$_id", 
                      { $convert: { input: "$$requestId", to: "objectId", onError: null, onNull: null } }
                    ]}
                  ]
                }
              }
            }
          ],
          as: 'sampleLot'
        }
      },
      {
        $unwind: {
          path: "$sampleLot",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'sampleLot.job_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $unwind: {
          path: "$job",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'job.client_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          request_no: { $first: "$request_no" },
          request_items: { $push: "$request_items" },
          job_id: { $first: "$job.job_id" },
          project_name: { $first: "$job.project_name" },
          client_name: { $first: "$client.client_name" },
          is_active: { $first: "$is_active" },
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" }
        }
      },
    ]
    
    const result = await collection.aggregate(pipeline).toArray()
    const doc = result[0]
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const toValidDate = (v: any) => { 
      const d = v instanceof Date ? v : (v ? new Date(v) : undefined)
      return d && !isNaN(d.getTime()) ? d : undefined 
    }
    
    // Get request items from the document
    const requestItems = Array.isArray(doc.request_items) ? doc.request_items : []
    
    // Collect all specimen OIDs from all request items
    const allOids: string[] = requestItems.flatMap((item: any) => {
      if (Array.isArray(item.specimen_oids)) {
        return item.specimen_oids.map((oid: any) => String(oid))
      }
      return []
    })
    
    let oidToId = new Map<string, string>()
    if (allOids.length) {
      const specimensCol = db.collection('specimens')
      const validOids = allOids.filter((s) => ObjectId.isValid(s)).map((s) => new ObjectId(s))
      
      const specs = await specimensCol.find({ _id: { $in: validOids } }).project({ specimen_id: 1 }).toArray()
      
      oidToId = new Map(specs.map((s: any) => [String(s._id), String(s.specimen_id)]))
    }
    
    // Enrich each request item with specimen_ids
    const enrichedItems = requestItems.map((item: any) => {
      const specimenIds = Array.isArray(item.specimen_oids) 
        ? item.specimen_oids.map((oid: any) => oidToId.get(String(oid)) || null).filter(Boolean)
        : []
      
      return {
        ...item,
        specimen_ids: specimenIds
      }
    })

    // Collect all unique specimen IDs from all request items
    const allSpecimenIds = [...new Set(enrichedItems.flatMap((item: any) => item.specimen_ids || []))]

    return NextResponse.json({
      id: doc._id.toString(),
      request_no: doc.request_no,
      request_items: enrichedItems,
      specimen_ids: allSpecimenIds,
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
    
    // Handle specimen creation/conversion like in POST route
    const specimensCol = db.collection('specimens')
    await specimensCol.createIndex({ specimen_id: 1 }, { unique: true }).catch(() => {})

    const draft = { ...body }
    if (Array.isArray(draft.request_items)) {
      const allTokens: string[] = []
      draft.request_items.forEach((it: any) => {
        if (Array.isArray(it.specimen_ids)) {
          for (const t of it.specimen_ids) {
            const token = String(t || '').trim()
            if (token) allTokens.push(token)
          }
        }
      })

      // Check duplicates within payload
      const dupInPayload = allTokens.filter((v, i, a) => a.indexOf(v) !== i)
      if (dupInPayload.length) {
        return NextResponse.json({ error: 'Duplicate specimen IDs in payload', details: Array.from(new Set(dupInPayload)) }, { status: 400 })
      }

      if (allTokens.length) {
        const existing = await specimensCol.find({ specimen_id: { $in: allTokens } }).project({ specimen_id: 1 }).toArray()
        if (existing.length) {
          const taken = existing.map((d: any) => d.specimen_id)
          return NextResponse.json({ error: 'Specimen ID already exists', details: taken }, { status: 400 })
        }
        // Insert all new specimens
        const docs = allTokens.map(token => ({ specimen_id: token }))
        const ins = await specimensCol.insertMany(docs, { ordered: true })
        const idByToken = new Map<string, ObjectId>()
        let idx = 0
        for (const key of Object.keys(ins.insertedIds)) {
          idByToken.set(allTokens[idx], (ins.insertedIds as any)[key]) // Store as ObjectId, not string
          idx++
        }
        // Replace per item
        draft.request_items = draft.request_items.map((it: any) => {
          if (Array.isArray(it.specimen_ids)) {
            const specimen_oids = it.specimen_ids.map((t: string) => idByToken.get(String(t))!).filter(Boolean)
            const { specimen_ids, ...rest } = it
            return { ...rest, specimen_oids }
          }
          return it
        })
      }
    }
    
    const validatedData = UpdateSamplePreparationSchema.parse(draft)
    
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
