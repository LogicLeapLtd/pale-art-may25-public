'use client'

import { useState } from 'react'
import { User, Shield, Mail, Phone, Calendar, ShoppingBag, MessageSquare, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface UserWithStats {
  id: string
  email: string
  name: string
  phone: string | null
  createdAt: Date
  emailVerified: Date | null
  _count: {
    orders: number
    enquiries: number
  }
}

interface UserManagementProps {
  users: UserWithStats[]
  adminEmails: string[]
}

export default function UserManagement({ users, adminEmails }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'customer'>('all')
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const isAdmin = adminEmails.includes(user.email.toLowerCase())
    
    if (filterType === 'admin') return matchesSearch && isAdmin
    if (filterType === 'customer') return matchesSearch && !isAdmin
    return matchesSearch
  })
  
  const handleMakeAdmin = async (userId: string, email: string) => {
    if (confirm(`Are you sure you want to make ${email} an admin? This cannot be undone through the UI.`)) {
      alert(`To make ${email} an admin, add their email to the adminEmails array in src/lib/auth.ts`)
    }
  }
  
  const handleDeleteUser = async (userId: string, email: string) => {
    if (adminEmails.includes(email.toLowerCase())) {
      alert('Cannot delete admin users')
      return
    }
    
    if (confirm(`Are you sure you want to delete ${email}? This will also delete their orders and data.`)) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          window.location.reload()
        } else {
          alert('Failed to delete user')
        }
      } catch (error) {
        alert('Error deleting user')
      }
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <Link
              href="/admin/invite"
              className="btn-primary flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Admin
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users ({users.length})</option>
              <option value="admin">Admins ({users.filter(u => adminEmails.includes(u.email.toLowerCase())).length})</option>
              <option value="customer">Customers ({users.filter(u => !adminEmails.includes(u.email.toLowerCase())).length})</option>
            </select>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isAdmin = adminEmails.includes(user.email.toLowerCase())
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {isAdmin ? (
                              <Shield className="h-5 w-5 text-gold-600" />
                            ) : (
                              <User className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            {isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold-100 text-gold-800">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{user._count.orders}</span>
                            <span className="text-gray-500">orders</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{user._count.enquiries}</span>
                            <span className="text-gray-500">enquiries</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        {user.emailVerified && (
                          <span className="text-xs text-green-600">Verified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {!isAdmin && (
                            <>
                              <button
                                onClick={() => handleMakeAdmin(user.id, user.email)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Make Admin
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {isAdmin && (
                            <span className="text-gray-400">Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {/* Admin Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Admin Access Information</h3>
          <p className="text-sm text-blue-700">
            To grant admin access to a user, add their email to the <code className="bg-blue-100 px-1 py-0.5 rounded">adminEmails</code> array in <code className="bg-blue-100 px-1 py-0.5 rounded">src/lib/auth.ts</code>.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Current admin emails: {adminEmails.join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}