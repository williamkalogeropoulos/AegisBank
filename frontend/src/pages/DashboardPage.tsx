import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  CreditCard, 
  ArrowLeftRight, 
  Wallet, 
  TrendingUp,
  Plus,
  Eye,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
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
  toIban: string
  amount: number
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export const DashboardPage = () => {
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await api.get('/api/accounts')
      return response.data
    }
  })

  const { data: recentTransfers = [], isLoading: transfersLoading } = useQuery({
    queryKey: ['recent-transfers'],
    queryFn: async () => {
      const response = await api.get('/api/transfers/recent?days=7')
      return response.data
    }
  })

  const totalBalance = accounts
    .filter((account: Account) => account.status === 'ACTIVE')
    .reduce((sum: number, account: Account) => sum + account.balance, 0)
  const activeAccounts = accounts.filter((account: Account) => account.status === 'ACTIVE').length
  const frozenAccounts = accounts.filter((account: Account) => account.status === 'FROZEN').length

  // Remove loading spinner - show content immediately

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-800/5 rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Welcome back!</h1>
              <p className="text-lg text-blue-700">Here's your financial overview at a glance</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
              <Link to="/transfers">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-12 px-6 rounded-xl font-semibold">
                  <ArrowLeftRight className="h-5 w-5 mr-2" />
                  Transfer Money
                </Button>
              </Link>
              <Link to="/accounts">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  New Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">€{totalBalance.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">Total Balance</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-900-light">Across {activeAccounts} accounts</span>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse-glow"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Accounts Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600-light to-blue-600-dark rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600-light to-blue-600-dark rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">{activeAccounts}</div>
                  <div className="text-sm text-blue-900-light">Active Accounts</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-900-light">{frozenAccounts} frozen</span>
                <div className="w-2 h-2 bg-blue-600-light rounded-full animate-pulse-glow"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transfers Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600-dark to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600-dark to-blue-600 rounded-xl flex items-center justify-center">
                  <ArrowLeftRight className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">{recentTransfers.length}</div>
                  <div className="text-sm text-blue-900-light">Recent Transfers</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-900-light">Last 7 days</span>
                <div className="w-2 h-2 bg-blue-600-dark rounded-full animate-pulse-glow"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-600-dark rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-600-dark rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-900">Quick Actions</div>
                </div>
              </div>
              <div className="space-y-2">
                <Link to="/cards">
                  <Button size="sm" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl">
                    <Eye className="h-4 w-4 mr-2" />
                    View Cards
                  </Button>
                </Link>
                <Link to="/loans">
                  <Button size="sm" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl">
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Loan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modern Accounts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accounts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-900">Your Accounts</h2>
            <Link to="/accounts">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">No accounts yet</h3>
                <p className="text-blue-900-light mb-6">Create your first account to start banking with Aegis</p>
                <Link to="/accounts">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-600-light hover:from-blue-600-dark hover:to-blue-600 text-white rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : (
              accounts.map((account: Account) => (
                <div key={account.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-600-light/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          account.type === 'CHECKING' 
                            ? 'bg-gradient-to-br from-blue-600 to-blue-600-light' 
                            : 'bg-gradient-to-br from-blue-600-light to-blue-600-dark'
                        }`}>
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">{account.type}</h3>
                          <p className="text-sm text-blue-900-light font-mono">{account.iban}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">€{account.balance.toLocaleString()}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          account.status === 'ACTIVE' 
                            ? 'bg-blue-600/10 text-blue-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            account.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-red-500'
                          }`}></div>
                          {account.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-900">Recent Activity</h2>
            <Link to="/transfers">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentTransfers.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ArrowLeftRight className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">No recent activity</h3>
                <p className="text-blue-900-light mb-6">Your transfers and transactions will appear here</p>
                <Link to="/transfers">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-600-light hover:from-blue-600-dark hover:to-blue-600 text-white rounded-xl">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Make Transfer
                  </Button>
                </Link>
              </div>
            ) : (
              recentTransfers.slice(0, 5).map((transfer: Transfer) => (
                <div key={transfer.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-600-light/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600/10 to-blue-600-light/10 rounded-xl flex items-center justify-center">
                          <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">Transfer to {transfer.toIban}</h3>
                          <p className="text-sm text-blue-900-light">{transfer.description}</p>
                          <p className="text-xs text-blue-900-light">
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-900">-€{transfer.amount.toLocaleString()}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transfer.status === 'COMPLETED' 
                            ? 'bg-blue-600/10 text-blue-600' 
                            : transfer.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            transfer.status === 'COMPLETED' 
                              ? 'bg-blue-600' 
                              : transfer.status === 'PENDING'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}></div>
                          {transfer.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


