import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { ObjectId } from 'mongodb'
import { CreateSamplePreparationSchema, SamplePreparationListResponseSchema } from "@/lib/schemas/sample-preparation"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('sample_preparations')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    // Build filter
    const filter: any = {
      $or: [{ is_active: true }, { is_active: { $exists: false } }]
    }

    // Get total count
    const totalCount = await collection.countDocuments(filter)


    // Use aggregation to join with sample_lots, jobs, clients, and specimens
    const pipeline = [
      { $match: filter },
      { $addFields: { __original_items_count: { $size: "$request_items" } } },
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
        $unwind: {
          path: "$request_items.specimen_oids",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'specimens',
          let: { specimenOid: "$request_items.specimen_oids" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    // Match if specimen_oid is already an ObjectId
                    { $eq: ["$_id", "$$specimenOid"] },
                    // Match if specimen_oid is a string that needs to be converted
                    { $eq: ["$_id", { $convert: { input: "$$specimenOid", to: "objectId", onError: null, onNull: null } }] }
                  ]
                }
              }
            }
          ],
          as: 'specimenDoc'
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
          specimen_ids: { $addToSet: { $arrayElemAt: ["$specimenDoc.specimen_id", 0] } },
          created_at: { $first: "$created_at" },
          __original_items_count: { $first: "$__original_items_count" }
        }
      },
      {
        $addFields: {
          specimen_ids: { $filter: { input: "$specimen_ids", cond: { $ne: ["$$this", null] } } },
          no_of_request_items: "$__original_items_count"
        }
      },
      { $project: { 
        request_items: 0,
        __original_items_count: 0,
        is_active: 0,
        updated_at: 0
      }},
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: pageSize }
    ]

    const results = await collection.aggregate(pipeline).toArray()

    // Transform results
    const transformedResults = results.map(item => ({
      id: item._id.toString(),
      job_id: item.job_id || "",
      project_name: item.project_name || "",
      client_name: item.client_name || "",
      request_no: item.request_no,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      no_of_request_items: item.no_of_request_items || 0,
      specimen_ids: item.specimen_ids || [],
    }))

    const hasNext = skip + pageSize < totalCount
    const hasPrevious = page > 1

    const response = {
      count: totalCount,
      next: hasNext ? page + 1 : null,
      previous: hasPrevious ? page - 1 : null,
      results: transformedResults,
    }

    return NextResponse.json(response)
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
    const collection = db.collection('sample_preparations')

    const body = await request.json()

    // Inline specimen handling: accept specimen_ids, create missing specimens, and replace with specimen_oids
    const specimensCol = db.collection('specimens')
    // Ensure unique index on specimen_id
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
        // Insert all
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

    const validatedData = CreateSamplePreparationSchema.parse(draft)

    // Convert request_id to ObjectId for storage
    const requestObjectId = new ObjectId(validatedData.request_id)

    // Generate request_no if not provided using counters (year-scoped)
    if (!validatedData.request_no) {
      const currentYear = new Date().getFullYear()
      const counters = db.collection('counters')
      const key = `request_no_${currentYear}`
      const res = await counters.findOneAndUpdate(
        { _id: key } as any,
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      )
      const nextVal = res && res.value && typeof (res.value as any).seq === 'number' ? (res.value as any).seq : 1
      let seq = nextVal
      // Align with existing max if needed
      const latest = await collection.find({ request_no: { $regex: `^REQ-${currentYear}-` } })
        .project({ request_no: 1 })
        .sort({ request_no: -1 })
        .limit(1)
        .toArray()
      if (latest.length) {
        const match = latest[0].request_no.match(/^(?:REQ-\d{4}-)(\d+)$/)
        const lastNum = match ? parseInt(match[1], 10) : 0
        if (lastNum >= seq) {
          seq = lastNum + 1
          await counters.updateOne({ _id: key } as any, { $set: { seq } })
        }
      }
      validatedData.request_no = `REQ-${currentYear}-${String(seq).padStart(3, '0')}`
    }

    const doc = {
      ...validatedData,
      request_id: requestObjectId, // Store as ObjectId
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
    }

    const result = await collection.insertOne(doc)

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...validatedData, // This still has the original string request_id for response consistency
      is_active: true,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    })
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
