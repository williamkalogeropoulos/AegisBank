import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Plus, CreditCard, Shield, ShieldOff, Trash2, Edit, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface CardData {
  id: number
  userId: number
  accountId: number
  type: 'DEBIT' | 'CREDIT'
  maskedNumber: string
  expiryMonth: number
  expiryYear: number
  status: 'ACTIVE' | 'BLOCKED'
  creditLimit?: number
  createdAt: string
  updatedAt: string
}

interface Account {
  id: number
  type: 'CHECKING' | 'SAVINGS'
  iban: string
  balance: number
  status: 'ACTIVE' | 'FROZEN'
}

export const CardsPage = () => {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [cardType, setCardType] = useState<'DEBIT' | 'CREDIT'>('DEBIT')
  const [accountId, setAccountId] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const queryClient = useQueryClient()
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN'

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const response = await api.get('/api/cards')
      return response.data
    }
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      return response.data
    }
  })

  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const response = await api.post('/api/cards', cardData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      setShowCreateForm(false)
      setAccountId('')
      setCreditLimit('')
      setCardType('DEBIT')
    }
  })

  const updateCardStatusMutation = useMutation({
    mutationFn: async ({ cardId, status }: { cardId: number; status: 'ACTIVE' | 'BLOCKED' }) => {
      const response = await api.put(`/api/cards/${cardId}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    }
  })

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      console.log('Delete card mutation called for ID:', cardId)
      const response = await api.delete(`/api/cards/${cardId}`)
      console.log('Delete card response:', response)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      alert('Card deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Card deletion failed:', error)
      const message = error.response?.data?.message || error.message || 'Failed to delete card'
      alert(`Error: ${message}`)
    }
  })

  const handleCreateCard = () => {
    if (!accountId) return
    
    const cardData: any = {
      accountId: parseInt(accountId),
      type: cardType
    }
    
    if (cardType === 'CREDIT' && creditLimit) {
      cardData.creditLimit = parseFloat(creditLimit)
    }
    
    createCardMutation.mutate(cardData)
  }

  const handleToggleStatus = (card: CardData) => {
    const newStatus = card.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    updateCardStatusMutation.mutate({ cardId: card.id, status: newStatus })
  }

  const handleDeleteCard = (cardId: number) => {
    console.log('Delete card clicked for ID:', cardId)
    // Temporarily bypass confirmation to test the mutation
    console.log('Bypassing confirmation for testing - calling mutation directly')
    deleteCardMutation.mutate(cardId)
  }

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Cards</h1>
          <p className="text-blue-700">Manage your debit and credit cards</p>
        </div>
        <Button 
          variant="aegis" 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-aegis-blue to-aegis-blue-light hover:from-aegis-blue-dark hover:to-aegis-blue text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Card
        </Button>
      </div>

      {/* Create Card Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Card</CardTitle>
            <CardDescription>Add a new debit or credit card to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account">Account</Label>
                <select
                  id="account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an account</option>
                  {accounts.map((account: Account) => (
                    <option key={account.id} value={account.id}>
                      {account.type} - {account.iban} (€{account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="type">Card Type</Label>
                <select
                  id="type"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as 'DEBIT' | 'CREDIT')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="DEBIT">Debit Card</option>
                  <option value="CREDIT">Credit Card</option>
                </select>
              </div>
            </div>

            {cardType === 'CREDIT' && (
              <div>
                <Label htmlFor="creditLimit">Credit Limit (€)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="Enter credit limit"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={handleCreateCard}
                disabled={!accountId || (cardType === 'CREDIT' && !creditLimit)}
              >
                Create Card
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
          <p className="text-gray-500">Create your first card to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card: CardData) => (
            <Card key={card.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {card.type === 'DEBIT' ? 'Debit Card' : 'Credit Card'}
                    </CardTitle>
                    <CardDescription>{card.maskedNumber}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(card)}
                      disabled={card.status === 'CANCELLED'}
                    >
                      {card.status === 'ACTIVE' ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <ShieldOff className="h-4 w-4" />
                      )}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Delete card button clicked!')
                          handleDeleteCard(card.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Cancelled Card Notice */}
                {card.status === 'CANCELLED' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-800 font-medium">
                        This card has been cancelled by an administrator
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Expires</span>
                    <span className="text-sm font-medium">
                      {formatExpiryDate(card.expiryMonth, card.expiryYear)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-sm font-medium ${
                      card.status === 'ACTIVE' ? 'text-green-600' 
                      : card.status === 'CANCELLED' ? 'text-orange-600'
                      : 'text-red-600'
                    }`}>
                      {card.status}
                    </span>
                  </div>

                  {card.type === 'CREDIT' && card.creditLimit && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Credit Limit</span>
                      <span className="text-sm font-medium">
                        €{card.creditLimit.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

