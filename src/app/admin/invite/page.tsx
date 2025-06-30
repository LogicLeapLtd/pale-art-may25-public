'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function InviteAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const res = await fetch('/api/auth/check-admin')
      if (!res.ok) {
        router.push('/auth/login?redirect=/admin/invite&error=admin_required')
        return
      }
      
      const data = await res.json()
      
      if (!data.isAdmin) {
        router.push('/account')
        return
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login?redirect=/admin/invite&error=admin_required')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSending(true)

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: `Invitation sent to ${email}` })
        setEmail('')
        setName('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send invitation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while sending the invitation' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sage-light/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/admin/users" 
              className="inline-flex items-center text-sage hover:text-forest transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
            <h1 className="text-3xl font-display text-forest">Invite Admin User</h1>
            <p className="text-sage mt-2">
              Send an invitation email to grant admin access to a new user
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-forest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-sage-light rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-forest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-sage-light rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary flex items-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-sage-light">
              <h3 className="text-sm font-medium text-forest mb-2">How it works:</h3>
              <ol className="text-sm text-sage space-y-1 list-decimal list-inside">
                <li>The user will receive an email with a secure invitation link</li>
                <li>They'll be prompted to create a password for their account</li>
                <li>After setting their password, they'll have full admin access</li>
                <li>They'll be automatically redirected to the admin dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}