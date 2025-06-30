'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { MapPin, ChevronLeft, Plus, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  county: z.string().optional(),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean()
})

type AddressFormData = z.infer<typeof addressSchema>

interface Address {
  id: string
  name: string
  line1: string
  line2: string | null
  city: string
  county: string | null
  postalCode: string
  country: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setAddressesLoading(false)
    }
  }

  const onSubmit = async (data: AddressFormData) => {
    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses'
      
      const response = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchAddresses()
        setShowForm(false)
        setEditingAddress(null)
        reset()
      }
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAddresses()
      }
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const startEdit = (address: Address) => {
    setEditingAddress(address)
    reset({
      name: address.name,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      county: address.county || '',
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingAddress(null)
    reset()
  }

  if (loading || addressesLoading) {
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-accent text-forest">My Addresses</h1>
              <p className="mt-2 text-sage">Manage your delivery addresses</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-forest-900 hover:bg-forest-950"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <h3 className="text-lg font-medium text-forest mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="line1" className="block text-sm font-medium text-gray-700">
                  Address Line 1
                </label>
                <input
                  {...register('line1')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                />
                {errors.line1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.line1.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="line2" className="block text-sm font-medium text-gray-700">
                  Address Line 2 (Optional)
                </label>
                <input
                  {...register('line2')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                    County (Optional)
                  </label>
                  <input
                    {...register('county')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    {...register('postalCode')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    defaultValue="United Kingdom"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('isDefault')}
                  type="checkbox"
                  className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                  Set as default address
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest hover:bg-forest-dark disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingAddress ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <MapPin className="h-12 w-12 text-sage-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-forest mb-2">No addresses saved</h3>
            <p className="text-sage mb-6">Add your first delivery address to make checkout faster.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow-soft p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-forest">{address.name}</h3>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold-50 text-gold-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sage">
                      {address.line1}<br />
                      {address.line2 && <>{address.line2}<br /></>}
                      {address.city}, {address.county && <>{address.county}, </>}
                      {address.postalCode}<br />
                      {address.country}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(address)}
                      className="p-2 text-sage hover:text-forest"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="p-2 text-sage hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}