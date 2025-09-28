import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, Euro, Calendar, Percent, UserCheck, UserX } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface Loan {
  id: number
  userId: number
  userEmail: string
  principal: number
  interestRate: number
  termMonths: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID'
  monthlyPayment: number
  purpose?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export const LoansPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [principal, setPrincipal] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [termMonths, setTermMonths] = useState('')
  const [purpose, setPurpose] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await api.get('/api/loans')
      return response.data
    }
  })

  const createLoanMutation = useMutation({
    mutationFn: async (loanData: any) => {
      // Admin should use the same endpoint as users for consistency
      const response = await api.post('/api/loans', loanData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      setShowCreateForm(false)
      setPrincipal('')
      setInterestRate('')
      setTermMonths('')
      setPurpose('')
    },
    onError: (error: any) => {
      console.error('Loan creation failed:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message
      alert('Failed to create loan: ' + errorMessage)
    }
  })

  const cancelLoanMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const response = await api.put(`/api/loans/${loanId}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    }
  })

  const deleteLoanMutation = useMutation({
    mutationFn: async (loanId: number) => {
      await api.delete(`/api/loans/${loanId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    }
  })

  const approveLoanMutation = useMutation({
    mutationFn: async ({ loanId, notes }: { loanId: number; notes?: string }) => {
      const response = await api.put(`/api/loans/admin/${loanId}/status`, {
        status: 'APPROVED',
        adminNotes: notes
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    }
  })

  const rejectLoanMutation = useMutation({
    mutationFn: async ({ loanId, notes }: { loanId: number; notes?: string }) => {
      const response = await api.put(`/api/loans/admin/${loanId}/status`, {
        status: 'REJECTED',
        adminNotes: notes
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    }
  })

  const handleCreateLoan = () => {
    if (!principal || !interestRate || !termMonths) return
    
    const principalAmount = parseFloat(principal)
    
    // Client-side validation
    if (principalAmount < 100) {
      alert('Minimum loan amount is €100. Please enter a higher amount.')
      return
    }
    
    if (parseFloat(interestRate) < 0) {
      alert('Interest rate cannot be negative.')
      return
    }
    
    if (parseFloat(interestRate) > 25) {
      alert('Interest rate cannot exceed 25%.')
      return
    }
    
    if (parseInt(termMonths) < 1) {
      alert('Loan term must be at least 1 month.')
      return
    }
    
    // Validate loan amount limits
    if (principalAmount > 1000000) {
      alert('Maximum loan amount is €1,000,000.')
      return
    }
    
    const loanData = {
      principal: principalAmount,
      interestRate: parseFloat(interestRate) / 100, // Convert percentage to decimal
      termMonths: parseInt(termMonths),
      purpose: purpose || undefined
    }
    
    console.log('Sending loan data:', loanData) // Debug log
    createLoanMutation.mutate(loanData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'ACTIVE': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertTriangle className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Loans</h1>
            <p className="text-blue-700">Apply for loans and manage your applications</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading loans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Loans</h1>
          <p className="text-blue-700">Apply for loans and manage your applications</p>
        </div>
        <Button 
          variant="aegis" 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-aegis-blue to-aegis-blue-light hover:from-aegis-blue-dark hover:to-aegis-blue text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'Apply for Loan'}
        </Button>
      </div>

      {/* Admin Notes Input */}
      {user?.role === 'ADMIN' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="adminNotes" className="text-sm font-medium">
                Admin Notes (for loan decisions):
              </Label>
              <Input
                id="adminNotes"
                type="text"
                placeholder="Enter notes for loan approval/rejection..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Loan Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for a New Loan</CardTitle>
            <CardDescription>
              Fill out the form below to apply for a loan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Principal Amount (€)</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="principal"
                    type="number"
                    placeholder="10000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="pl-10"
                    min="100"
                    max="100000"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500">Minimum: €100, Maximum: €100,000</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="interestRate"
                    type="number"
                    placeholder="5.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="pl-10"
                    min="0"
                    max="25"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500">Maximum: 25%</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="termMonths">Term (Months)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="termMonths"
                    type="number"
                    placeholder="60"
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    className="pl-10"
                    min="1"
                    max="360"
                  />
                </div>
                <p className="text-sm text-gray-500">Maximum: 360 months (30 years)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose (Optional)</Label>
                <Input
                  id="purpose"
                  type="text"
                  placeholder="Home improvement, car purchase, etc."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateLoan}
                disabled={createLoanMutation.isPending}
                className="flex-1"
              >
                {createLoanMutation.isPending ? 'Applying...' : 'Apply for Loan'}
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

      {/* Loans List */}
      <div className="space-y-4">
        {loans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
              <p className="text-gray-500">You haven't applied for any loans yet.</p>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan: Loan) => (
            <Card key={loan.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        €{loan.principal.toLocaleString()} Loan
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(loan.interestRate * 100).toFixed(2)}% interest • {loan.termMonths} months
                      </p>
                      {loan.purpose && (
                        <p className="text-sm text-gray-500">Purpose: {loan.purpose}</p>
                      )}
                      {loan.monthlyPayment && (
                        <p className="text-sm font-medium text-green-600">
                          Monthly Payment: €{loan.monthlyPayment.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                    
                    {loan.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        {user?.role === 'ADMIN' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveLoanMutation.mutate({ loanId: loan.id, notes: adminNotes })}
                              disabled={approveLoanMutation.isPending}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectLoanMutation.mutate({ loanId: loan.id, notes: adminNotes })}
                              disabled={rejectLoanMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelLoanMutation.mutate(loan.id)}
                              disabled={cancelLoanMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLoanMutation.mutate(loan.id)}
                              disabled={deleteLoanMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {loan.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Admin Notes:</strong> {loan.adminNotes}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  Applied: {new Date(loan.createdAt).toLocaleDateString()}
                  {loan.updatedAt !== loan.createdAt && (
                    <span> • Updated: {new Date(loan.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

