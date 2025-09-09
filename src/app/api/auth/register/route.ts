import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/auth/mongodb'
import { RegisterUserSchema } from '@/lib/schemas/user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validatedData = RegisterUserSchema.parse(body)
    
    const client = await clientPromise
    const db = client.db('lims')
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      $or: [
        { username: validatedData.username },
        { email: validatedData.email }
      ]
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user
    const userData = {
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      isVerified: false, // Default to unverified
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection('users').insertOne(userData)
    
    // Return user without password
    const { password, ...userWithoutPassword } = userData
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please wait for admin verification.',
      user: {
        id: result.insertedId.toString(),
        ...userWithoutPassword
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input data', 
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Registration failed. Please try again.' 
      },
      { status: 500 }
    )
  }
}
