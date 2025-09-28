import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { UserHistoryCard } from '../components/UserHistoryCard'
import { 
  Users, 
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import api from '../lib/api'

interface UserWithHistory {
  id: number
  email: string
  name: string
  role: string
  createdAt: string
  lastLogin?: string
  lastActivity: string
  totalRequests: number
  approvedRequests: number
  rejectedRequests: number
  pendingRequests: number
  requests: any[]
}

export const AdminUserHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

  // Fetch all users with their request history
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users-history'],
    queryFn: async () => {
      const [usersRes, accountsRes, cardsRes, loansRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/accounts/admin/all'),
        api.get('/api/cards/all'),
        api.get('/api/loans/admin')
      ])

      // Combine all requests by user
      const userRequestMap = new Map<number, any[]>()

      // Process accounts
      accountsRes.data.forEach((account: any) => {
        if (!userRequestMap.has(account.userId)) {
          userRequestMap.set(account.userId, [])
        }
        userRequestMap.get(account.userId)!.push({
          id: account.id,
          type: 'ACCOUNT',
          status: account.status,
          createdAt: account.createdAt,
          approvedAt: account.status === 'ACTIVE' ? account.updatedAt : null,
          details: {
            type: account.type,
            iban: account.iban,
            balance: account.balance
          }
        })
      })

      // Process cards
      cardsRes.data.forEach((card: any) => {
        if (!userRequestMap.has(card.userId)) {
          userRequestMap.set(card.userId, [])
        }
        userRequestMap.get(card.userId)!.push({
          id: card.id,
          type: 'CARD',
          status: card.status,
          createdAt: card.createdAt,
          approvedAt: card.status === 'ACTIVE' ? card.updatedAt : null,
          details: {
            type: card.type,
            maskedNumber: card.maskedNumber,
            expiryMonth: card.expiryMonth,
            expiryYear: card.expiryYear
          }
        })
      })

      // Process loans
      loansRes.data.forEach((loan: any) => {
        if (!userRequestMap.has(loan.userId)) {
          userRequestMap.set(loan.userId, [])
        }
        userRequestMap.get(loan.userId)!.push({
          id: loan.id,
          type: 'LOAN',
          status: loan.status,
          createdAt: loan.createdAt,
          approvedAt: loan.status === 'APPROVED' ? loan.updatedAt : null,
          details: {
            principal: loan.principal,
            interestRate: loan.interestRate,
            termMonths: loan.termMonths
          }
        })
      })

      // Create user objects with request history
      const usersWithHistory: UserWithHistory[] = usersRes.data.map((user: any) => {
        const requests = userRequestMap.get(user.id) || []
        const approvedRequests = requests.filter((r: any) => r.status === 'APPROVED' || r.status === 'ACTIVE').length
        const rejectedRequests = requests.filter((r: any) => r.status === 'REJECTED').length
        const pendingRequests = requests.filter((r: any) => r.status === 'PENDING').length

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          lastActivity: user.lastLogin || user.createdAt,
          totalRequests: requests.length,
          approvedRequests,
          rejectedRequests,
          pendingRequests,
          requests: requests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
      })

      return usersWithHistory.sort((a, b) => b.totalRequests - a.totalRequests)
    }
  })

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'ALL') return matchesSearch
    
    const hasMatchingStatus = user.requests.some((request: any) => request.status === filterStatus)
    return matchesSearch && hasMatchingStatus
  }) || []

  const handleViewDetails = (userId: number) => {
    // Navigate to detailed user view
    console.log('View details for user:', userId)
  }

  const handleEditRequest = (requestId: number, type: string) => {
    // Navigate to edit request page
    console.log('Edit request:', requestId, type)
  }

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Total Requests', 'Approved', 'Rejected', 'Pending', 'Last Activity'].join(','),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.totalRequests,
        user.approvedRequests,
        user.rejectedRequests,
        user.pendingRequests,
        user.lastLogin || 'Never'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user-request-history.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user history...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-hellenic-blue" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Request History</h1>
            <p className="text-gray-600">Track all user requests and approvals</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('ALL')}
              >
                All ({users?.length || 0})
              </Button>
              <Button
                variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('PENDING')}
              >
                Pending ({users?.filter(u => u.pendingRequests > 0).length || 0})
              </Button>
              <Button
                variant={filterStatus === 'APPROVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('APPROVED')}
              >
                Approved ({users?.filter(u => u.approvedRequests > 0).length || 0})
              </Button>
              <Button
                variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('REJECTED')}
              >
                Rejected ({users?.filter(u => u.rejectedRequests > 0).length || 0})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No users found matching your criteria</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserHistoryCard
              key={user.id}
              user={user}
              onViewDetails={handleViewDetails}
              onEditRequest={handleEditRequest}
            />
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Overall request statistics across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{users?.length || 0}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users?.reduce((sum, user) => sum + user.totalRequests, 0) || 0}
              </div>
              <div className="text-sm text-gray-500">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users?.reduce((sum, user) => sum + user.approvedRequests, 0) || 0}
              </div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {users?.reduce((sum, user) => sum + user.pendingRequests, 0) || 0}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}









