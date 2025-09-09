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
    const collection = db.collection('proficiency_testing')

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
            { description: { $regex: q, $options: 'i' } },
            { provider1: { $regex: q, $options: 'i' } },
            { provider2: { $regex: q, $options: 'i' } },
            { status: { $regex: q, $options: 'i' } },
            { remarks: { $regex: q, $options: 'i' } },
          ] }
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
      description: item.description,
      provider1: item.provider1 ?? null,
      provider2: item.provider2 ?? null,
      lastTestDate: item.lastTestDate ?? null,
      nextScheduledDate: item.nextScheduledDate ?? null,
      dueDate: item.dueDate ?? null,
      status: item.status ?? null,
      remarks: item.remarks ?? null,
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


