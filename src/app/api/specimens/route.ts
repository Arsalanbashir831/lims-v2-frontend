import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import clientPromise from "@/lib/auth/mongodb"
import { CreateSpecimenSchema, SpecimenResponseSchema } from "@/lib/schemas/sample-preparation"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db('lims')
    const collection = db.collection('specimens')

    const body = await request.json()
    const validatedData = CreateSpecimenSchema.parse(body)

    // Check if specimen_id already exists
    const existingSpecimen = await collection.findOne({ 
      specimen_id: validatedData.specimen_id 
    })
    
    if (existingSpecimen) {
      return NextResponse.json({ 
        error: 'Specimen ID already exists',
        details: `Specimen ID "${validatedData.specimen_id}" is already in use`
      }, { status: 400 })
    }

    const doc = {
      ...validatedData,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await collection.insertOne(doc)

    const response = {
      id: result.insertedId.toString(),
      specimen_id: validatedData.specimen_id,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
