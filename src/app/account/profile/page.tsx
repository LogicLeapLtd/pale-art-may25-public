'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { User, ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      })
    }
  }, [user, resetProfile])

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setProfileMessage('Profile updated successfully')
        await refreshUser()
        setTimeout(() => setProfileMessage(''), 3000)
      } else {
        const error = await response.json()
        setProfileMessage(error.error || 'Failed to update profile')
      }
    } catch (error) {
      setProfileMessage('An error occurred')
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })

      if (response.ok) {
        setPasswordMessage('Password changed successfully')
        resetPassword()
        setShowPasswordForm(false)
        setTimeout(() => setPasswordMessage(''), 3000)
      } else {
        const error = await response.json()
        setPasswordMessage(error.error || 'Failed to change password')
      }
    } catch (error) {
      setPasswordMessage('An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-sage">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sage hover:text-forest mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-accent text-forest">My Profile</h1>
          <p className="mt-2 text-sage">Update your personal information</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <h3 className="text-lg font-medium text-forest mb-4">Profile Information</h3>
          
          {profileMessage && (
            <div className={`mb-4 p-3 rounded-md ${
              profileMessage.includes('successfully') 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...registerProfile('name')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
              />
              {profileErrors.name && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...registerProfile('email')}
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
              />
              {profileErrors.email && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                {...registerProfile('phone')}
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
              />
              {profileErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest hover:bg-forest-dark disabled:opacity-50"
              >
                {profileSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-forest">Password</h3>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-gold hover:text-forest"
              >
                Change Password
              </button>
            )}
          </div>
          
          {passwordMessage && (
            <div className={`mb-4 p-3 rounded-md ${
              passwordMessage.includes('successfully') 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {passwordMessage}
            </div>
          )}

          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest hover:bg-forest-dark disabled:opacity-50"
                >
                  {passwordSubmitting ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    resetPassword()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-sage">••••••••</p>
          )}
        </div>

        {/* Account Information */}
        <div className="mt-6 bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-medium text-forest mb-4">Account Information</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-sage">Member Since</dt>
              <dd className="text-sm text-forest">
                {new Date(user.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </dd>
            </div>
            {user.stripeCustomerId && (
              <div>
                <dt className="text-sm font-medium text-sage">Customer ID</dt>
                <dd className="text-sm text-forest font-mono">{user.stripeCustomerId}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}