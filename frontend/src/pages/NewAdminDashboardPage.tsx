import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Users, 
  CreditCard, 
  Banknote, 
  FileText, 
  ArrowLeftRight,
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  TrendingUp,
  Search,
  Plus,
  Save,
  X,
  AlertTriangle,
  User,
  Eye,
  UserPlus
} from 'lucide-react'
import api from '../lib/api'

interface User {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

interface Account {
  id: number
  userId: number
  user?: User
  type: 'CHECKING' | 'SAVINGS' | 'LOAN'
  iban: string
  balance: number
  currency: string
  status: 'ACTIVE' | 'FROZEN' | 'PENDING' | 'CANCELLED'
  nickname?: string
  createdAt: string
  updatedAt: string
}

interface Card {
  id: number
  userId: number
  user?: User
  accountId: number
  account?: Account
  type: 'DEBIT' | 'CREDIT'
  maskedNumber: string
  expiryMonth: number
  expiryYear: number
  status: 'ACTIVE' | 'FROZEN' | 'PENDING' | 'CANCELLED'
  creditLimit?: number
  createdAt: string
  updatedAt: string
}

interface Loan {
  id: number
  userId: number
  user?: User
  principal: number
  interestRate: number
  termMonths: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID' | 'CANCELLED'
  monthlyPayment: number
  purpose?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface Transfer {
  id: number
  fromAccountId: number
  fromAccount?: Account
  toIban: string
  amount: number
  currency: string
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export const NewAdminDashboardPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cards' | 'loans' | 'transfers'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<{ type: string; id: number; data: any } | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [viewingItem, setViewingItem] = useState<{ type: string; data: any } | null>(null)
  const queryClient = useQueryClient()

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/api/users')
      return response.data
    }
  })

  // Fetch all accounts and filter by user
  const { data: allAccounts = [] } = useQuery({
    queryKey: ['admin-all-accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts/admin/all')
      return response.data
    }
  })

  // Fetch all cards and filter by user
  const { data: allCards = [] } = useQuery({
    queryKey: ['admin-all-cards'],
    queryFn: async () => {
      const response = await api.get('/api/cards/admin/all')
      return response.data
    }
  })

  // Fetch all loans and filter by user
  const { data: allLoans = [] } = useQuery({
    queryKey: ['admin-all-loans'],
    queryFn: async () => {
      const response = await api.get('/api/loans/admin/all')
      return response.data
    }
  })

  // Fetch all transfers and filter by user
  const { data: allTransfers = [] } = useQuery({
    queryKey: ['admin-all-transfers'],
    queryFn: async () => {
      const response = await api.get('/api/transfers/admin/all')
      return response.data
    }
  })

  // Filter data by selected user
  const userAccounts = selectedUser ? allAccounts.filter((account: Account) => account.userId === selectedUser.id) : []
  const userCards = selectedUser ? allCards.filter((card: Card) => card.userId === selectedUser.id) : []
  const userLoans = selectedUser ? allLoans.filter((loan: Loan) => loan.userId === selectedUser.id) : []
  const userTransfers = selectedUser ? allTransfers.filter((transfer: Transfer) => transfer.fromAccount?.userId === selectedUser.id) : []

  // Mutations for CRUD operations
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      console.log('Updating account:', id, 'with updates:', updates)
      console.log('API endpoint:', `/api/accounts/admin/${id}`)
      
      // Validate and clean the updates
      const cleanUpdates: any = {}
      
      if (updates.status && ['PENDING', 'ACTIVE', 'FROZEN', 'CANCELLED'].includes(updates.status)) {
        cleanUpdates.status = updates.status
      }
      
      if (updates.balance !== undefined && updates.balance !== null && updates.balance !== '') {
        const balance = parseFloat(updates.balance)
        if (!isNaN(balance) && balance >= 0) {
          cleanUpdates.balance = balance
        }
      }
      
      if (updates.nickname !== undefined) {
        cleanUpdates.nickname = updates.nickname || null
      }
      
      if (updates.type && ['CHECKING', 'SAVINGS', 'LOAN'].includes(updates.type)) {
        cleanUpdates.type = updates.type
      }
      
      console.log('Clean updates being sent:', cleanUpdates)
      const response = await api.put(`/api/accounts/admin/${id}`, cleanUpdates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-accounts'] })
      setEditingItem(null)
      setEditForm({})
      alert('Account updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating account:', error)
      alert('Failed to update account: ' + (error.response?.data?.message || error.message))
    }
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/accounts/admin/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-accounts'] })
      alert('Account deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting account:', error)
      alert('Failed to delete account: ' + (error.response?.data?.message || error.message))
    }
  })

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      console.log('Updating card:', id, 'with updates:', updates)
      console.log('API endpoint:', `/api/cards/admin/${id}`)
      
      // Validate and clean the updates
      const cleanUpdates: any = {}
      
      if (updates.status && ['PENDING', 'ACTIVE', 'BLOCKED', 'CANCELLED'].includes(updates.status)) {
        cleanUpdates.status = updates.status
      }
      
      if (updates.creditLimit !== undefined && updates.creditLimit !== null && updates.creditLimit !== '') {
        const limit = parseFloat(updates.creditLimit)
        if (!isNaN(limit) && limit >= 0) {
          cleanUpdates.creditLimit = limit
        }
      }
      
      console.log('Clean updates being sent:', cleanUpdates)
      const response = await api.put(`/api/cards/admin/${id}`, cleanUpdates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-cards'] })
      setEditingItem(null)
      setEditForm({})
      alert('Card updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating card:', error)
      alert('Failed to update card: ' + (error.response?.data?.message || error.message))
    }
  })

  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/cards/${id}/admin`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-cards'] })
      alert('Card deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting card:', error)
      alert('Failed to delete card: ' + (error.response?.data?.message || error.message))
    }
  })

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      console.log('Updating loan:', id, 'with updates:', updates)
      console.log('API endpoint:', `/api/loans/admin/${id}`)
      
      // Validate and clean the updates
      const cleanUpdates: any = {}
      
      if (updates.status && ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID', 'CANCELLED'].includes(updates.status)) {
        cleanUpdates.status = updates.status
      }
      
      if (updates.principal !== undefined && updates.principal !== null && updates.principal !== '') {
        const principal = parseFloat(updates.principal)
        if (!isNaN(principal) && principal > 0) {
          cleanUpdates.principal = principal
        }
      }
      
      if (updates.interestRate !== undefined && updates.interestRate !== null && updates.interestRate !== '') {
        const rate = parseFloat(updates.interestRate)
        if (!isNaN(rate) && rate >= 0 && rate <= 1) {
          cleanUpdates.interestRate = rate
        }
      }
      
      if (updates.termMonths !== undefined && updates.termMonths !== null && updates.termMonths !== '') {
        const term = parseInt(updates.termMonths)
        if (!isNaN(term) && term > 0) {
          cleanUpdates.termMonths = term
        }
      }
      
      if (updates.purpose !== undefined) {
        cleanUpdates.purpose = updates.purpose || null
      }
      
      console.log('Clean updates being sent:', cleanUpdates)
      const response = await api.put(`/api/loans/admin/${id}`, cleanUpdates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-loans'] })
      setEditingItem(null)
      setEditForm({})
      alert('Loan updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating loan:', error)
      alert('Failed to update loan: ' + (error.response?.data?.message || error.message))
    }
  })

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/loans/admin/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-loans'] })
      alert('Loan deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting loan:', error)
      alert('Failed to delete loan: ' + (error.response?.data?.message || error.message))
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      console.log('Updating user:', id, 'with updates:', updates)
      console.log('API endpoint:', `/api/users/${id}`)
      
      // Validate and clean the updates
      const cleanUpdates: any = {}
      
      if (updates.name && updates.name.trim() !== '') {
        cleanUpdates.name = updates.name.trim()
      }
      
      if (updates.email && updates.email.trim() !== '') {
        cleanUpdates.email = updates.email.trim()
      }
      
      if (updates.role && ['USER', 'ADMIN'].includes(updates.role)) {
        cleanUpdates.role = updates.role
      }
      
      if (updates.password && updates.password.trim() !== '') {
        cleanUpdates.password = updates.password.trim()
      }
      
      console.log('Clean updates being sent:', cleanUpdates)
      const response = await api.put(`/api/users/${id}`, cleanUpdates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditingItem(null)
      setEditForm({})
      alert('User updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating user:', error)
      alert('Failed to update user: ' + (error.response?.data?.message || error.message))
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/users/${id}`)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      if (selectedUser?.id === id) {
        setSelectedUser(null)
      }
      alert('User deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error)
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message))
    }
  })

  // Approval mutations
  const approveAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/accounts/admin/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-accounts'] })
      alert('Account approved successfully!')
    },
    onError: (error: any) => {
      console.error('Error approving account:', error)
      alert('Failed to approve account: ' + (error.response?.data?.message || error.message))
    }
  })

  const rejectAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/accounts/admin/${id}/reject`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-accounts'] })
      alert('Account rejected successfully!')
    },
    onError: (error: any) => {
      console.error('Error rejecting account:', error)
      alert('Failed to reject account: ' + (error.response?.data?.message || error.message))
    }
  })

  const approveCardMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Approving card:', id)
      console.log('API endpoint:', `/api/cards/admin/${id}/approve`)
      const response = await api.post(`/api/cards/admin/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-cards'] })
      alert('Card approved successfully!')
    },
    onError: (error: any) => {
      console.error('Error approving card:', error)
      alert('Failed to approve card: ' + (error.response?.data?.message || error.message))
    }
  })

  const rejectCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/cards/admin/${id}/reject`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-cards'] })
      alert('Card rejected successfully!')
    },
    onError: (error: any) => {
      console.error('Error rejecting card:', error)
      alert('Failed to reject card: ' + (error.response?.data?.message || error.message))
    }
  })

  const approveLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/loans/admin/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-loans'] })
      alert('Loan approved successfully!')
    },
    onError: (error: any) => {
      console.error('Error approving loan:', error)
      alert('Failed to approve loan: ' + (error.response?.data?.message || error.message))
    }
  })

  const rejectLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/loans/admin/${id}/reject`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-loans'] })
      alert('Loan rejected successfully!')
    },
    onError: (error: any) => {
      console.error('Error rejecting loan:', error)
      alert('Failed to reject loan: ' + (error.response?.data?.message || error.message))
    }
  })

  // Handler functions
  const handleEdit = (type: string, id: number, data: any) => {
    setEditingItem({ type, id, data })
    // Exclude password field to keep it empty
    const { password, ...formData } = data
    setEditForm({ ...formData })
  }

  const handleSave = () => {
    if (!editingItem) return

    const { type, id } = editingItem
    console.log('Saving:', { type, id, editForm })

    // Send the editForm directly - validation is now handled in each mutation
    switch (type) {
      case 'account':
        updateAccountMutation.mutate({ id, updates: editForm })
        break
      case 'card':
        updateCardMutation.mutate({ id, updates: editForm })
        break
      case 'loan':
        updateLoanMutation.mutate({ id, updates: editForm })
        break
      case 'user':
        updateUserMutation.mutate({ id, updates: editForm })
        break
    }
  }

  const handleDelete = (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    switch (type) {
      case 'account':
        deleteAccountMutation.mutate(id)
        break
      case 'card':
        deleteCardMutation.mutate(id)
        break
      case 'loan':
        deleteLoanMutation.mutate(id)
        break
      case 'user':
        deleteUserMutation.mutate(id)
        break
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setEditForm({})
  }

  const handleView = (type: string, data: any) => {
    setViewingItem({ type, data })
  }

  const handleCloseView = () => {
    setViewingItem(null)
  }

  const handleApprove = (type: string, id: number) => {
    if (!confirm(`Are you sure you want to approve this ${type}?`)) return

    switch (type) {
      case 'account':
        approveAccountMutation.mutate(id)
        break
      case 'card':
        approveCardMutation.mutate(id)
        break
      case 'loan':
        approveLoanMutation.mutate(id)
        break
    }
  }

  const handleReject = (type: string, id: number) => {
    if (!confirm(`Are you sure you want to reject this ${type}?`)) return

    switch (type) {
      case 'account':
        rejectAccountMutation.mutate(id)
        break
      case 'card':
        rejectCardMutation.mutate(id)
        break
      case 'loan':
        rejectLoanMutation.mutate(id)
        break
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock },
      FROZEN: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
      APPROVED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
      COMPLETED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
      CANCELLED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: XCircle },
      PAID: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: CheckCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate outstanding requests for each user
  const getUserOutstandingRequests = (userId: number) => {
    const userAccounts = allAccounts.filter((account: Account) => account.userId === userId)
    const userCards = allCards.filter((card: Card) => card.userId === userId)
    const userLoans = allLoans.filter((loan: Loan) => loan.userId === userId)
    
    const pendingAccounts = userAccounts.filter((account: Account) => account.status === 'PENDING').length
    const pendingCards = userCards.filter((card: Card) => card.status === 'PENDING').length
    const pendingLoans = userLoans.filter((loan: Loan) => loan.status === 'PENDING').length
    
    return pendingAccounts + pendingCards + pendingLoans
  }

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
          <p className="text-blue-600">Complete system management and user oversight</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'hover:bg-blue-100 dark:hover:bg-blue-800 border-2 border-transparent'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">{user.name}</p>
                        {(() => {
                          const outstandingRequests = getUserOutstandingRequests(user.id)
                          return outstandingRequests > 0 ? (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                              {outstandingRequests}
                            </Badge>
                          ) : null
                        })()}
                      </div>
                      <p className="text-xs text-blue-500">{user.email}</p>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                        <p className="text-blue-600 dark:text-blue-400">{selectedUser.email}</p>
                        <Badge variant={selectedUser.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {selectedUser.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit('user', selectedUser.id, selectedUser)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit User
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete('user', selectedUser.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-blue-100 dark:bg-blue-800 p-1 rounded-lg">
                {[
                  { key: 'overview', label: 'Overview', icon: TrendingUp },
                  { key: 'accounts', label: `Accounts (${userAccounts.length})`, icon: Banknote },
                  { key: 'cards', label: `Cards (${userCards.length})`, icon: CreditCard },
                  { key: 'loans', label: `Loans (${userLoans.length})`, icon: FileText },
                  { key: 'transfers', label: `Transfers (${userTransfers.length})`, icon: ArrowLeftRight }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Banknote className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Accounts</p>
                            <p className="text-2xl font-bold">{userAccounts.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <CreditCard className="h-8 w-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Cards</p>
                            <p className="text-2xl font-bold">{userCards.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-yellow-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Loans</p>
                            <p className="text-2xl font-bold">{userLoans.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <ArrowLeftRight className="h-8 w-8 text-purple-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Transfers</p>
                            <p className="text-2xl font-bold">{userTransfers.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pending Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                        Pending Requests
                      </CardTitle>
                      <CardDescription>Items awaiting your approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const pendingAccounts = userAccounts.filter((account: Account) => account.status === 'PENDING')
                        const pendingCards = userCards.filter((card: Card) => card.status === 'PENDING')
                        const pendingLoans = userLoans.filter((loan: Loan) => loan.status === 'PENDING')
                        const totalPending = pendingAccounts.length + pendingCards.length + pendingLoans.length

                        if (totalPending === 0) {
                          return (
                            <div className="text-center py-8">
                              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                              <p className="text-blue-500">No pending requests for this user</p>
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-4">
                            {pendingAccounts.map((account: Account) => (
                              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <Banknote className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium">Account Request</p>
                                    <p className="text-sm text-blue-600">{account.type} Account - €{account.balance.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove('account', account.id)}
                                    disabled={approveAccountMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject('account', account.id)}
                                    disabled={rejectAccountMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {pendingCards.map((card: Card) => (
                              <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <CreditCard className="h-5 w-5 text-green-600" />
                                  <div>
                                    <p className="font-medium">Card Request</p>
                                    <p className="text-sm text-blue-600">{card.type} Card - {card.maskedNumber}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove('card', card.id)}
                                    disabled={approveCardMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject('card', card.id)}
                                    disabled={rejectCardMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {pendingLoans.map((loan: Loan) => (
                              <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <FileText className="h-5 w-5 text-yellow-600" />
                                  <div>
                                    <p className="font-medium">Loan Request</p>
                                    <p className="text-sm text-blue-600">€{loan.principal.toLocaleString()} - {(loan.interestRate * 100).toFixed(2)}% - {loan.termMonths} months</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove('loan', loan.id)}
                                    disabled={approveLoanMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject('loan', loan.id)}
                                    disabled={rejectLoanMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Accounts Tab */}
              {activeTab === 'accounts' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Accounts</CardTitle>
                    <CardDescription>Manage user's bank accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAccounts.length === 0 ? (
                      <div className="text-center py-8">
                        <Banknote className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-500">No accounts found for this user</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userAccounts.map((account: Account) => (
                          <div key={account.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                  <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{account.nickname || `${account.type} Account`}</h3>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {account.iban} • €{account.balance.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(account.status)}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView('account', account)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {account.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleApprove('account', account.id)}
                                      disabled={approveAccountMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject('account', account.id)}
                                      disabled={rejectAccountMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit('account', account.id, account)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete('account', account.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cards Tab */}
              {activeTab === 'cards' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cards</CardTitle>
                    <CardDescription>Manage user's payment cards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userCards.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-500">No cards found for this user</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userCards.map((card: Card) => (
                          <div key={card.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{card.type} Card</h3>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {card.maskedNumber} • Expires {card.expiryMonth}/{card.expiryYear}
                                  </p>
                                  {card.creditLimit && (
                                    <p className="text-sm text-blue-500">Limit: €{card.creditLimit.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(card.status)}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView('card', card)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {card.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleApprove('card', card.id)}
                                      disabled={approveCardMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject('card', card.id)}
                                      disabled={rejectCardMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit('card', card.id, card)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete('card', card.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Loans Tab */}
              {activeTab === 'loans' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Loans</CardTitle>
                    <CardDescription>Manage user's loan applications and active loans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userLoans.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-500">No loans found for this user</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userLoans.map((loan: Loan) => (
                          <div key={loan.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                                  <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">€{loan.principal.toLocaleString()} Loan</h3>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {(loan.interestRate * 100).toFixed(2)}% • {loan.termMonths} months
                                  </p>
                                  {loan.monthlyPayment && (
                                    <p className="text-sm text-blue-500">
                                      Monthly: €{loan.monthlyPayment.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(loan.status)}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView('loan', loan)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {loan.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleApprove('loan', loan.id)}
                                      disabled={approveLoanMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject('loan', loan.id)}
                                      disabled={rejectLoanMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit('loan', loan.id, loan)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete('loan', loan.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Transfers Tab */}
              {activeTab === 'transfers' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Transfers</CardTitle>
                    <CardDescription>View user's transfer history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userTransfers.length === 0 ? (
                      <div className="text-center py-8">
                        <ArrowLeftRight className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-500">No transfers found for this user</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userTransfers.map((transfer: Transfer) => (
                          <div key={transfer.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                  <ArrowLeftRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">€{transfer.amount.toLocaleString()} Transfer</h3>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    To: {transfer.toIban}
                                  </p>
                                  {transfer.description && (
                                    <p className="text-sm text-blue-500">{transfer.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(transfer.status)}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView('transfer', transfer)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-white mb-2">Select a User</h3>
                <p className="text-blue-500">Choose a user from the sidebar to view and manage their assets</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit {editingItem.type}</h3>
            
            {editingItem.type === 'account' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="FROZEN">Frozen</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="balance">Balance (€)</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={editForm.balance || ''}
                    onChange={(e) => setEditForm({...editForm, balance: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            )}

            {editingItem.type === 'card' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="creditLimit">Credit Limit (€)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    value={editForm.creditLimit || ''}
                    onChange={(e) => setEditForm({...editForm, creditLimit: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            )}

            {editingItem.type === 'loan' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="principal">Principal (€)</Label>
                  <Input
                    id="principal"
                    type="number"
                    step="0.01"
                    value={editForm.principal || ''}
                    onChange={(e) => setEditForm({...editForm, principal: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={editForm.interestRate ? (editForm.interestRate * 100) : ''}
                    onChange={(e) => setEditForm({...editForm, interestRate: parseFloat(e.target.value) / 100})}
                  />
                </div>
                <div>
                  <Label htmlFor="termMonths">Term (Months)</Label>
                  <Input
                    id="termMonths"
                    type="number"
                    value={editForm.termMonths || ''}
                    onChange={(e) => setEditForm({...editForm, termMonths: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            )}

            {editingItem.type === 'user' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="password">New Password (optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={editForm.password || ''}
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                    placeholder="Leave empty to keep current password"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-2 mt-6">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">View {viewingItem.type} Details</h3>
              <Button onClick={handleCloseView} size="sm" variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(viewingItem.data).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
