import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"

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
    const results = aggResults.map((item: any) => ({
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

    return NextResponse.json({ results, count, next: page * limit < count ? page + 1 : null, previous: page > 1 ? page - 1 : null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


