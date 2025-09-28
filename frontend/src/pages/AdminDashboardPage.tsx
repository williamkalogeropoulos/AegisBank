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
  Eye
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
  type: 'CHECKING' | 'SAVINGS'
  iban: string
  balance: number
  currency: string
  status: 'ACTIVE' | 'FROZEN' | 'PENDING'
  nickname?: string
  createdAt: string
  updatedAt: string
  userName?: string
  userEmail?: string
}

interface Card {
  id: number
  userId: number
  user?: User
  accountId: number
  type: 'DEBIT' | 'CREDIT'
  maskedNumber: string
  expiryMonth: number
  expiryYear: number
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING'
  creditLimit?: number
  createdAt: string
  updatedAt: string
  userName?: string
  userEmail?: string
}

interface Loan {
  id: number
  userId: number
  user?: User
  principal: number
  interestRate: number
  termMonths: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID'
  monthlyPayment?: number
  purpose?: string
  createdAt: string
  updatedAt: string
  userName?: string
  userEmail?: string
}

interface Transfer {
  id: number
  fromAccountId: number
  fromAccount?: Account
  toIban: string
  amount: number
  currency: string
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cards' | 'loans' | 'transfers' | 'users'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<{type: string, id: number, data: any} | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [viewingItem, setViewingItem] = useState<{type: string, id: number, data: any} | null>(null)
  const queryClient = useQueryClient()

