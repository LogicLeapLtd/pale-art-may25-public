import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser, isAdmin } from '@/lib/auth'
import { sendEmail, EMAIL_CONFIG } from '@/lib/email'
import { hash } from 'bcryptjs'
import crypto from 'crypto'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is an admin
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const adminStatus = await isAdmin(user.id)
    if (!adminStatus) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }

    // Get email and name from request
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ message: 'Email and name are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists' }, { status: 400 })
    }

    // Generate a secure token for the invitation
    const inviteToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create a temporary password (user will be forced to change it)
    const tempPassword = crypto.randomBytes(16).toString('hex')
    const hashedPassword = await hash(tempPassword, 10)

    // Create the user with invitation token
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        // Store the invite token and expiry in a way that doesn't break existing schema
        // We'll use the password field to store a special format that indicates pending invitation
        password: `INVITE:${inviteToken}:${tokenExpiry.toISOString()}:${hashedPassword}`
      }
    })

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`
    const inviteUrl = `${baseUrl}/auth/set-password?token=${inviteToken}&email=${encodeURIComponent(email)}`

    // Send invitation email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2a352a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2a352a; color: #faf8f3; padding: 30px; text-align: center; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e5e5; }
            .cta { display: inline-block; background-color: #B88A00; color: #ffffff !important; padding: 12px 30px; text-decoration: none; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #d97706; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Admin Invitation</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>You've been invited to join Palé Hall Art as an administrator.</p>
              <p>Please click the link below to set up your password and access the admin dashboard:</p>
              <center>
                <a href="${inviteUrl}" class="cta">Set Up Your Account</a>
              </center>
              <div class="warning">
                <strong>Important:</strong> This invitation link will expire in 24 hours for security reasons.
              </div>
              <p>If you didn't expect this invitation, please ignore this email.</p>
              <p>Best regards,<br/>The Palé Hall Art Team</p>
            </div>
            <div class="footer">
              Palé Hall Art | Llanderfel, Bala, Gwynedd LL23 7PS<br/>
              This is an automated message, please do not reply.
            </div>
          </div>
        </body>
      </html>
    `

    await sendEmail({
      to: email,
      subject: 'You\'ve been invited to Palé Hall Art Admin',
      html: emailHtml,
      from: EMAIL_CONFIG.from
    })

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      userId: newUser.id 
    })

  } catch (error) {
    console.error('Failed to send invitation:', error)
    return NextResponse.json(
      { message: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}