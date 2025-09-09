import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { UpdateClientSchema } from "@/lib/schemas/client"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('clients')
    
    const clientDoc = await collection.findOne({ 
      _id: new ObjectId(params.id),
      $or: [ { is_active: true }, { is_active: { $exists: false } } ]
    })
    
    if (!clientDoc) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    const createdAtCandidate = clientDoc.created_at instanceof Date ? clientDoc.created_at : (clientDoc.created_at ? new Date(clientDoc.created_at) : undefined)
    const updatedAtCandidate = clientDoc.updated_at instanceof Date ? clientDoc.updated_at : (clientDoc.updated_at ? new Date(clientDoc.updated_at) : undefined)
    const isValid = (d?: Date) => !!d && !isNaN(d.getTime())
    const createdAt = isValid(createdAtCandidate) ? createdAtCandidate! : new Date()
    const updatedAt = isValid(updatedAtCandidate) ? updatedAtCandidate! : undefined
    return NextResponse.json({
      id: clientDoc._id.toString(),
      client_name: clientDoc.client_name ?? clientDoc.name,
      phone: clientDoc.phone ?? null,
      contact_person: clientDoc.contact_person ?? null,
      email: clientDoc.email ?? null,
      address: clientDoc.address ?? null,
      city: clientDoc.city ?? null,
      state: clientDoc.state ?? null,
      postal_code: clientDoc.postal_code ?? null,
      country: clientDoc.country ?? null,
      notes: clientDoc.notes ?? null,
      is_active: clientDoc.is_active !== false,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt ? updatedAt.toISOString() : undefined,
      created_by: clientDoc.created_by,
      updated_by: clientDoc.updated_by,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('clients')
    
    const body = await request.json()
    // Normalize optional fields: convert empty strings to null
    const normalized = {
      ...body,
      email: body.email === "" ? null : body.email,
      phone: body.phone === "" ? null : body.phone,
      contact_person: body.contact_person === "" ? null : body.contact_person,
      address: body.address === "" ? null : body.address,
      city: body.city === "" ? null : body.city,
      state: body.state === "" ? null : body.state,
      postal_code: body.postal_code === "" ? null : body.postal_code,
      country: body.country === "" ? null : body.country,
      notes: body.notes === "" ? null : body.notes,
    }
    const validatedData = UpdateClientSchema.parse(normalized)
    
    const updateData = {
      ...validatedData,
      updated_at: new Date(),
      updated_by: session.user.id,
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    // Return the updated client
    const updatedClient = await collection.findOne({ _id: new ObjectId(params.id) })

    if (!updatedClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: updatedClient._id.toString(),
      client_name: updatedClient.client_name,
      phone: updatedClient.phone,
      contact_person: updatedClient.contact_person,
      email: updatedClient.email,
      address: updatedClient.address,
      city: updatedClient.city,
      state: updatedClient.state,
      postal_code: updatedClient.postal_code,
      country: updatedClient.country,
      notes: updatedClient.notes,
      is_active: updatedClient.is_active,
      created_at: updatedClient.created_at.toISOString(),
      updated_at: updatedClient.updated_at?.toISOString(),
      created_by: updatedClient.created_by,
      updated_by: updatedClient.updated_by,
    })
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('clients')
    
    // Soft delete by setting is_active to false
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          is_active: false,
          updated_at: new Date(),
          updated_by: session.user.id,
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
