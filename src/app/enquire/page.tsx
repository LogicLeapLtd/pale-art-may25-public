'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  artworkId: z.string(),
  artworkName: z.string()
})

type EnquiryFormData = z.infer<typeof enquirySchema>

function EnquireContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const artworkId = searchParams.get('artworkId') || ''
  const artworkName = searchParams.get('artworkName') || ''
  const artist = searchParams.get('artist') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      artworkId,
      artworkName
    }
  })

  useEffect(() => {
    if (artworkId && artworkName) {
      setValue('artworkId', artworkId)
      setValue('artworkName', artworkName)
    }
  }, [artworkId, artworkName, setValue])

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          artist: artist || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit enquiry')
      }

      setSubmitSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/collection/${artworkId}`)
      }, 3000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit enquiry')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-display text-forest-900 mb-2">
            Enquiry Sent Successfully
          </h1>
          <p className="text-sage mb-6">
            Thank you for your interest in {artworkName}. Our team will contact you shortly.
          </p>
          <Link
            href={`/collection/${artworkId}`}
            className="inline-flex items-center text-gold-600 hover:text-gold-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Artwork
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container-luxury max-w-2xl">
        <Link 
          href={artworkId ? `/collection/${artworkId}` : '/collection'} 
          className="inline-flex items-center text-sage hover:text-forest mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to {artworkId ? 'Artwork' : 'Collection'}
        </Link>

        <div className="bg-white rounded-lg shadow-soft p-8">
          <h1 className="text-3xl font-display text-forest-900 mb-2">
            Enquire About Artwork
          </h1>
          
          {artworkName && (
            <div className="mb-8 p-4 bg-cream-100 rounded-lg">
              <p className="text-sm text-sage mb-1">Enquiring about:</p>
              <p className="font-medium text-forest-900">{artworkName}</p>
              {artist && (
                <p className="text-sm text-gold-600 italic">by {artist}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-forest-700 mb-1">
                  Your Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-2 border border-gold-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-forest-700 mb-1">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gold-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-forest-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 border border-gold-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="+44 1234 567890"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-forest-700 mb-1">
                Your Message *
              </label>
              <textarea
                {...register('message')}
                rows={6}
                className="w-full px-4 py-2 border border-gold-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="I'm interested in learning more about this artwork..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>

            <input type="hidden" {...register('artworkId')} />
            <input type="hidden" {...register('artworkName')} />

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}
              </button>
            </div>

            <p className="text-xs text-center text-sage">
              We'll respond to your enquiry within 24 hours during business days.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function EnquirePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p className="text-forest-600">Loading...</p>
        </div>
      </div>
    }>
      <EnquireContent />
    </Suspense>
  )
}