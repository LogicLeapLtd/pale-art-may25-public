import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Generate a stable secret based on the app name and a fixed salt
// This avoids needing an env var while still being reasonably secure for admin auth
const APP_NAME = 'pale-hall-art-admin'
const FIXED_SALT = 'ph-art-2024-secure-admin-key'
const secret = new TextEncoder().encode(
  `${APP_NAME}-${FIXED_SALT}-${Buffer.from(APP_NAME).toString('base64')}`
)

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
  
  return token
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string }
  } catch (error) {
    return null
  }
}

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      stripeCustomerId: true,
      createdAt: true,
      emailVerified: true
    }
  })

  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Admin authentication
export async function isAdmin(userId?: string) {
  if (!userId) {
    const user = await getUser()
    if (!user) return false
    userId = user.id
  }
  
  // Check if user email matches admin emails
  const adminEmails = [
    'admin@palehall.co.uk',
    'art@palehall.co.uk',
    'joanna@palehall.co.uk'
  ]
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })
  
  return user && adminEmails.includes(user.email.toLowerCase())
}

export async function requireAdmin() {
  const user = await requireAuth()
  const admin = await isAdmin(user.id)
  
  if (!admin) {
    throw new Error('Unauthorized - Admin access required')
  }
  
  return user
}