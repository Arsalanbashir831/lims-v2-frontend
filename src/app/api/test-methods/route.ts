import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateTestMethodSchema } from "@/lib/schemas/test-method"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('test_methods')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('q') || ''
    const limit = 20
    const skip = (page - 1) * limit

    const baseFilter: any = { $or: [{ is_active: true }, { is_active: { $exists: false } }] }
    let query: any = baseFilter
    if (search) {
      query = {
        $and: [
          baseFilter,
          { $or: [
            { test_name: { $regex: search, $options: 'i' } },
            { test_description: { $regex: search, $options: 'i' } },
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
      test_columns: Array.isArray(tm.test_columns) ? tm.test_columns : (typeof tm.test_columns === 'string' ? tm.test_columns.split(',').map(col => col.trim()).filter(col => col) : []),
      hasImage: tm.hasImage === true,
      is_active: tm.is_active !== false,
      createdAt: (() => {
        if (!tm.createdAt) return new Date().toISOString()
        if (tm.createdAt instanceof Date) return tm.createdAt.toISOString()
        const date = new Date(tm.createdAt)
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
      })(),
      updatedAt: (() => {
        if (!tm.updatedAt) return undefined
        if (tm.updatedAt instanceof Date) return tm.updatedAt.toISOString()
        const date = new Date(tm.updatedAt)
        return isNaN(date.getTime()) ? undefined : date.toISOString()
      })(),
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('test_methods')

    const body = await request.json()
    const normalized = {
      ...body,
      test_description: body.test_description === "" ? null : body.test_description,
    }
    const data = CreateTestMethodSchema.parse(normalized)

    const now = new Date()
    const doc = {
      ...data,
      is_active: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(doc)
    return NextResponse.json({
      id: result.insertedId.toString(),
      ...doc,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


