import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Users, 
  User, 
  CreditCard, 
  Banknote, 
  FileText, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  Calendar,
  Mail,
  Phone,
  Trash2,
  Save,
  X
} from 'lucide-react'
import api from '../lib/api'

interface UserData {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  accounts: AccountData[]
  cards: CardData[]
  loans: LoanData[]
  transfers: TransferData[]
}

interface AccountData {
  id: number
  type: 'CHECKING' | 'SAVINGS'
  iban: string
  balance: number
  currency: string
  status: 'ACTIVE' | 'FROZEN' | 'PENDING'
  nickname?: string
  createdAt: string
  updatedAt: string
}

interface CardData {
  id: number
  type: 'DEBIT' | 'CREDIT'
  maskedNumber: string
  expiryMonth: number
  expiryYear: number
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING'
  creditLimit?: number
  createdAt: string
  updatedAt: string
}

interface LoanData {
  id: number
  principal: number
  interestRate: number
  termMonths: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID'
  monthlyPayment?: number
  purpose?: string
  createdAt: string
  updatedAt: string
}

interface TransferData {
  id: number
  fromAccountId: number
  toIban: string
  amount: number
  currency: string
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export const AdminUserManagementPage = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards' | 'loans' | 'transfers' | 'history'>('accounts')
  const [editingItem, setEditingItem] = useState<{type: string, id: number, data: any} | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const queryClient = useQueryClient()