  // Fetch all data
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/api/users')
      return response.data
    }
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts/admin/all')
      return response.data
    }
  })

  const { data: cards = [] } = useQuery({
    queryKey: ['admin-cards'],
    queryFn: async () => {
      const response = await api.get('/api/cards/admin/all')
      return response.data
    }
  })

  const { data: loans = [] } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: async () => {
      const response = await api.get('/api/loans/admin/all')
      return response.data
    }
  })

  const { data: transfers = [] } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: async () => {
      const response = await api.get('/api/transfers/admin/all')
      return response.data
    }
  })

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    totalAccounts: accounts.length,
    totalCards: cards.length,
    totalLoans: loans.length,
    totalTransfers: transfers.length,
    pendingAccounts: accounts.filter((acc: Account) => acc.status === 'PENDING').length,
    pendingCards: cards.filter((card: Card) => card.status === 'PENDING').length,
    pendingLoans: loans.filter((loan: Loan) => loan.status === 'PENDING').length,
    totalPending: accounts.filter((acc: Account) => acc.status === 'PENDING').length +
                 cards.filter((card: Card) => card.status === 'PENDING').length +
                 loans.filter((loan: Loan) => loan.status === 'PENDING').length
  }

  // Mutations
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/accounts/${id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
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
      await api.delete(`/api/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
      alert('Account deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting account:', error)
      alert('Failed to delete account: ' + (error.response?.data?.message || error.message))
    }
  })

  const approveAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/accounts/admin/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
    }
  })

  const rejectAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/accounts/admin/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
    }
  })

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/cards/admin/${id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
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
      queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
      alert('Card deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting card:', error)
      alert('Failed to delete card: ' + (error.response?.data?.message || error.message))
    }
  })

  const approveCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/cards/admin/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
    }
  })

  const rejectCardMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/cards/admin/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
    }
  })

  const cancelAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/accounts/admin/${id}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
      alert('Account cancelled successfully!')
    },
    onError: (error: any) => {
      console.error('Error cancelling account:', error)
      alert('Failed to cancel account: ' + (error.response?.data?.message || error.message))
    }
  })

  const cancelCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/cards/admin/${id}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
      alert('Card cancelled successfully!')
    },
    onError: (error: any) => {
      console.error('Error cancelling card:', error)
      alert('Failed to cancel card: ' + (error.response?.data?.message || error.message))
    }
  })

  const cancelTransferMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/transfers/admin/${id}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] })
      alert('Transfer cancelled successfully!')
    },
    onError: (error: any) => {
      console.error('Error cancelling transfer:', error)
      alert('Failed to cancel transfer: ' + (error.response?.data?.message || error.message))
    }
  })

  const cancelLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/loans/admin/${id}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
      alert('Loan cancelled successfully!')
    },
    onError: (error: any) => {
      console.error('Error cancelling loan:', error)
      alert('Failed to cancel loan: ' + (error.response?.data?.message || error.message))
    }
  })

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/loans/admin/${id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
      setEditingItem(null)
      setEditForm({})
      alert('Loan updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating loan:', error)
      alert('Failed to update loan: ' + (error.response?.data?.message || error.message))
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/users/${id}`, updates)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      alert('User deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error)
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message))
    }
  })

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/loans/admin/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
      alert('Loan deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting loan:', error)
      alert('Failed to delete loan: ' + (error.response?.data?.message || error.message))
    }
  })

  const approveLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/loans/admin/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
    }
  })

  const rejectLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/loans/admin/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
    }
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      PENDING: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      FROZEN: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      BLOCKED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      APPROVED: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      REJECTED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      COMPLETED: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      FAILED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      PAID: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      CANCELLED: { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleEdit = (type: string, id: number, data: any) => {
    setEditingItem({ type, id, data })
    setEditForm({ ...data })
  }

  const handleSave = () => {
    if (!editingItem) return

    const { type, id } = editingItem
    console.log('Saving:', { type, id, editForm })

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
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setEditForm({})
  }

  const handleView = (type: string, id: number, data: any) => {
    setViewingItem({ type, id, data })
  }

  const handleCloseView = () => {
    setViewingItem(null)
  }


  const filteredAccounts = accounts.filter((account: Account) => 
    account.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.userName || account.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.userEmail || account.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCards = cards.filter((card: Card) => 
    card.maskedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.userName || card.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.userEmail || card.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLoans = loans.filter((loan: Loan) => 
    (loan.userName || loan.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.userEmail || loan.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.purpose || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTransfers = transfers.filter((transfer: Transfer) => 
    transfer.toIban.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transfer.fromAccount?.userName || transfer.fromAccount?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transfer.fromAccount?.userEmail || transfer.fromAccount?.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transfer.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 dark:text-white flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span>Admin Dashboard</span>
            {stats.totalPending > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.totalPending} Pending
              </Badge>
            )}
          </h1>
          <p className="text-blue-700 dark:text-black mt-2">Complete system management and user oversight</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                <p className="text-sm text-blue-500 dark:text-blue-400">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalAccounts}</p>
                <p className="text-sm text-blue-500 dark:text-blue-400">Accounts</p>
                {stats.pendingAccounts > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {stats.pendingAccounts} pending
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Banknote className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalCards}</p>
                <p className="text-sm text-blue-500 dark:text-blue-400">Cards</p>
                {stats.pendingCards > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {stats.pendingCards} pending
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalLoans}</p>
                <p className="text-sm text-blue-500 dark:text-blue-400">Loans</p>
                {stats.pendingLoans > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {stats.pendingLoans} pending
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <ArrowLeftRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalTransfers}</p>
                <p className="text-sm text-blue-500 dark:text-blue-400">Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-blue-100 dark:bg-blue-800 p-1 rounded-lg">
              {[
                { key: 'overview', label: 'Overview', icon: Shield },
                { key: 'accounts', label: 'Accounts', icon: CreditCard, count: stats.totalAccounts, pending: stats.pendingAccounts },
                { key: 'cards', label: 'Cards', icon: Banknote, count: stats.totalCards, pending: stats.pendingCards },
                { key: 'loans', label: 'Loans', icon: FileText, count: stats.totalLoans, pending: stats.pendingLoans },
                { key: 'transfers', label: 'Transfers', icon: ArrowLeftRight, count: stats.totalTransfers },
                { key: 'users', label: 'Users', icon: Users, count: stats.totalUsers }
              ].map(({ key, label, icon: Icon, count, pending }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === key
                      ? 'bg-white dark:bg-blue-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-blue-700 dark:text-blue-500 hover:text-blue-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                  {pending && pending > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pending}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-gray-500" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {activeTab === 'accounts' && (
                <select
                  className="p-2 border rounded-md bg-background text-foreground border-input"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSearchTerm('')
                    } else {
                      setSearchTerm(e.target.value)
                    }
                  }}
                >
                  <option value="all">All Accounts</option>
                  <option value="CHECKING">Checking Accounts</option>
                  <option value="SAVINGS">Savings Accounts</option>
                  <option value="LOAN">Loan Accounts</option>
                  <option value="ACTIVE">Active</option>
                  <option value="FROZEN">Frozen</option>
                  <option value="PENDING">Pending</option>
                </select>
              )}
              {activeTab === 'cards' && (
                <select
                  className="p-2 border rounded-md bg-background text-foreground border-input"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSearchTerm('')
                    } else {
                      setSearchTerm(e.target.value)
                    }
                  }}
                >
                  <option value="all">All Cards</option>
                  <option value="DEBIT">Debit Cards</option>
                  <option value="CREDIT">Credit Cards</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="PENDING">Pending</option>
                </select>
              )}
              {activeTab === 'loans' && (
                <select
                  className="p-2 border rounded-md bg-background text-foreground border-input"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSearchTerm('')
                    } else {
                      setSearchTerm(e.target.value)
                    }
                  }}
                >
                  <option value="all">All Loans</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAID">Paid</option>
                </select>
              )}
              {activeTab === 'transfers' && (
                <select
                  className="p-2 border rounded-md bg-background text-foreground border-input"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSearchTerm('')
                    } else {
                      setSearchTerm(e.target.value)
                    }
                  }}
                >
                  <option value="all">All Transfers</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pending Requests Alert */}
              {stats.totalPending > 0 && (
                <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      <div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100">Pending Requests Require Attention</h3>
                        <p className="text-orange-700 dark:text-orange-300">
                          {stats.pendingAccounts} accounts, {stats.pendingCards} cards, {stats.pendingLoans} loans
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Recent Accounts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {accounts.slice(0, 5).map((account: Account) => (
                        <div key={account.id} className="flex items-center justify-between p-3 border dark:border-blue-700 rounded-lg">
                          <div>
                            <p className="font-medium">{account.type} Account</p>
                            <p className="text-sm text-blue-500 dark:text-blue-400">{account.userName || account.user?.name || 'Unknown'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(account.balance)}</p>
                            {getStatusBadge(account.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span>Recent Transfers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transfers.slice(0, 5).map((transfer: Transfer) => (
                        <div key={transfer.id} className="flex items-center justify-between p-3 border dark:border-blue-700 rounded-lg">
                          <div>
                            <p className="font-medium">{formatCurrency(transfer.amount)}</p>
                            <p className="text-sm text-blue-500 dark:text-blue-400">{transfer.fromAccount?.user?.name || 'Unknown'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-blue-500 dark:text-blue-400">{formatDate(transfer.createdAt)}</p>
                            {getStatusBadge(transfer.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">All Accounts ({filteredAccounts.length})</h3>
              </div>
              
              <div className="space-y-3">
                {filteredAccounts.map((account: Account) => (
                  <div key={account.id} className="border dark:border-blue-700 rounded-lg p-4">
                    {editingItem?.type === 'account' && editingItem?.id === account.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="balance">Balance (€)</Label>
                            <Input
                              id="balance"
                              type="number"
                              step="0.01"
                              value={editForm.balance || account.balance}
                              onChange={(e) => setEditForm({...editForm, balance: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                              value={editForm.status || account.status}
                              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="FROZEN">Frozen</option>
                              <option value="PENDING">Pending</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium">{account.type} Account</h4>
                            <p className="text-sm text-blue-500 dark:text-blue-400">{account.iban}</p>
                            <p className="text-sm text-blue-700 dark:text-gray-300 font-medium">
                              {account.userName || account.user?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-blue-500 dark:text-blue-400">
                              {account.userEmail || account.user?.email || ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(account.balance)}</p>
                            <p className="text-sm text-blue-500 dark:text-blue-400">Balance</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(account.status)}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleView('account', account.id, account)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {account.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => approveAccountMutation.mutate(account.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => rejectAccountMutation.mutate(account.id)}
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
                          {account.status !== 'CANCELLED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => cancelAccountMutation.mutate(account.id)}
                              className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">All Cards ({filteredCards.length})</h3>
              </div>
              
              <div className="space-y-3">
                {filteredCards.map((card: Card) => (
                  <div key={card.id} className="border dark:border-blue-700 rounded-lg p-4">
                    {editingItem?.type === 'card' && editingItem?.id === card.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                              value={editForm.status || card.status}
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
                              value={editForm.creditLimit || card.creditLimit || ''}
                              onChange={(e) => setEditForm({...editForm, creditLimit: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{card.type} Card</h4>
                          <p className="text-sm text-blue-500 dark:text-blue-400">{card.maskedNumber}</p>
                          <p className="text-sm text-blue-700 dark:text-gray-300 font-medium">
                            {card.userName || card.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-blue-500 dark:text-blue-400">
                            {card.userEmail || card.user?.email || ''}
                          </p>
                        </div>
                        {card.creditLimit && (
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(card.creditLimit)}</p>
                            <p className="text-sm text-blue-500 dark:text-blue-400">Credit Limit</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(card.status)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView('card', card.id, card)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {card.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => approveCardMutation.mutate(card.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => rejectCardMutation.mutate(card.id)}
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
                        {card.status !== 'CANCELLED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => cancelCardMutation.mutate(card.id)}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">All Loans ({filteredLoans.length})</h3>
              </div>
              
              <div className="space-y-3">
                {filteredLoans.map((loan: Loan) => (
                  <div key={loan.id} className="border dark:border-blue-700 rounded-lg p-4">
                    {editingItem?.type === 'loan' && editingItem?.id === loan.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                              value={editForm.status || loan.status}
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
                              value={editForm.principal || loan.principal}
                              onChange={(e) => setEditForm({...editForm, principal: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="interestRate">Interest Rate (%)</Label>
                            <Input
                              id="interestRate"
                              type="number"
                              step="0.01"
                              value={editForm.interestRate ? (editForm.interestRate * 100) : (loan.interestRate * 100)}
                              onChange={(e) => setEditForm({...editForm, interestRate: parseFloat(e.target.value) / 100})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="termMonths">Term (Months)</Label>
                            <Input
                              id="termMonths"
                              type="number"
                              value={editForm.termMonths || loan.termMonths}
                              onChange={(e) => setEditForm({...editForm, termMonths: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">Loan #{loan.id}</h4>
                          <p className="text-sm text-blue-500 dark:text-blue-400">{formatCurrency(loan.principal)}</p>
                          <p className="text-sm text-blue-700 dark:text-gray-300 font-medium">
                            {loan.userName || loan.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-blue-500 dark:text-blue-400">
                            {loan.userEmail || loan.user?.email || ''}
                          </p>
                        </div>
                        {loan.monthlyPayment && (
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                            <p className="text-sm text-blue-500 dark:text-blue-400">Monthly Payment</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(loan.status)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView('loan', loan.id, loan)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {loan.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => approveLoanMutation.mutate(loan.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => rejectLoanMutation.mutate(loan.id)}
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
                        {loan.status !== 'CANCELLED' && loan.status !== 'PAID' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => cancelLoanMutation.mutate(loan.id)}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfers Tab */}
          {activeTab === 'transfers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">All Transfers ({filteredTransfers.length})</h3>
              </div>
              
              <div className="space-y-3">
                {filteredTransfers.map((transfer: Transfer) => (
                  <div key={transfer.id} className="border dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">Transfer #{transfer.id}</h4>
                          <p className="text-sm text-blue-500 dark:text-blue-400">To: {transfer.toIban}</p>
                          <p className="text-sm text-blue-700 dark:text-gray-300 font-medium">
                            {transfer.fromAccount?.userName || transfer.fromAccount?.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-blue-500 dark:text-blue-400">
                            {transfer.fromAccount?.userEmail || transfer.fromAccount?.user?.email || ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(transfer.amount, transfer.currency)}</p>
                          <p className="text-sm text-blue-500 dark:text-blue-400">Amount</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(transfer.status)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView('transfer', transfer.id, transfer)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {transfer.status !== 'CANCELLED' && transfer.status !== 'COMPLETED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => cancelTransferMutation.mutate(transfer.id)}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">All Users ({users.length})</h3>
              </div>
              
              <div className="space-y-3">
                {users.map((user: User) => (
                  <div key={user.id} className="border dark:border-blue-700 rounded-lg p-4">
                    {editingItem?.type === 'user' && editingItem?.id === user.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editForm.name || user.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editForm.email || user.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <select
                              id="role"
                              className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                              value={editForm.role || user.role}
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
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-blue-500 dark:text-blue-400">{user.email}</p>
                          <p className="text-sm text-blue-700 dark:text-gray-300">Joined: {formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView('user', user.id, user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit('user', user.id, user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
                              deleteUserMutation.mutate(user.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-blue-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {viewingItem.type.charAt(0).toUpperCase() + viewingItem.type.slice(1)} Details
              </h3>
              <Button variant="outline" size="sm" onClick={handleCloseView}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {viewingItem.type === 'account' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Account ID</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Type</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">IBAN</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-mono">{viewingItem.data.iban}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Balance</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">{formatCurrency(viewingItem.data.balance)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingItem.data.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Currency</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.currency}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">User</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.userName || viewingItem.data.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Email</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.userEmail || viewingItem.data.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Created</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Updated</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.updatedAt)}</p>
                  </div>
                </div>
              )}

              {viewingItem.type === 'card' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Card ID</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Type</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Card Number</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-mono">{viewingItem.data.maskedNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingItem.data.status)}</div>
                  </div>
                  {viewingItem.data.creditLimit && (
                    <div>
                      <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Credit Limit</Label>
                      <p className="text-blue-900 dark:text-blue-100 font-medium">{formatCurrency(viewingItem.data.creditLimit)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Expiry</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.expiryMonth}/{viewingItem.data.expiryYear}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">User</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.userName || viewingItem.data.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Email</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.userEmail || viewingItem.data.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Created</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                </div>
              )}

              {viewingItem.type === 'loan' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Loan ID</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingItem.data.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Principal</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">{formatCurrency(viewingItem.data.principal)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Interest Rate</Label>
                    <p className="text-blue-900 dark:text-blue-100">{(viewingItem.data.interestRate * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Term</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.termMonths} months</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Monthly Payment</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">{formatCurrency(viewingItem.data.monthlyPayment)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">User</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.userName || viewingItem.data.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Email</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.userEmail || viewingItem.data.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Created</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  {viewingItem.data.adminNotes && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Admin Notes</Label>
                      <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {viewingItem.type === 'transfer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Transfer ID</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingItem.data.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Amount</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">{formatCurrency(viewingItem.data.amount, viewingItem.data.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">To IBAN</Label>
                    <p className="text-blue-900 dark:text-blue-100 font-mono">{viewingItem.data.toIban}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">From Account</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.fromAccount?.iban}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">User</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.fromAccount?.userName || viewingItem.data.fromAccount?.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Email</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.fromAccount?.userEmail || viewingItem.data.fromAccount?.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Created</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  {viewingItem.data.description && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Description</Label>
                      <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.description}</p>
                    </div>
                  )}
                </div>
              )}

              {viewingItem.type === 'user' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">User ID</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Role</Label>
                    <div className="mt-1">
                      <Badge variant={viewingItem.data.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {viewingItem.data.role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Name</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Email</Label>
                    <p className="text-blue-900 dark:text-blue-100">{viewingItem.data.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Joined</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-500 dark:text-blue-400">Last Updated</Label>
                    <p className="text-blue-900 dark:text-blue-100">{formatDate(viewingItem.data.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
