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
    const jobId = searchParams.get('jobId') || ''
    const clientName = searchParams.get('clientName') || ''
    const projectName = searchParams.get('projectName') || ''
    const specimenId = searchParams.get('specimenId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    // Build search filter
    const searchFilter: any = {
      $or: [{ is_active: true }, { is_active: { $exists: false } }]
    }

    // Build search conditions
    const searchConditions: any[] = []

    // General text search
    if (query.trim()) {
      searchConditions.push({
        $or: [
          { request_no: { $regex: query, $options: 'i' } },
          { 'request_items.item_description': { $regex: query, $options: 'i' } },
          { 'request_items.request_by': { $regex: query, $options: 'i' } },
          { 'request_items.remarks': { $regex: query, $options: 'i' } }
        ]
      })
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter: any = {}
      if (dateFrom) {
        dateFilter.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999) // End of day
        dateFilter.$lte = endDate
      }
      searchConditions.push({ created_at: dateFilter })
    }

    // Specimen ID filter
    if (specimenId.trim()) {
      searchConditions.push({
        'request_items.specimen_oids': { $exists: true }
      })
    }

    // Apply search conditions
    if (searchConditions.length > 0) {
      searchFilter.$and = [
        { $or: [{ is_active: true }, { is_active: { $exists: false } }] },
        ...searchConditions
      ]
    }

    // Get total count
    const totalCount = await collection.countDocuments(searchFilter)

    // Use aggregation to join with sample_lots, jobs, clients, and specimens
    const pipeline = [
      { $match: searchFilter },
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
          localField: 'request_id',
          foreignField: '_id',
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

    // Apply post-aggregation filters for joined fields
    let filteredResults = results

    // Filter by job ID
    if (jobId.trim()) {
      filteredResults = filteredResults.filter(item => 
        item.job_id && item.job_id.toLowerCase().includes(jobId.toLowerCase())
      )
    }

    // Filter by client name
    if (clientName.trim()) {
      filteredResults = filteredResults.filter(item => 
        item.client_name && item.client_name.toLowerCase().includes(clientName.toLowerCase())
      )
    }

    // Filter by project name
    if (projectName.trim()) {
      filteredResults = filteredResults.filter(item => 
        item.project_name && item.project_name.toLowerCase().includes(projectName.toLowerCase())
      )
    }

    // Filter by specimen ID
    if (specimenId.trim()) {
      filteredResults = filteredResults.filter(item => 
        item.specimen_ids && item.specimen_ids.some((id: string) => 
          id.toLowerCase().includes(specimenId.toLowerCase())
        )
      )
    }

    // Transform results
    const transformedResults = filteredResults.map(item => ({
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
