import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateClientSchema } from "@/lib/schemas/client"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('clients')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('q') || ''
    const limit = 20
    const skip = (page - 1) * limit
    
    // Build query (tolerant of missing is_active)
    const baseFilter: any = { $or: [ { is_active: true }, { is_active: { $exists: false } } ] }
    let query: any = baseFilter
    
    if (search) {
      query = {
        $and: [
          baseFilter,
          {
            $or: [
              { client_name: { $regex: search, $options: 'i' } },
              { name: { $regex: search, $options: 'i' } },
              { contact_person: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { city: { $regex: search, $options: 'i' } },
            ]
          }
        ]
      }
    }
    
    const [results, count] = await Promise.all([
      collection.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ])
    
    // Transform results to match expected format
    const transformedResults = results.map(client => {
      const createdAtCandidate = client.created_at instanceof Date ? client.created_at : (client.created_at ? new Date(client.created_at) : undefined)
      const updatedAtCandidate = client.updated_at instanceof Date ? client.updated_at : (client.updated_at ? new Date(client.updated_at) : undefined)
      const isValid = (d?: Date) => !!d && !isNaN(d.getTime())
      const createdAt = isValid(createdAtCandidate) ? createdAtCandidate! : new Date()
      const updatedAt = isValid(updatedAtCandidate) ? updatedAtCandidate! : undefined
      return {
        id: client._id.toString(),
        client_name: client.client_name ?? client.name,
        phone: client.phone ?? null,
        contact_person: client.contact_person ?? null,
        email: client.email ?? null,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt ? updatedAt.toISOString() : undefined,
        created_by: client.created_by,
        updated_by: client.updated_by,
      }
    })
    
    return NextResponse.json({
      results: transformedResults,
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
    const validatedData = CreateClientSchema.parse(normalized)
    
    const clientData = {
      ...validatedData,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: session.user.id,
    }
    
    const result = await collection.insertOne(clientData)
    
    // Return the created client
    const createdClient = await collection.findOne({ _id: result.insertedId })

    if (!createdClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: result.insertedId.toString(),
      client_name: createdClient.client_name,
      phone: createdClient.phone,
      contact_person: createdClient.contact_person,
      email: createdClient.email,
      address: createdClient.address,
      city: createdClient.city,
      state: createdClient.state,
      postal_code: createdClient.postal_code,
      country: createdClient.country,
      notes: createdClient.notes,
      is_active: createdClient.is_active,
      created_at: createdClient.created_at.toISOString(),
      updated_at: createdClient.updated_at?.toISOString(),
      created_by: createdClient.created_by,
      updated_by: createdClient.updated_by,
    }, { status: 201 })
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
