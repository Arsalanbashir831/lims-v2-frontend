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
    const collection = db.collection('lab_equipments')

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
            { equipmentName: { $regex: q, $options: 'i' } },
            { equipmentSerial: { $regex: q, $options: 'i' } },
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

    const transformed = results.map(eq => {
      const toValidDate = (v: any): Date | undefined => {
        if (!v) return undefined
        const d = v instanceof Date ? v : new Date(v)
        return isNaN(d.getTime()) ? undefined : d
      }
      const createdAtDate = toValidDate(eq.createdAt) || new Date()
      const updatedAtDate = toValidDate(eq.updatedAt)
      return {
        id: eq._id.toString(),
        equipmentName: eq.equipmentName,
        equipmentSerial: eq.equipmentSerial,
        status: eq.status ?? null,
        remarks: eq.remarks ?? null,
        lastVerification: eq.lastVerification ?? null,
        verificationDue: eq.verificationDue ?? null,
        createdBy: eq.createdBy ?? null,
        updatedBy: eq.updatedBy ?? null,
        is_active: eq.is_active !== false,
        createdAt: createdAtDate.toISOString(),
        updatedAt: updatedAtDate ? updatedAtDate.toISOString() : undefined,
      }
    })

    return NextResponse.json({
      results: transformed,
      count,
      next: page * limit < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


