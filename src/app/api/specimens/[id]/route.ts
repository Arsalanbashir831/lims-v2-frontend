import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { ObjectId } from 'mongodb'
import { UpdateSpecimenSchema } from "@/lib/schemas/sample-preparation"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('specimens')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    
    const doc = await collection.findOne({ 
      ...(isObjectId ? { _id: new ObjectId(id) } : { specimen_id: id })
    })
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const toValidDate = (v: any) => { 
      const d = v instanceof Date ? v : (v ? new Date(v) : undefined)
      return d && !isNaN(d.getTime()) ? d : undefined 
    }
    
    return NextResponse.json({
      id: doc._id.toString(),
      specimen_id: doc.specimen_id,
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
    const collection = db.collection('specimens')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    
    const body = await request.json()
    const validatedData = UpdateSpecimenSchema.parse(body)
    
    const doc = await collection.findOne({ 
      ...(isObjectId ? { _id: new ObjectId(id) } : { specimen_id: id })
    })
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Check if new specimen_id already exists (excluding current specimen)
    if (validatedData.specimen_id !== doc.specimen_id) {
      const existingSpecimen = await collection.findOne({ 
        specimen_id: validatedData.specimen_id,
        _id: { $ne: doc._id }
      })
      
      if (existingSpecimen) {
        return NextResponse.json({ 
          error: 'Specimen ID already exists',
          details: `Specimen ID "${validatedData.specimen_id}" is already in use`
        }, { status: 400 })
      }
    }
    
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
      specimen_id: updatedDoc!.specimen_id,
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
    const collection = db.collection('specimens')
    const { id } = await params
    const isObjectId = ObjectId.isValid(id)
    
    const doc = await collection.findOne({ 
      ...(isObjectId ? { _id: new ObjectId(id) } : { specimen_id: id })
    })
    
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Hard delete (permanent deletion)
    await collection.deleteOne({ _id: doc._id })
    
    return NextResponse.json({ message: 'Specimen deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
