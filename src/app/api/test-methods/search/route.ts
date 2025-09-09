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
    const collection = db.collection('test_methods')

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
            { test_name: { $regex: q, $options: 'i' } },
            { test_description: { $regex: q, $options: 'i' } },
          ]}
        ]
      }
    }

    const [results, count] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query)
    ])

    const transformed = results.map(tm => ({
      id: tm._id.toString(),
      test_name: tm.test_name,
      test_description: tm.test_description ?? null,
      test_columns: tm.test_columns ?? [],
      hasImage: tm.hasImage === true,
      is_active: tm.is_active !== false,
      createdAt: (tm.createdAt instanceof Date ? tm.createdAt : new Date(tm.createdAt)).toISOString(),
      updatedAt: tm.updatedAt ? (tm.updatedAt instanceof Date ? tm.updatedAt : new Date(tm.updatedAt)).toISOString() : undefined,
    }))

    return NextResponse.json({
      results: transformed,
      count,
      next: page * limit < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


