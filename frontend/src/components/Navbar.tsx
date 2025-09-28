import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePendingRequests } from '../hooks/usePendingRequests'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ThemeToggle } from './ThemeToggle'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Shield,
  Clock,
  Home,
  CreditCard,
  ArrowLeftRight,
  Banknote,
  FileText
} from 'lucide-react'

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: pendingCount = 0 } = usePendingRequests()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 backdrop-blur-md shadow-2xl border-b border-blue-600/20 sticky top-0 z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-700/5 to-blue-800/10 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-700/20 rounded-full animate-float blur-xl"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/30 rounded-full animate-float blur-lg" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-blue-800/25 rounded-full animate-float blur-md" style={{animationDelay: '2s'}}></div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="h-12 w-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 p-2">
                  <img 
                    src="/Logo.svg" 
                    alt="Aegis Bank Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse-glow"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  Aegis Bank
                </span>
                <span className="text-xs text-white/80 font-medium -mt-1">Secure Banking</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {user && (
              <>
                {user.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="relative group flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <div className="relative">
                      <Shield className="h-5 w-5" />
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
                          {pendingCount}
                        </Badge>
                      )}
                    </div>
                    <span className="font-medium">Admin</span>
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                >
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link 
                  to="/accounts" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                >
                  <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Accounts</span>
                </Link>
                <Link 
                  to="/transfers" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                >
                  <ArrowLeftRight className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Transfers</span>
                </Link>
                <Link 
                  to="/cards" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                >
                  <Banknote className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Cards</span>
                </Link>
                <Link 
                  to="/loans" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                >
                  <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Loans</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-white/90 to-white/70 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="hidden sm:block font-medium">{user.name}</span>
                </Button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-800 rounded-2xl shadow-xl py-2 z-[9999] border border-blue-600/20 backdrop-blur-sm">
                    <div className="px-4 py-2 border-b border-slate-200/20">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-slate-800 dark:text-gray-300 hover:bg-blue-600/10 hover:text-blue-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-800 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl px-4 py-2 font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-b-2xl">
              {user && (
                <>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-between px-4 py-3 text-slate-800 dark:text-white hover:text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Admin</span>
                      </div>
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {pendingCount}
                        </Badge>
                      )}
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-4 py-3 text-slate-800 dark:text-white hover:text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link
                    to="/accounts"
                    className="flex items-center space-x-3 px-4 py-3 text-slate-800 dark:text-white hover:text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Accounts</span>
                  </Link>
                  <Link
                    to="/transfers"
                    className="flex items-center space-x-3 px-4 py-3 text-slate-800 dark:text-white hover:text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    <span className="font-medium">Transfers</span>
                  </Link>
                  <Link
                    to="/cards"
                    className="flex items-center space-x-3 px-4 py-3 text-slate-800 dark:text-white hover:text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Banknote className="h-5 w-5" />
                    <span className="font-medium">Cards</span>
                  </Link>
                  <Link
                    to="/loans"
                    className="flex items-center space-x-3 px-4 py-3 text-slate-800 dark:text-white hover:text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Loans</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}