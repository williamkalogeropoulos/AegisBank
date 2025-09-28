import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ConfirmationDialog } from '../components/ui/confirmation-dialog'
import { ArrowLeftRight, Plus, Euro, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import api from '../lib/api'

interface Account {
  id: number
  type: 'CHECKING' | 'SAVINGS'
  iban: string
  balance: number
  currency: string
  status: 'ACTIVE' | 'FROZEN'
}

interface Transfer {
  id: number
  fromAccountId: number
  fromAccountIban: string
  toIban: string
  amount: number
  fee: number
  totalAmount: number
  currency: string
  description: string
  category?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  type: 'EXTERNAL' | 'INTERNAL' | 'INTER_ACCOUNT'
  createdAt: string
  updatedAt: string
}

export const TransfersPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)
  const [fromAccountId, setFromAccountId] = useState('')
  const [toIban, setToIban] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [transferType, setTransferType] = useState<'EXTERNAL' | 'INTERNAL' | 'INTER_ACCOUNT'>('EXTERNAL')
  const [showProcessConfirm, setShowProcessConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [transferToProcess, setTransferToProcess] = useState<Transfer | null>(null)
  const [transferToDelete, setTransferToDelete] = useState<Transfer | null>(null)
  const queryClient = useQueryClient()

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      return response.data
    }
  })

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const response = await api.get('/api/transfers')
      return response.data
    }
  })

  const createTransferMutation = useMutation({
    mutationFn: async (transferData: any) => {
      const response = await api.post('/api/transfers', transferData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowCreateForm(false)
      setFromAccountId('')
      setToIban('')
      setToAccountId('')
      setAmount('')
      setDescription('')
      setCategory('')
      setTransferType('EXTERNAL')
    }
  })

  const updateTransferMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: number, updateData: any }) => {
      const response = await api.put(`/api/transfers/${id}`, updateData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowEditForm(false)
      setEditingTransfer(null)
      resetForm()
      alert('Transfer updated successfully!')
    },
    onError: (error: any) => {
      console.error('Transfer update failed:', error)
      const message = error.response?.data?.message || error.message || 'Failed to update transfer'
      alert(`Error: ${message}`)
    }
  })

  const deleteTransferMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Delete mutation called for ID:', id)
      const response = await api.delete(`/api/transfers/${id}`)
      console.log('Delete response:', response)
      return response
    },
    onSuccess: () => {
      console.log('Transfer deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      alert('Transfer deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Transfer deletion failed:', error)
      let message = 'Failed to delete transfer'
      
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.status === 403) {
        message = 'You do not have permission to delete this transfer'
      } else if (error.response?.status === 404) {
        message = 'Transfer not found'
      } else if (error.response?.status === 400) {
        message = 'Cannot delete this transfer (may already be completed)'
      } else if (error.message) {
        message = error.message
      }
      
      alert(`Error: ${message}`)
    }
  })

  const processTransferMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Process mutation called for ID:', id)
      const response = await api.post(`/api/transfers/${id}/process`)
      console.log('Process response:', response)
      return response.data
    },
    onSuccess: () => {
      console.log('Transfer processed successfully')
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      alert('Transfer processed successfully!')
    },
    onError: (error: any) => {
      console.error('Transfer processing failed:', error)
      let message = 'Failed to process transfer'
      
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.status === 403) {
        message = 'You do not have permission to process transfers (Admin access required)'
      } else if (error.response?.status === 404) {
        message = 'Transfer not found'
      } else if (error.response?.status === 400) {
        message = 'Cannot process this transfer (may already be completed or insufficient funds)'
      } else if (error.message) {
        message = error.message
      }
      
      alert(`Error: ${message}`)
    }
  })

  const resetForm = () => {
    setFromAccountId('')
    setToIban('')
    setToAccountId('')
    setAmount('')
    setDescription('')
    setCategory('')
    setTransferType('EXTERNAL')
  }

  const handleCreateTransfer = () => {
    if (!fromAccountId || !toIban || !amount) return
    
    const transferData: any = {
      fromAccountId: parseInt(fromAccountId),
      toIban,
      amount: parseFloat(amount),
      description,
      category,
      type: transferType
    }
    
    // Add toAccountId for inter-account transfers
    if (transferType === 'INTER_ACCOUNT' && toAccountId) {
      transferData.toAccountId = parseInt(toAccountId)
    }
    
    createTransferMutation.mutate(transferData)
  }

  const handleEditTransfer = (transfer: Transfer) => {
    setEditingTransfer(transfer)
    setFromAccountId(transfer.fromAccountId.toString())
    setToIban(transfer.toIban)
    setAmount(transfer.amount.toString())
    setDescription(transfer.description || '')
    setCategory(transfer.category || '')
    setTransferType(transfer.type)
    setShowEditForm(true)
  }

  const handleUpdateTransfer = () => {
    if (!editingTransfer || !amount) return
    
    const updateData = {
      amount: parseFloat(amount),
      description: description || '',
      category: category || '',
      status: editingTransfer.status
    }
    
    updateTransferMutation.mutate({ id: editingTransfer.id, updateData })
  }

  const handleDeleteTransfer = (transfer: Transfer) => {
    console.log('Delete transfer clicked for ID:', transfer.id)
    setTransferToDelete(transfer)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTransfer = () => {
    if (transferToDelete) {
      console.log('User confirmed deletion - calling mutation')
      deleteTransferMutation.mutate(transferToDelete.id)
      setShowDeleteConfirm(false)
      setTransferToDelete(null)
    }
  }

  const cancelDeleteTransfer = () => {
    console.log('User cancelled deletion')
    setShowDeleteConfirm(false)
    setTransferToDelete(null)
  }

  const handleProcessTransfer = (transfer: Transfer) => {
    console.log('Process transfer clicked for ID:', transfer.id)
    setTransferToProcess(transfer)
    setShowProcessConfirm(true)
  }

  const confirmProcessTransfer = () => {
    if (transferToProcess) {
      console.log('User confirmed processing - calling mutation')
      processTransferMutation.mutate(transferToProcess.id)
      setShowProcessConfirm(false)
      setTransferToProcess(null)
    }
  }

  const cancelProcessTransfer = () => {
    console.log('User cancelled processing')
    setShowProcessConfirm(false)
    setTransferToProcess(null)
  }

  // Remove loading spinner - show content immediately

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600">Send money between accounts and track your transfers</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          variant="hellenic"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Edit Transfer Form */}
      {showEditForm && editingTransfer && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Transfer</CardTitle>
            <CardDescription>
              Update transfer details (only pending transfers can be edited)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <select
                  value={transferType}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100"
                >
                  <option value="EXTERNAL">External Bank (€0.50 fee)</option>
                  <option value="INTERNAL">Aegis Bank Internal (Free)</option>
                  <option value="INTER_ACCOUNT">My Own Accounts (Free)</option>
                </select>
                <p className="text-xs text-gray-500">Transfer type cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label>From Account</Label>
                <select
                  value={fromAccountId}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((account: Account) => account.status === 'ACTIVE')
                    .map((account: Account) => (
                      <option key={account.id} value={account.id}>
                        {account.type} - {account.iban} (€{account.balance.toLocaleString()})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">Source account cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label>To IBAN</Label>
                <Input
                  value={toIban}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Destination IBAN cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
                {transferType === 'EXTERNAL' && amount && (
                  <p className="text-sm text-orange-600">
                    Total cost: €{(parseFloat(amount) + 0.50).toFixed(2)} (including €0.50 fee)
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Transfer description"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Groceries, Rent, etc."
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleUpdateTransfer}
                disabled={updateTransferMutation.isPending || !amount}
                variant="hellenic"
              >
                {updateTransferMutation.isPending ? 'Updating...' : 'Update Transfer'}
              </Button>
              <Button 
                onClick={() => {
                  setShowEditForm(false)
                  setEditingTransfer(null)
                  resetForm()
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Transfer Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Transfer</CardTitle>
            <CardDescription>
              Transfer money from your account to another account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as 'EXTERNAL' | 'INTERNAL' | 'INTER_ACCOUNT')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="EXTERNAL">External Bank (€0.50 fee)</option>
                  <option value="INTERNAL">Aegis Bank Internal (Free)</option>
                  <option value="INTER_ACCOUNT">My Own Accounts (Free)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>From Account</Label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((account: Account) => account.status === 'ACTIVE')
                    .map((account: Account) => (
                      <option key={account.id} value={account.id}>
                        {account.type} - {account.iban} (€{account.balance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>
              
              {transferType === 'INTER_ACCOUNT' ? (
                <div className="space-y-2">
                  <Label>To Account</Label>
                  <select
                    value={toAccountId}
                    onChange={(e) => {
                      setToAccountId(e.target.value)
                      const selectedAccount = accounts.find((acc: Account) => acc.id === parseInt(e.target.value))
                      if (selectedAccount) {
                        setToIban(selectedAccount.iban)
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select destination account</option>
                    {accounts
                      .filter((account: Account) => account.status === 'ACTIVE' && account.id !== parseInt(fromAccountId))
                      .map((account: Account) => (
                        <option key={account.id} value={account.id}>
                          {account.type} - {account.iban} (€{account.balance.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>To IBAN</Label>
                  <Input
                    value={toIban}
                    onChange={(e) => setToIban(e.target.value)}
                    placeholder="Enter recipient IBAN"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
                {transferType === 'EXTERNAL' && amount && (
                  <p className="text-sm text-orange-600">
                    Total cost: €{(parseFloat(amount) + 0.50).toFixed(2)} (including €0.50 fee)
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Transfer description"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category (Optional)</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Groceries, Rent, etc."
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateTransfer}
                disabled={createTransferMutation.isPending || !fromAccountId || !toIban || !amount}
                variant="hellenic"
              >
                {createTransferMutation.isPending ? 'Processing...' : 'Create Transfer'}
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

      {/* Transfers List */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>
            All your transfers and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers yet</h3>
              <p className="text-gray-500 mb-4">Create your first transfer to get started</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                variant="hellenic"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Transfer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer: Transfer) => {
                console.log('Rendering transfer:', transfer.id, 'Status:', transfer.status)
                return (
                <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transfer.type === 'EXTERNAL' ? 'bg-orange-100' :
                      transfer.type === 'INTERNAL' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <ArrowLeftRight className={`h-5 w-5 ${
                        transfer.type === 'EXTERNAL' ? 'text-orange-600' :
                        transfer.type === 'INTERNAL' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {transfer.type === 'INTER_ACCOUNT' ? 'Transfer to own account' : 
                         transfer.type === 'INTERNAL' ? 'Aegis Bank transfer' : 'External transfer'} 
                        to {transfer.toIban}
                      </p>
                      <p className="text-sm text-gray-500">{transfer.description || 'No description'}</p>
                      {transfer.category && (
                        <p className="text-xs text-blue-600">Category: {transfer.category}</p>
                      )}
                      <p className="text-xs text-blue-500">
                        {new Date(transfer.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">-€{transfer.amount.toLocaleString()}</p>
                      {transfer.fee > 0 && (
                        <p className="text-sm text-orange-600">Fee: €{transfer.fee.toFixed(2)}</p>
                      )}
                      <p className="text-sm text-gray-500">Total: €{transfer.totalAmount.toLocaleString()}</p>
                      <p className={`text-sm ${
                        transfer.status === 'COMPLETED' ? 'text-green-600' :
                        transfer.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {transfer.status}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {transfer.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTransfer(transfer)}
                            disabled={updateTransferMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log('Delete button clicked!')
                              handleDeleteTransfer(transfer)
                            }}
                            disabled={deleteTransferMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="hellenic"
                            onClick={() => {
                              console.log('Process button clicked!')
                              handleProcessTransfer(transfer)
                            }}
                            disabled={processTransferMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        </>
                      )}
                      {transfer.status === 'COMPLETED' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Completed</span>
                        </div>
                      )}
                      {transfer.status === 'FAILED' && (
                        <div className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Transfer Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showProcessConfirm}
        onClose={cancelProcessTransfer}
        onConfirm={confirmProcessTransfer}
        title="Process Transfer"
        description={`Are you sure you want to process this transfer? This will complete the transaction and update account balances.${transferToProcess ? `\n\nAmount: €${transferToProcess.amount}\nTo: ${transferToProcess.toIban}` : ''}`}
        confirmText="Process Transfer"
        cancelText="Cancel"
        variant="default"
        isLoading={processTransferMutation.isPending}
      />

      {/* Delete Transfer Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteTransfer}
        onConfirm={confirmDeleteTransfer}
        title="Delete Transfer"
        description={`Are you sure you want to delete this transfer? This action cannot be undone.${transferToDelete ? `\n\nAmount: €${transferToDelete.amount}\nTo: ${transferToDelete.toIban}` : ''}`}
        confirmText="Delete Transfer"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteTransferMutation.isPending}
      />
    </div>
  )
}


