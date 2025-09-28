import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { EditRequestDialog } from './EditRequestDialog'
import { 
  User, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit,
  Clock,
  History
} from 'lucide-react'

interface UserHistory {
  id: number
  email: string
  name: string
  totalRequests: number
  approvedRequests: number
  rejectedRequests: number
  pendingRequests: number
  lastActivity: string
  requests: RequestHistory[]
}

interface RequestHistory {
  id: number
  type: 'ACCOUNT' | 'CARD' | 'LOAN'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  details: any
}

interface UserHistoryCardProps {
  user: UserHistory
  onViewDetails: (userId: number) => void
  onEditRequest: (requestId: number, type: string) => void
}

export const UserHistoryCard = ({ user, onViewDetails, onEditRequest }: UserHistoryCardProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestHistory | null>(null)

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
        return <CreditCard className="h-4 w-4" />
      case 'CARD':
        return <CreditCard className="h-4 w-4" />
      case 'LOAN':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-hellenic-blue flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <History className="h-4 w-4 mr-1" />
            {showDetails ? 'Hide' : 'Show'} History
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.totalRequests}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{user.approvedRequests}</div>
            <div className="text-xs text-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{user.rejectedRequests}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{user.pendingRequests}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          Last activity: {formatDate(user.lastActivity)}
        </div>

        {/* Request History Details */}
        {showDetails && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-sm text-gray-700">Request History</h4>
            {user.requests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No requests found</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {user.requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(request.type)}
                      <div>
                        <div className="text-sm font-medium">{request.type}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(request.status)}
                      {request.status === 'APPROVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(user.id)}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>

      {/* Edit Request Dialog */}
      {selectedRequest && (
        <EditRequestDialog
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedRequest(null)
          }}
          requestType={selectedRequest.type}
          requestId={selectedRequest.id}
          currentData={selectedRequest.details}
          onSave={(data) => {
            onEditRequest(selectedRequest.id, selectedRequest.type)
            setEditDialogOpen(false)
            setSelectedRequest(null)
          }}
        />
      )}
    </Card>
  )
}
