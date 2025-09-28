import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePendingRequests } from '../hooks/usePendingRequests'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  FileText,
  TrendingUp,
  Shield,
  User,
  Home,
  Banknote,
  Clock
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: CreditCard },
  { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight },
  { name: 'Cards', href: '/cards', icon: Banknote },
  { name: 'Loans', href: '/loans', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
]

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: Shield },
]

export const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { data: pendingCount = 0 } = usePendingRequests()

  return (
    <div className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex flex-col flex-grow bg-blue-900/95 dark:bg-blue-950/95 backdrop-blur-md border-r border-blue-800 shadow-lg">
        {/* Logo Section */}
        <div className="flex items-center px-6 py-6 border-b border-blue-800">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse-glow"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">
                Aegis Bank
              </span>
              <span className="text-xs text-blue-300 font-medium -mt-1">Secure Banking</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-grow px-4 py-6">
          <nav className="flex-1 space-y-2">
            {/* Main Navigation */}
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-x-1 relative',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-600/20'
                      : 'text-blue-100 hover:bg-blue-800/50 hover:text-white hover:shadow-md'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300',
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-blue-800/30 group-hover:bg-blue-700/40'
                  )}>
                    <item.icon
                      className={cn(
                        'h-5 w-5 transition-all duration-300',
                        isActive 
                          ? 'text-white' 
                          : 'text-blue-300 group-hover:text-white group-hover:scale-110'
                      )}
                    />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse-glow"></div>
                  )}
                </Link>
              )
            })}
            
            {/* Admin Section */}
            {user?.role === 'ADMIN' && (
              <>
                <div className="border-t border-blue-800 my-6"></div>
                <div className="px-2 mb-2">
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Administration</span>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-x-1 relative',
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-600/20'
                          : 'text-blue-100 hover:bg-blue-800/50 hover:text-white hover:shadow-md'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300 relative',
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-blue-800/30 group-hover:bg-blue-700/40'
                      )}>
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-all duration-300',
                            isActive 
                              ? 'text-white' 
                              : 'text-blue-300 group-hover:text-white group-hover:scale-110'
                          )}
                        />
                        {pendingCount > 0 && (
                          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs animate-pulse">
                            {pendingCount}
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse-glow"></div>
                      )}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {/* User Info */}
          {user && (
            <div className="mt-auto pt-6 border-t border-blue-800">
              <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-800/20 to-blue-700/20 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-blue-300 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}