  // Fetch all users with their data
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async () => {
      try {
        const [usersRes, accountsRes, cardsRes, loansRes, transfersRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/accounts/admin/all'),
          api.get('/api/cards/admin/all'),
          api.get('/api/loans/admin/all'),
          api.get('/api/transfers/admin/all')
        ])

        const usersData: UserData[] = usersRes.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          accounts: accountsRes.data.filter((acc: any) => acc.userId === user.id),
          cards: cardsRes.data.filter((card: any) => card.userId === user.id),
          loans: loansRes.data.filter((loan: any) => loan.userId === user.id),
          transfers: transfersRes.data.filter((transfer: any) => transfer.fromAccountId && 
            accountsRes.data.find((acc: any) => acc.id === transfer.fromAccountId)?.userId === user.id)
        }))

        return usersData
      } catch (error) {
        console.error('Error fetching users data:', error)
        return []
      }
    }
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      PENDING: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      FROZEN: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      BLOCKED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      APPROVED: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      REJECTED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      COMPLETED: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      FAILED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      PAID: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800' }
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

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/accounts/${id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
      setEditingItem(null)
      setEditForm({})
    }
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
    }
  })

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/cards/${id}/status/admin`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
      setEditingItem(null)
      setEditForm({})
    }
  })

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/cards/${id}/admin`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
    }
  })

  // Update loan mutation
  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await api.put(`/api/loans/admin/${id}/status`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
      setEditingItem(null)
      setEditForm({})
    }
  })

  // Delete loan mutation
  const deleteLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/loans/admin/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
    }
  })

  const handleEdit = (type: string, id: number, data: any) => {
    setEditingItem({ type, id, data })
    setEditForm({ ...data })
  }

  const handleSave = () => {
    if (!editingItem) return

    const { type, id } = editingItem

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users, their accounts, cards, loans, and transfers</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{users.length} users</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Users</span>
              </CardTitle>
              <CardDescription>
                Click on a user to view their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-3 w-3" />
                        <span>{user.accounts.length} accounts</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Banknote className="h-3 w-3" />
                        <span>{user.cards.length} cards</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{user.loans.length} loans</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{user.transfers.length} transfers</span>
                      </div>
                    </div>
                    
                    {/* Request Status Summary */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.accounts.filter(acc => acc.status === 'PENDING').length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {user.accounts.filter(acc => acc.status === 'PENDING').length} pending accounts
                        </Badge>
                      )}
                      {user.cards.filter(card => card.status === 'PENDING').length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {user.cards.filter(card => card.status === 'PENDING').length} pending cards
                        </Badge>
                      )}
                      {user.loans.filter(loan => loan.status === 'PENDING').length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {user.loans.filter(loan => loan.status === 'PENDING').length} pending loans
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedUser.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4" />
                          <span>{selectedUser.email}</span>
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined: {formatDate(selectedUser.createdAt)}</span>
                          </div>
                          <Badge variant={selectedUser.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {selectedUser.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { key: 'accounts', label: 'Accounts', icon: CreditCard, count: selectedUser.accounts.length },
                  { key: 'cards', label: 'Cards', icon: Banknote, count: selectedUser.cards.length },
                  { key: 'loans', label: 'Loans', icon: FileText, count: selectedUser.loans.length },
                  { key: 'transfers', label: 'Transfers', icon: TrendingUp, count: selectedUser.transfers.length },
                  { key: 'history', label: 'Request History', icon: Clock, count: selectedUser.accounts.length + selectedUser.cards.length + selectedUser.loans.length }
                ].map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                      activeTab === key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    <Badge variant="secondary" className="ml-1">
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {activeTab === 'accounts' && <CreditCard className="h-5 w-5" />}
                    {activeTab === 'cards' && <Banknote className="h-5 w-5" />}
                    {activeTab === 'loans' && <FileText className="h-5 w-5" />}
                    {activeTab === 'transfers' && <TrendingUp className="h-5 w-5" />}
                    <span className="capitalize">{activeTab}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeTab === 'accounts' && (
                    <div className="space-y-4">
                      {selectedUser.accounts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No accounts found</p>
                        </div>
                      ) : (
                        selectedUser.accounts.map((account) => (
                          <div key={account.id} className="border rounded-lg p-4">
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
                                      className="w-full p-2 border rounded-md"
                                      value={editForm.status || account.status}
                                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                    >
                                      <option value="ACTIVE">Active</option>
                                      <option value="FROZEN">Frozen</option>
                                      <option value="PENDING">Pending</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="nickname">Nickname</Label>
                                  <Input
                                    id="nickname"
                                    value={editForm.nickname || account.nickname || ''}
                                    onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                                    placeholder="Account nickname"
                                  />
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
                              <>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div>
                                      <h3 className="font-medium">{account.type} Account</h3>
                                      <p className="text-sm text-gray-500">{account.iban}</p>
                                      {account.nickname && (
                                        <p className="text-sm text-gray-600">"{account.nickname}"</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">{formatCurrency(account.balance, account.currency)}</p>
                                      <p className="text-sm text-gray-500">Balance</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getStatusBadge(account.status)}
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
                                <div className="mt-3 text-xs text-gray-500">
                                  Created: {formatDate(account.createdAt)}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'cards' && (
                    <div className="space-y-4">
                      {selectedUser.cards.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No cards found</p>
                        </div>
                      ) : (
                        selectedUser.cards.map((card) => (
                          <div key={card.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-medium">{card.type} Card</h3>
                                  <p className="text-sm text-gray-500">{card.maskedNumber}</p>
                                  <p className="text-sm text-gray-500">
                                    Expires: {card.expiryMonth}/{card.expiryYear}
                                  </p>
                                </div>
                                {card.creditLimit && (
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(card.creditLimit)}</p>
                                    <p className="text-sm text-gray-500">Credit Limit</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(card.status)}
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
                            <div className="mt-3 text-xs text-gray-500">
                              Created: {formatDate(card.createdAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'loans' && (
                    <div className="space-y-4">
                      {selectedUser.loans.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No loans found</p>
                        </div>
                      ) : (
                        selectedUser.loans.map((loan) => (
                          <div key={loan.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-medium">Loan #{loan.id}</h3>
                                  <p className="text-sm text-gray-500">
                                    Principal: {formatCurrency(loan.principal)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Interest: {(loan.interestRate * 100).toFixed(2)}% for {loan.termMonths} months
                                  </p>
                                  {loan.purpose && (
                                    <p className="text-sm text-gray-600">Purpose: {loan.purpose}</p>
                                  )}
                                </div>
                                {loan.monthlyPayment && (
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                                    <p className="text-sm text-gray-500">Monthly Payment</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(loan.status)}
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
                            <div className="mt-3 text-xs text-gray-500">
                              Created: {formatDate(loan.createdAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'transfers' && (
                    <div className="space-y-4">
                      {selectedUser.transfers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No transfers found</p>
                        </div>
                      ) : (
                        selectedUser.transfers.map((transfer) => (
                          <div key={transfer.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-medium">Transfer #{transfer.id}</h3>
                                  <p className="text-sm text-gray-500">To: {transfer.toIban}</p>
                                  {transfer.description && (
                                    <p className="text-sm text-gray-600">"{transfer.description}"</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatCurrency(transfer.amount, transfer.currency)}</p>
                                  <p className="text-sm text-gray-500">Amount</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(transfer.status)}
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                              Created: {formatDate(transfer.createdAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <h3 className="text-lg font-medium text-gray-900">Complete Request History</h3>
                        <p className="text-sm text-gray-500">All requests made by {selectedUser.name}</p>
                      </div>
                      
                      {/* Combined timeline of all requests */}
                      <div className="space-y-3">
                        {[
                          ...selectedUser.accounts.map(acc => ({ ...acc, type: 'ACCOUNT' as const })),
                          ...selectedUser.cards.map(card => ({ ...card, type: 'CARD' as const })),
                          ...selectedUser.loans.map(loan => ({ ...loan, type: 'LOAN' as const }))
                        ]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((item, index) => (
                          <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  {item.type === 'ACCOUNT' && <CreditCard className="h-5 w-5 text-blue-600" />}
                                  {item.type === 'CARD' && <Banknote className="h-5 w-5 text-green-600" />}
                                  {item.type === 'LOAN' && <FileText className="h-5 w-5 text-purple-600" />}
                                  <span className="font-medium">{item.type} Request</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p><strong>Requested:</strong> {formatDate(item.createdAt)}</p>
                                  {item.type === 'ACCOUNT' && (
                                    <p><strong>Type:</strong> {item.type} • <strong>IBAN:</strong> {item.iban}</p>
                                  )}
                                  {item.type === 'CARD' && (
                                    <p><strong>Type:</strong> {item.type} • <strong>Number:</strong> {item.maskedNumber}</p>
                                  )}
                                  {item.type === 'LOAN' && (
                                    <p><strong>Amount:</strong> {formatCurrency(item.principal)} • <strong>Term:</strong> {item.termMonths} months</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(item.status)}
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                            
                            {/* Status timeline */}
                            <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                              <span>Status History:</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <span>Requested</span>
                              </div>
                              {item.status !== 'PENDING' && (
                                <>
                                  <span>→</span>
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      item.status === 'APPROVED' || item.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                    <span>{item.status}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {selectedUser.accounts.length === 0 && selectedUser.cards.length === 0 && selectedUser.loans.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No requests found</p>
                            <p className="text-sm">This user hasn't made any requests yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a user to view their details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
