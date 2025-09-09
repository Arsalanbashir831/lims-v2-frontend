import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"

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
    const query = searchParams.get('q') || ''
    const limit = 20
    const skip = (page - 1) * limit
    
    // Build search query
    const baseFilter: any = { $or: [ { is_active: true }, { is_active: { $exists: false } } ] }
    let searchQuery: any = baseFilter
    
    if (query) {
      searchQuery = {
        $and: [
          baseFilter,
          {
            $or: [
              { client_name: { $regex: query, $options: 'i' } },
              { name: { $regex: query, $options: 'i' } },
              { contact_person: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } },
              { city: { $regex: query, $options: 'i' } },
            ]
          }
        ]
      }
    }
    
    const [results, count] = await Promise.all([
      collection.find(searchQuery)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(searchQuery)
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
