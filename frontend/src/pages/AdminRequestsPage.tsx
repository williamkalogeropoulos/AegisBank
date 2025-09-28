import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Users, 
  CreditCard, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  History
} from 'lucide-react'
import api from '../lib/api'
// import { toast } from 'react-hot-toast'

interface PendingRequest {
  id: number
  type: 'ACCOUNT' | 'CARD' | 'LOAN'
  userId: number
  userEmail: string
  userName: string
  status: string
  createdAt: string
  details: any
}

interface ApprovalHistory {
  id: number
  requestId: number
  requestType: string
  action: 'APPROVED' | 'REJECTED' | 'MODIFIED'
  adminId: number
  adminName: string
  timestamp: string
  notes?: string
  previousData?: any
  newData?: any
}

export const AdminRequestsPage = () => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const queryClient = useQueryClient()

  // Fetch pending requests
  const { data: pendingRequests = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-requests'],
    queryFn: async () => {
      try {
        const [accountsRes, cardsRes, loansRes] = await Promise.all([
          api.get('/api/accounts/admin/pending').catch(() => ({ data: [] })),
          api.get('/api/cards/admin/pending').catch(() => ({ data: [] })),
          api.get('/api/loans/admin/pending').catch(() => ({ data: [] }))
        ])

        const requests: PendingRequest[] = []
        
        // Process account requests
        if (accountsRes.data && Array.isArray(accountsRes.data)) {
          accountsRes.data.forEach((account: any) => {
            requests.push({
              id: account.id,
              type: 'ACCOUNT',
              userId: account.userId,
              userEmail: account.user?.email || 'Unknown',
              userName: account.user?.name || 'Unknown',
              status: account.status,
              createdAt: account.createdAt,
              details: {
                type: account.type,
                iban: account.iban,
                balance: account.balance,
                currency: account.currency
              }
            })
          })
        }

        // Process card requests
        if (cardsRes.data && Array.isArray(cardsRes.data)) {
          cardsRes.data.forEach((card: any) => {
            requests.push({
              id: card.id,
              type: 'CARD',
              userId: card.userId,
              userEmail: card.user?.email || 'Unknown',
              userName: card.user?.name || 'Unknown',
              status: card.status,
              createdAt: card.createdAt,
              details: {
                type: card.type,
                maskedNumber: card.maskedNumber,
                expiryMonth: card.expiryMonth,
                expiryYear: card.expiryYear,
                limit: card.limit
              }
            })
          })
        }

        // Process loan requests
        if (loansRes.data && Array.isArray(loansRes.data)) {
          loansRes.data.forEach((loan: any) => {
            requests.push({
              id: loan.id,
              type: 'LOAN',
              userId: loan.userId,
              userEmail: loan.user?.email || 'Unknown',
              userName: loan.user?.name || 'Unknown',
              status: loan.status,
              createdAt: loan.createdAt,
              details: {
                principal: loan.principal,
                interestRate: loan.interestRate,
                termMonths: loan.termMonths,
                monthlyPayment: loan.monthlyPayment,
                purpose: loan.purpose
              }
            })
          })
        }

        return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } catch (error) {
        console.error('Error fetching pending requests:', error)
        return []
      }
    }
  })

  // Fetch approval history for selected user
  const { data: approvalHistory } = useQuery({
    queryKey: ['admin-approval-history', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return []
      
      // This would need to be implemented in the backend
      // For now, we'll simulate the data structure
      return []
    },
    enabled: !!selectedUser && showHistory
  })

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      const endpoint = type === 'ACCOUNT' ? `/api/accounts/admin/${id}/approve` :
                      type === 'CARD' ? `/api/cards/admin/${id}/approve` :
                      `/api/loans/admin/${id}/approve`
      
      return api.post(endpoint)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-requests'] })
      alert('Request approved successfully')
    },
    onError: () => {
      alert('Failed to approve request')
    }
  })

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      const endpoint = type === 'ACCOUNT' ? `/api/accounts/admin/${id}/reject` :
                      type === 'CARD' ? `/api/cards/admin/${id}/reject` :
                      `/api/loans/admin/${id}/reject`
      
      return api.post(endpoint)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-requests'] })
      alert('Request rejected')
    },
    onError: () => {
      alert('Failed to reject request')
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACCOUNT':
        return <CreditCard className="h-5 w-5" />
      case 'CARD':
        return <CreditCard className="h-5 w-5" />
      case 'LOAN':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
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

  if (pendingLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-hellenic-blue" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
            <p className="text-gray-600">Review and approve user requests</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center space-x-2"
        >
          <History className="h-4 w-4" />
          <span>{showHistory ? 'Hide' : 'Show'} History</span>
        </Button>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span>User Requests by User ({pendingRequests?.length || 0})</span>
          </CardTitle>
          <CardDescription>
            Review and approve user requests organized by user. Each user's pending and completed requests are tracked here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!Array.isArray(pendingRequests) || pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                pendingRequests.reduce((acc, request) => {
                  const key = `${request.userId}-${request.userName}`;
                  if (!acc[key]) {
                    acc[key] = {
                      userId: request.userId,
                      userName: request.userName,
                      userEmail: request.userEmail,
                      requests: []
                    };
                  }
                  acc[key].requests.push(request);
                  return acc;
                }, {} as Record<string, { userId: number; userName: string; userEmail: string; requests: PendingRequest[] }>)
              ).map(([key, userData]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{userData.userName}</h3>
                      <p className="text-sm text-gray-600">{userData.userEmail}</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {userData.requests.length} pending request{userData.requests.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {userData.requests.map((request) => (
                      <div key={`${request.type}-${request.id}`} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(request.type)}
                              <span className="font-medium">{request.type}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>Date:</strong> {formatDate(request.createdAt)}</p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Show detailed request information
                                alert(`Request Details:
Type: ${request.type}
User: ${request.userName} (${request.userEmail})
Status: ${request.status}
Created: ${new Date(request.createdAt).toLocaleString()}
Details: ${JSON.stringify(request.details, null, 2)}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {request.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => approveMutation.mutate({ type: request.type, id: request.id })}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => rejectMutation.mutate({ type: request.type, id: request.id })}
                                  disabled={rejectMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Request Details */}
                        <div className="mt-3 p-3 bg-white rounded border">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {Object.entries(request.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                <p className="text-gray-600">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <span>Approval History</span>
            </CardTitle>
            <CardDescription>
              Track all approval actions and modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Approval history for selected user will be displayed here</p>
                <p className="text-sm">This feature requires backend implementation</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a user to view their approval history</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
