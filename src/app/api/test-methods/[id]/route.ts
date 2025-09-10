import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { UpdateTestMethodSchema } from "@/lib/schemas/test-method"
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('test_methods')

    const doc = await collection.findOne({
      _id: new ObjectId(id),
      $or: [{ is_active: true }, { is_active: { $exists: false } }]
    })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: doc._id.toString(),
      test_name: doc.test_name,
      test_description: doc.test_description ?? null,
      test_columns: doc.test_columns ?? [],
      hasImage: doc.hasImage === true,
      is_active: doc.is_active !== false,
      createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
      updatedAt: doc.updatedAt ? (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString() : undefined,
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
    const { id } = await params
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
    const data = UpdateTestMethodSchema.parse(normalized)

    const update = {
      ...data,
      updatedAt: new Date(),
    }

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const doc = await collection.findOne({ _id: new ObjectId(id) })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: doc._id.toString(),
      test_name: doc.test_name,
      test_description: doc.test_description ?? null,
      test_columns: doc.test_columns ?? [],
      hasImage: doc.hasImage === true,
      is_active: doc.is_active !== false,
      createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
      updatedAt: doc.updatedAt ? (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString() : undefined,
    })
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.name === 'ZodError') {
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
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('test_methods')

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_active: false, updatedAt: new Date() } }
    )
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


