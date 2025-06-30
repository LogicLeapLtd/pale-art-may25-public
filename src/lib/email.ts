import { Resend } from 'resend'

// Check for both RESEND_API_KEY and RESEND_API (the user mentioned RESEND_API)
const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND_API

if (!resendApiKey) {
  console.warn('RESEND_API_KEY/RESEND_API is not set - emails will not be sent')
}

if (!process.env.FROM_EMAIL) {
  console.warn('FROM_EMAIL is not set - using default email address')
}

const resend = resendApiKey ? new Resend(resendApiKey) : null

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'Palé Hall Art <art@palehall.co.uk>',
  adminEmail: process.env.ADMIN_EMAIL || 'art@palehall.co.uk'
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

// Helper function to compile template with Handlebars
async function compileTemplate(templateKey: string, data: any): Promise<{ subject: string; html: string } | null> {
  // TODO: Implement custom email templates feature
  // This would require adding an EmailTemplate model to Prisma schema
  // For now, always return null to use system templates
  return null
}

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = EMAIL_CONFIG.from,
  replyTo 
}: SendEmailOptions) {
  if (!resend) {
    console.log('Email not sent (no API key):', { to, subject })
    return { success: true, id: 'mock-email-id' }
  }

  try {
    const data = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo
    })

    return { success: true, id: data.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Email Templates
export const emailTemplates = {
  enquiry: (data: {
    name: string
    email: string
    phone?: string
    artworkName?: string
    message: string
  }) => ({
    subject: `New Artwork Enquiry${data.artworkName ? ` - ${data.artworkName}` : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2a352a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2a352a; color: #faf8f3; padding: 30px; text-align: center; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e5e5; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #B88A00; }
            .message { background-color: #faf8f3; padding: 20px; border-left: 4px solid #B88A00; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Artwork Enquiry</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">From:</span> ${data.name}
              </div>
              <div class="field">
                <span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a>
              </div>
              ${data.phone ? `
              <div class="field">
                <span class="label">Phone:</span> ${data.phone}
              </div>
              ` : ''}
              ${data.artworkName ? `
              <div class="field">
                <span class="label">Artwork:</span> ${data.artworkName}
              </div>
              ` : ''}
              <div class="message">
                <span class="label">Message:</span><br/>
                ${data.message.replace(/\n/g, '<br/>')}
              </div>
            </div>
            <div class="footer">
              This enquiry was sent from the Palé Hall Art website
            </div>
          </div>
        </body>
      </html>
    `
  }),

  orderConfirmation: (data: {
    customerName: string
    orderNumber: string
    orderDate: string
    items: Array<{
      name: string
      artist?: string
      price: number
      quantity: number
    }>
    subtotal: number
    tax: number
    shipping: number
    total: number
  }) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2a352a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2a352a; color: #faf8f3; padding: 30px; text-align: center; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e5e5; }
            .order-info { background-color: #faf8f3; padding: 20px; margin-bottom: 30px; }
            .items { margin: 30px 0; }
            .item { border-bottom: 1px solid #e5e5e5; padding: 15px 0; }
            .item:last-child { border-bottom: none; }
            .totals { margin-top: 30px; border-top: 2px solid #2a352a; padding-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row.final { font-weight: bold; font-size: 18px; color: #B88A00; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Order</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>We're delighted to confirm your order from Palé Hall Art. Your artwork will be carefully prepared and delivered to you soon.</p>
              
              <div class="order-info">
                <strong>Order Number:</strong> ${data.orderNumber}<br/>
                <strong>Order Date:</strong> ${data.orderDate}
              </div>

              <div class="items">
                <h3>Order Items</h3>
                ${data.items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong><br/>
                    ${item.artist ? `<em>by ${item.artist}</em><br/>` : ''}
                    Quantity: ${item.quantity} × £${item.price.toFixed(2)}
                  </div>
                `).join('')}
              </div>

              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>£${data.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>£${data.shipping.toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Tax:</span>
                  <span>£${data.tax.toFixed(2)}</span>
                </div>
                <div class="total-row final">
                  <span>Total:</span>
                  <span>£${data.total.toFixed(2)}</span>
                </div>
              </div>

              <p style="margin-top: 30px;">We'll send you another email when your order has been dispatched. If you have any questions, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              Palé Hall Art | Llanderfel, Bala, Gwynedd LL23 7PS<br/>
              art@palehall.co.uk | palehall.co.uk
            </div>
          </div>
        </body>
      </html>
    `
  }),

  welcome: (data: {
    name: string
  }) => ({
    subject: 'Welcome to Palé Hall Art',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2a352a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2a352a; color: #faf8f3; padding: 30px; text-align: center; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e5e5; }
            .cta { display: inline-block; background-color: #B88A00; color: #ffffff; padding: 12px 30px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Palé Hall Art</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Welcome to Palé Hall Art, where Victorian elegance meets contemporary creativity.</p>
              <p>Your account has been created successfully. You can now:</p>
              <ul>
                <li>Save your favorite artworks to your wishlist</li>
                <li>Track your orders and enquiries</li>
                <li>Manage your delivery addresses</li>
                <li>Receive exclusive invitations to private views</li>
              </ul>
              <center>
                <a href="https://palehall.co.uk/art/collection" class="cta">Browse Our Collection</a>
              </center>
              <p>We look forward to helping you discover exceptional artworks from our carefully curated collection.</p>
              <p>Warm regards,<br/>The Palé Hall Art Team</p>
            </div>
            <div class="footer">
              Palé Hall Art | Llanderfel, Bala, Gwynedd LL23 7PS<br/>
              art@palehall.co.uk | palehall.co.uk
            </div>
          </div>
        </body>
      </html>
    `
  })
}

// Helper function for sending enquiry emails
export async function sendEnquiryEmail({ enquiry }: {
  enquiry: {
    name: string
    email: string
    phone: string | null
    message: string
    product: {
      name: string
      artist: string | null
    } | null
  }
}) {
  const emailData = {
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone || undefined,
    artworkName: enquiry.product?.name,
    message: enquiry.message
  }

  // Try custom template first
  const customTemplate = await compileTemplate('enquiry', emailData)
  
  if (customTemplate) {
    return sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: customTemplate.subject,
      html: customTemplate.html,
      replyTo: enquiry.email
    })
  }

  // Fall back to system template
  const { subject, html } = emailTemplates.enquiry(emailData)
  
  return sendEmail({
    to: EMAIL_CONFIG.adminEmail,
    subject,
    html,
    replyTo: enquiry.email
  })
}

// Helper function for sending order confirmation emails
export async function sendOrderConfirmationEmail(data: {
  customerEmail: string
  customerName: string
  orderNumber: string
  orderDate: string
  items: Array<{
    name: string
    artist?: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
}) {
  // Try custom template first
  const customTemplate = await compileTemplate('orderConfirmation', data)
  
  if (customTemplate) {
    return sendEmail({
      to: data.customerEmail,
      subject: customTemplate.subject,
      html: customTemplate.html
    })
  }

  // Fall back to system template
  const { subject, html } = emailTemplates.orderConfirmation(data)
  
  return sendEmail({
    to: data.customerEmail,
    subject,
    html
  })
}

// Helper function for sending welcome emails
export async function sendWelcomeEmail(data: {
  email: string
  name: string
}) {
  // Try custom template first
  const customTemplate = await compileTemplate('welcome', data)
  
  if (customTemplate) {
    return sendEmail({
      to: data.email,
      subject: customTemplate.subject,
      html: customTemplate.html
    })
  }

  // Fall back to system template
  const { subject, html } = emailTemplates.welcome(data)
  
  return sendEmail({
    to: data.email,
    subject,
    html
  })
}