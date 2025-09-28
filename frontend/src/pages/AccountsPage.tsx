import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { ConfirmationDialog } from '../components/ui/confirmation-dialog'
import { 
  CreditCard, 
  Plus,
  Euro,
  TrendingUp,
  TrendingDown,
  Edit,
  Eye,
  Trash2,
  Shield,
  ShieldOff,
  ArrowLeftRight,
  Calendar,
  User,
  Download,
  Search,
  Filter,
  Copy,
  Check,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface Account {
  id: number
  type: 'CHECKING' | 'SAVINGS' | 'LOAN'
  iban: string
  balance: number
  currency: string
  status: 'PENDING' | 'ACTIVE' | 'FROZEN' | 'CANCELLED'
  nickname?: string
  createdAt: string
  updatedAt?: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface Transfer {
  id: number
  fromAccountId: number
  toIban: string
  amount: number
  currency: string
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export const AccountsPage = () => {
  // TEST: This should always be visible
  console.log('AccountsPage component rendering')
  
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [accountType, setAccountType] = useState<'CHECKING' | 'SAVINGS'>('CHECKING')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [accountNickname, setAccountNickname] = useState('')
  const [editBalance, setEditBalance] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [accountToDeletePermanently, setAccountToDeletePermanently] = useState<Account | null>(null)
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft')
  const [editFormLocation, setEditFormLocation] = useState<'main' | 'details' | null>(null)
  const [showSimpleEditForm, setShowSimpleEditForm] = useState(false)
  const [simpleEditAccount, setSimpleEditAccount] = useState<Account | null>(null)
  const queryClient = useQueryClient()
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN'

  // Effect to handle edit form state changes
  useEffect(() => {
    console.log('useEffect triggered - editAccount:', editAccount, 'showEditForm:', showEditForm, 'selectedAccount:', selectedAccount)
  }, [editAccount, showEditForm, selectedAccount])

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      return response.data
    }
  })

  // Fetch transfers for selected account
  const { data: accountTransfers = [] } = useQuery({
    queryKey: ['account-transfers', selectedAccount?.id],
    queryFn: async () => {
      if (!selectedAccount) return []
      const response = await api.get('/api/transfers')
      return response.data.filter((transfer: Transfer) => 
        transfer.fromAccountId === selectedAccount.id
      )
    },
    enabled: !!selectedAccount
  })

  const createAccountMutation = useMutation({
    mutationFn: async (type: 'CHECKING' | 'SAVINGS') => {
      const response = await api.post('/api/accounts', { type })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowCreateForm(false)
    }
  })

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Account> }) => {
      console.log('Updating account:', id, 'with updates:', updates)
      const response = await api.put(`/api/accounts/${id}`, updates)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Account updated successfully:', data)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      
      // Update selectedAccount if we're viewing account details
      if (selectedAccount && data.id === selectedAccount.id) {
        console.log('Updating selectedAccount with new data')
        setSelectedAccount(data)
        // Also update editAccount if we're editing
        if (editAccount && editAccount.id === data.id) {
          setEditAccount(data)
        }
      }
      
      // Close edit form after successful update
      setShowEditForm(false)
      setEditAccount(null)
      setEditFormLocation(null)
      setShowSimpleEditForm(false)
      setSimpleEditAccount(null)
    },
    onError: (error) => {
      console.error('Account update failed:', error)
      alert('Failed to update account. Please try again.')
    }
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('deleteAccountMutation.mutationFn called with id:', id)
      console.log('Making DELETE request to:', `/api/accounts/${id}`)
      const response = await api.delete(`/api/accounts/${id}`)
      console.log('Delete response:', response)
      return response
    },
    onSuccess: () => {
      console.log('Account deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setSelectedAccount(null)
    },
    onError: (error) => {
      console.error('Delete failed:', error)
      alert('Failed to delete account. Please try again.')
    }
  })

  const deleteAccountPermanentlyMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('deleteAccountPermanentlyMutation.mutationFn called with id:', id)
      console.log('Making DELETE request to:', `/api/accounts/${id}/permanent`)
      const response = await api.delete(`/api/accounts/${id}/permanent`)
      console.log('Permanent delete response:', response)
      return response
    },
    onSuccess: () => {
      console.log('Account deleted permanently successfully')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setSelectedAccount(null)
    },
    onError: (error) => {
      console.error('Permanent delete failed:', error)
      alert('Failed to delete account permanently. Please try again.')
    }
  })

  const handleCreateAccount = () => {
    createAccountMutation.mutate(accountType)
  }

  const handleEditAccount = (account: Account) => {
    console.log('Edit account clicked for account:', account.id)
    
    // Set up the edit form
    setSimpleEditAccount(account)
    setAccountNickname(account.nickname || account.iban) // Use nickname if available, otherwise IBAN
    setEditBalance(account.balance.toString())
    setShowSimpleEditForm(true)
    console.log('Edit form should now be visible')
  }

  const handleUpdateAccount = () => {
    if (!editAccount) return
    
    const updates: any = { 
      type: editAccount.type 
    }
    
    // Include nickname if it's different
    if (accountNickname !== (editAccount.nickname || editAccount.iban)) {
      updates.nickname = accountNickname
    }
    
    // Only include balance if it's different and valid
    const newBalance = parseFloat(editBalance)
    if (!isNaN(newBalance) && newBalance !== editAccount.balance) {
      updates.balance = newBalance
    }
    
    console.log('Sending updates:', updates)
    updateAccountMutation.mutate({
      id: editAccount.id,
      updates
    })
  }

  const handleToggleAccountStatus = (account: Account) => {
    console.log('Toggle account status clicked for account:', account.id)
    let newStatus: 'ACTIVE' | 'FROZEN'
    
    if (account.status === 'ACTIVE') {
      newStatus = 'FROZEN'
    } else if (account.status === 'FROZEN') {
      newStatus = 'ACTIVE'
    } else {
      // For PENDING or CANCELLED accounts, don't allow freeze/unfreeze
      console.log('Cannot toggle status for account with status:', account.status)
      return
    }
    
    console.log('Changing status from', account.status, 'to', newStatus)
    updateAccountMutation.mutate({
      id: account.id,
      updates: { status: newStatus }
    })
  }

  const handleApproveAccount = (account: Account) => {
    console.log('Approve account clicked for account:', account.id)
    updateAccountMutation.mutate({
      id: account.id,
      updates: { status: 'ACTIVE' }
    })
  }

  const handleDeleteAccount = (account: Account) => {
    console.log('Delete account clicked for account:', account.id)
    setAccountToDelete(account)
    setDeleteType('soft')
    setShowDeleteConfirm(true)
  }

  const handleDeleteAccountPermanently = (account: Account) => {
    console.log('Delete forever clicked for account:', account.id)
    setAccountToDeletePermanently(account)
    setShowPermanentDeleteConfirm(true)
  }

  const confirmPermanentDelete = () => {
    if (accountToDeletePermanently) {
      console.log('User confirmed permanent deletion - calling mutation')
      deleteAccountPermanentlyMutation.mutate(accountToDeletePermanently.id)
      setShowPermanentDeleteConfirm(false)
      setAccountToDeletePermanently(null)
    }
  }

  const cancelPermanentDelete = () => {
    console.log('User cancelled permanent deletion')
    setShowPermanentDeleteConfirm(false)
    setAccountToDeletePermanently(null)
  }

  const confirmDelete = () => {
    if (accountToDelete) {
      if (deleteType === 'permanent') {
        console.log('User confirmed permanent deletion, calling mutation')
        deleteAccountPermanentlyMutation.mutate(accountToDelete.id)
      } else {
        console.log('User confirmed soft deletion, calling mutation')
        deleteAccountMutation.mutate(accountToDelete.id)
      }
      setShowDeleteConfirm(false)
      setAccountToDelete(null)
    }
  }

  const cancelDelete = () => {
    console.log('User cancelled deletion')
    setShowDeleteConfirm(false)
    setAccountToDelete(null)
  }

  const handleViewAccountDetails = (account: Account) => {
    setSelectedAccount(account)
    setShowEditForm(false)
    setEditAccount(null)
    setEditFormLocation(null)
  }

  const handleBackToList = () => {
    setSelectedAccount(null)
    setShowEditForm(false)
    setEditAccount(null)
    setEditFormLocation(null)
  }

  // Account Details View
  if (selectedAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBackToList} variant="outline" size="sm">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Account Details</h1>
            <p className="text-blue-900-light">{selectedAccount.type} Account - {selectedAccount.iban}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-blue-900-light">Account Type</span>
                <span className="font-medium">{selectedAccount.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-900-light">IBAN</span>
                <span className="font-mono text-sm">{selectedAccount.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-900-light">Balance</span>
                <div className="flex items-center space-x-1">
                  <Euro className="h-4 w-4 text-blue-900-light" />
                  <span className="text-xl font-bold">{selectedAccount.balance.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-900-light">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedAccount.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedAccount.status === 'FROZEN'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedAccount.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : selectedAccount.status === 'CANCELLED'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAccount.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-900-light">Created</span>
                <span className="text-sm">{new Date(selectedAccount.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Account Form - Show in account details view (Admin only) */}
        {isAdmin && showEditForm && editAccount && selectedAccount && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Account</CardTitle>
              <CardDescription>
                Update account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountNickname">Account Nickname</Label>
                <Input
                  id="accountNickname"
                  value={accountNickname}
                  onChange={(e) => setAccountNickname(e.target.value)}
                  placeholder="Enter account nickname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBalance">Account Balance (€)</Label>
                <Input
                  id="editBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  placeholder="Enter new balance"
                />
                <p className="text-xs text-blue-900-light">Only admins can modify account balances</p>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex space-x-4">
                  <Button
                    variant={editAccount.type === 'CHECKING' ? 'default' : 'outline'}
                    onClick={() => setEditAccount({...editAccount, type: 'CHECKING'})}
                    size="sm"
                  >
                    Checking
                  </Button>
                  <Button
                    variant={editAccount.type === 'SAVINGS' ? 'default' : 'outline'}
                    onClick={() => setEditAccount({...editAccount, type: 'SAVINGS'})}
                    size="sm"
                  >
                    Savings
                  </Button>
                  <Button
                    variant={editAccount.type === 'LOAN' ? 'default' : 'outline'}
                    onClick={() => setEditAccount({...editAccount, type: 'LOAN'})}
                    size="sm"
                  >
                    Loan
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleUpdateAccount}
                  disabled={updateAccountMutation.isPending}
                >
                  {updateAccountMutation.isPending ? 'Updating...' : 'Update Account'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowEditForm(false)
                    setEditAccount(null)
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent transfers from this account</CardDescription>
          </CardHeader>
          <CardContent>
            {accountTransfers.length === 0 ? (
              <div className="text-center py-8">
                <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accountTransfers.slice(0, 10).map((transfer: Transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Transfer to {transfer.toIban}</p>
                      <p className="text-sm text-gray-500">{transfer.description || 'No description'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-€{transfer.amount.toLocaleString()}</p>
                      <p className={`text-xs ${
                        transfer.status === 'COMPLETED' ? 'text-green-600' :
                        transfer.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {transfer.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Edit Account Form (Admin only) */}
      {isAdmin && showSimpleEditForm && simpleEditAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Account</CardTitle>
            <CardDescription>
              Update account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNickname">Account Nickname</Label>
              <Input
                id="accountNickname"
                value={accountNickname}
                onChange={(e) => setAccountNickname(e.target.value)}
                placeholder="Enter account nickname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBalance">Account Balance (€)</Label>
              <Input
                id="editBalance"
                type="number"
                step="0.01"
                min="0"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                placeholder="Enter new balance"
              />
              <p className="text-xs text-gray-500">Only admins can modify account balances</p>
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex space-x-4">
                <Button
                  variant={simpleEditAccount.type === 'CHECKING' ? 'default' : 'outline'}
                  onClick={() => setSimpleEditAccount({...simpleEditAccount, type: 'CHECKING'})}
                  size="sm"
                >
                  Checking
                </Button>
                <Button
                  variant={simpleEditAccount.type === 'SAVINGS' ? 'default' : 'outline'}
                  onClick={() => setSimpleEditAccount({...simpleEditAccount, type: 'SAVINGS'})}
                  size="sm"
                >
                  Savings
                </Button>
                <Button
                  variant={simpleEditAccount.type === 'LOAN' ? 'default' : 'outline'}
                  onClick={() => setSimpleEditAccount({...simpleEditAccount, type: 'LOAN'})}
                  size="sm"
                >
                  Loan
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  if (simpleEditAccount) {
                    const updates: any = { 
                      type: simpleEditAccount.type 
                    }
                    
                    // Include nickname if it's different
                    if (accountNickname !== (simpleEditAccount.nickname || simpleEditAccount.iban)) {
                      updates.nickname = accountNickname
                    }
                    
                    // Only include balance if it's different and valid
                    const newBalance = parseFloat(editBalance)
                    if (!isNaN(newBalance) && newBalance !== simpleEditAccount.balance) {
                      updates.balance = newBalance
                    }
                    
                    console.log('Sending updates:', updates)
                    updateAccountMutation.mutate({
                      id: simpleEditAccount.id,
                      updates
                    })
                  }
                }}
                disabled={updateAccountMutation.isPending}
              >
                {updateAccountMutation.isPending ? 'Updating...' : 'Update Account'}
              </Button>
              <Button 
                onClick={() => {
                  setShowSimpleEditForm(false)
                  setSimpleEditAccount(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-800/5 rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Your Accounts</h1>
              <p className="text-lg text-blue-700">Manage your bank accounts and view balances</p>
            </div>
            <div className="mt-6 lg:mt-0">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Account Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Account</CardTitle>
            <CardDescription>
              Choose the type of account you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex space-x-4">
                <Button
                  variant={accountType === 'CHECKING' ? 'default' : 'outline'}
                  onClick={() => setAccountType('CHECKING')}
                  className="flex-1"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Checking
                </Button>
                <Button
                  variant={accountType === 'SAVINGS' ? 'default' : 'outline'}
                  onClick={() => setAccountType('SAVINGS')}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Savings
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateAccount}
                disabled={createAccountMutation.isPending}
                variant="hellenic"
              >
                {createAccountMutation.isPending ? 'Creating...' : 'Create Account'}
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-500 mb-4">Create your first account to get started</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              variant="hellenic"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        ) : (
          accounts.map((account: Account) => (
            <div key={account.id} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-600-light/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        account.type === 'CHECKING' 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-600-light' 
                          : account.type === 'SAVINGS'
                          ? 'bg-gradient-to-br from-blue-600-light to-blue-600-dark'
                          : 'bg-gradient-to-br from-blue-600-dark to-blue-600'
                      }`}>
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-blue-900">
                          {account.nickname || account.type}
                        </CardTitle>
                        <CardDescription className="text-blue-900-light font-mono text-sm">
                          {account.iban}
                        </CardDescription>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      account.status === 'ACTIVE' 
                        ? 'bg-blue-600/10 text-blue-600' 
                        : account.status === 'FROZEN'
                        ? 'bg-blue-100 text-blue-600'
                        : account.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-600'
                        : account.status === 'CANCELLED'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        account.status === 'ACTIVE' 
                          ? 'bg-blue-600' 
                          : account.status === 'FROZEN'
                          ? 'bg-blue-500'
                          : account.status === 'PENDING'
                          ? 'bg-yellow-500'
                          : account.status === 'CANCELLED'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}></div>
                      {account.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900-light font-medium">Balance</span>
                      <div className="flex items-center space-x-2">
                        <Euro className="h-5 w-5 text-blue-600" />
                        <span className="text-3xl font-bold text-blue-900">€{account.balance.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-blue-900-light">
                      Created: {new Date(account.createdAt).toLocaleDateString()}
                    </div>
                  
                    {/* Pending Account Notice */}
                    {account.status === 'PENDING' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 font-medium">
                            This account is pending approval by an administrator
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Cancelled Account Notice */}
                    {account.status === 'CANCELLED' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-800 font-medium">
                            This account has been cancelled by an administrator
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <Button
                        onClick={() => handleViewAccountDetails(account)}
                        variant="outline"
                        size="sm"
                        disabled={account.status === 'CANCELLED'}
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {isAdmin && (
                        <Button
                          onClick={() => handleEditAccount(account)}
                          variant="outline"
                          size="sm"
                          className="border-blue-600-light text-blue-600-light hover:bg-blue-600-light hover:text-white rounded-xl font-medium"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {/* Freeze/Unfreeze button - only for ACTIVE/FROZEN accounts */}
                      {(account.status === 'ACTIVE' || account.status === 'FROZEN') && (
                        <Button
                          onClick={() => handleToggleAccountStatus(account)}
                          variant="outline"
                          size="sm"
                          className={account.status === 'ACTIVE' 
                            ? "border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-medium"
                            : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-medium"
                          }
                          title={account.status === 'ACTIVE' ? 'Freeze Account - Prevents all transactions' : 'Unfreeze Account - Restore normal operations'}
                        >
                          {account.status === 'ACTIVE' ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Freeze
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Unfreeze
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Approve button - only for PENDING accounts and admin only */}
                      {account.status === 'PENDING' && isAdmin && (
                        <Button
                          onClick={() => handleApproveAccount(account)}
                          variant="default"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                          title="Approve Account - Activate the account for use"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          onClick={() => handleDeleteAccountPermanently(account)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
                          title="Delete Forever - Permanently removes account and all data"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md mx-4">
            <CardHeader>
              <CardTitle className={deleteType === 'permanent' ? 'text-red-600' : 'text-orange-600'}>
                {deleteType === 'permanent' ? '⚠️ Delete Account Forever' : '🗑️ Delete Account'}
              </CardTitle>
              <CardDescription>
                {deleteType === 'permanent' ? 'This action cannot be undone!' : 'This will deactivate the account.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You are about to <strong>{deleteType === 'permanent' ? 'permanently delete' : 'delete'}</strong> the following account:
                </p>
                <div className="bg-gray-50 p-3 rounded border">
                  <p><strong>Type:</strong> {accountToDelete.type}</p>
                  <p><strong>IBAN:</strong> {accountToDelete.iban}</p>
                  <p><strong>Balance:</strong> €{accountToDelete.balance}</p>
                  {accountToDelete.nickname && (
                    <p><strong>Nickname:</strong> {accountToDelete.nickname}</p>
                  )}
                </div>
                {deleteType === 'permanent' ? (
                  <p className="text-sm text-red-600 font-medium">
                    This will delete ALL associated data including cards, transfers, and transaction history.
                  </p>
                ) : (
                  <p className="text-sm text-orange-600 font-medium">
                    The account will be deactivated and hidden from your account list.
                  </p>
                )}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={confirmDelete}
                    variant="destructive"
                    className={`flex-1 ${deleteType === 'permanent' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteType === 'permanent' ? 'Delete Forever' : 'Delete Account'}
                  </Button>
                  <Button
                    onClick={cancelDelete}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showPermanentDeleteConfirm}
        onClose={cancelPermanentDelete}
        onConfirm={confirmPermanentDelete}
        title="⚠️ Delete Account Forever"
        description={`Are you sure you want to permanently delete this account? This action cannot be undone and will delete ALL associated data including cards, transfers, and transaction history.${accountToDeletePermanently ? `\n\nAccount: ${accountToDeletePermanently.type} - ${accountToDeletePermanently.iban}\nBalance: €${accountToDeletePermanently.balance}` : ''}`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteAccountPermanentlyMutation.isPending}
      />
    </div>
  )
}