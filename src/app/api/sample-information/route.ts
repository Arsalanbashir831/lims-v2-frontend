import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateSampleInformationSchema } from "@/lib/schemas/sample-information"

function pad4(n: number) { return String(n).padStart(4, '0') }

async function generateJobId(db: any) {
  const year = new Date().getFullYear()
  const counters = db.collection('counters')
  const key = `job_id_${year}`
  const res = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  )
  let seq = (res.value && typeof res.value.seq === 'number') ? res.value.seq : 1
  // Align counter with existing max for the year if needed
  const jobsCol = db.collection('jobs')
  const latest = await jobsCol.find({ job_id: { $regex: `^MTL-${year}-` } })
    .project({ job_id: 1 })
    .sort({ job_id: -1 })
    .limit(1)
    .toArray()
  if (latest.length) {
    const match = latest[0].job_id.match(/^(?:MTL-\d{4}-)(\d+)$/)
    const lastNum = match ? parseInt(match[1], 10) : 0
    if (lastNum >= seq) {
      seq = lastNum + 1
      await counters.updateOne({ _id: key }, { $set: { seq } })
    }
  }
  return `MTL-${year}-${pad4(seq)}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('jobs')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const q = searchParams.get('q') || ''
    const limit = 20
    const skip = (page - 1) * limit
    const baseFilter: any = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    let query: any = baseFilter
    if (q) {
      query = { $and: [ baseFilter, { $or: [
        { job_id: { $regex: q, $options: 'i' } },
        { project_name: { $regex: q, $options: 'i' } },
        { received_by: { $regex: q, $options: 'i' } },
        { end_user: { $regex: q, $options: 'i' } },
      ] } ] }
    }
    const [aggResults, count] = await Promise.all([
      collection.aggregate([
        { $match: query },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $addFields: {
            clientObjectId: {
              $convert: { input: "$client_id", to: "objectId", onError: null, onNull: null }
            }
        }},
        { $lookup: {
            from: 'clients',
            localField: 'clientObjectId',
            foreignField: '_id',
            as: 'clientDoc'
        }},
        { $addFields: {
            client_name: { $ifNull: [ { $arrayElemAt: ["$clientDoc.client_name", 0] }, { $arrayElemAt: ["$clientDoc.name", 0] } ] }
        }},
        { $lookup: {
            from: 'sample_lots',
            let: { jobId: "$job_id", jobObjectId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$job_id", "$$jobId"] },
                      { $eq: ["$job_id", "$$jobObjectId"] }
                    ]
                  },
                  $or: [
                    { is_active: true },
                    { is_active: { $exists: false } }
                  ]
                }
              }
            ],
            as: 'sampleLots'
        }},
        { $addFields: {
            sample_count: { $size: "$sampleLots" }
        }},
        { $project: { clientDoc: 0, clientObjectId: 0, sampleLots: 0 } }
      ]).toArray(),
      collection.countDocuments(query)
    ])
    const toValidDate = (v: any) => { const d = v instanceof Date ? v : (v ? new Date(v) : undefined); return d && !isNaN(d.getTime()) ? d : undefined }
    const transformed = aggResults.map((item: any) => ({
      id: item._id.toString(),
      job_id: item.job_id,
      client_id: String(item.client_id),
      client_name: item.client_name ?? "",
      end_user: item.end_user ?? null,
      receive_date: item.receive_date ?? null,
      received_by: item.received_by ?? null,
      project_name: item.project_name ?? null,
      remarks: item.remarks ?? null,
      sample_count: item.sample_count ?? 0,
      is_active: item.is_active !== false,
      created_at: (toValidDate(item.created_at) || new Date()).toISOString(),
      updated_at: toValidDate(item.updated_at)?.toISOString(),
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
    const collection = db.collection('jobs')
    // Ensure unique job_id index
    await collection.createIndex({ job_id: 1 }, { unique: true }).catch(() => {})
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
    const data = CreateSampleInformationSchema.parse(normalized)
    const now = new Date()
    // Retry up to 10 times on duplicate key (job_id)
    for (let attempt = 0; attempt < 10; attempt++) {
      const job_id = await generateJobId(db)
      const doc = { ...data, job_id, is_active: true, created_at: now, updated_at: now }
      try {
        const result = await collection.insertOne(doc)
        return NextResponse.json({ id: result.insertedId.toString(), ...doc, created_at: doc.created_at.toISOString(), updated_at: doc.updated_at.toISOString() }, { status: 201 })
      } catch (e: any) {
        if (e?.code === 11000) {
          // Duplicate job_id, try next sequence
          continue
        }
        throw e
      }
    }
    return NextResponse.json({ error: 'Failed to generate unique job_id' }, { status: 500 })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


