import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('sample_preparations')

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    // Build search filter
    const searchFilter: any = {
      $or: [{ is_active: true }, { is_active: { $exists: false } }]
    }

    if (query.trim()) {
      searchFilter.$and = [
        {
          $or: [
            { request_no: { $regex: query, $options: 'i' } },
            { 'request_items.item_description': { $regex: query, $options: 'i' } },
            { 'request_items.request_by': { $regex: query, $options: 'i' } },
            { 'request_items.remarks': { $regex: query, $options: 'i' } },
          ]
        }
      ]
    }

    // Get total count
    const totalCount = await collection.countDocuments(searchFilter)

    // Use aggregation to join with sample_lots, jobs, clients, and specimens
    const pipeline = [
      { $match: searchFilter },
      {
        $lookup: {
          from: 'sample_lots',
          let: { requestIds: "$request_items.request_id" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $in: ["$_id", { $map: { input: "$$requestIds", as: "id", in: { $toObjectId: "$$id" } } }]
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
      { $addFields: { __original_items_count: { $size: "$request_items" } } },
      {
        $unwind: {
          path: "$request_items",
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
          localField: 'request_items.specimen_oids',
          foreignField: '_id',
          as: 'specimenDoc'
        }
      },
      {
        $group: {
          _id: "$_id",
          request_no: { $first: "$request_no" },
          request_items: { $push: "$request_items" },
          sampleLotData: { $first: "$sampleLotData" },
          specimen_ids: { $addToSet: { $arrayElemAt: ["$specimenDoc.specimen_id", 0] } },
          created_at: { $first: "$created_at" }
        }
      },
      {
        $addFields: {
          job_id: { $arrayElemAt: ["$sampleLotData.job_id", 0] },
          client_name: { $arrayElemAt: ["$sampleLotData.client_name", 0] },
          project_name: { $arrayElemAt: ["$sampleLotData.project_name", 0] },
          no_of_request_items: "$$REMOVE",
          specimen_ids: { $filter: { input: "$specimen_ids", cond: { $ne: ["$$this", null] } } }
        }
      },
      { $addFields: { no_of_request_items: "$__original_items_count" } },
      { $project: { 
        sampleLotData: 0, 
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
