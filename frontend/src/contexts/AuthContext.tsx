import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface User {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const queryClient = useQueryClient()

  // Token is now handled by the API interceptor

  // Fetch current user
  const { isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/api/users/me')
      return response.data
    },
    enabled: !!token,
  })

  // Handle user data when query succeeds
  useEffect(() => {
    if (userLoading === false && token) {
      // User query completed successfully, data is available
      const userData = queryClient.getQueryData(['user'])
      if (userData) {
        setUser(userData as User)
      }
    }
  }, [userLoading, token, queryClient])

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/api/auth/login', { email, password })
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.accessToken)
      setUser(data.user)
      localStorage.setItem('token', data.accessToken)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })

  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await api.post('/api/auth/register', { name, email, password })
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.accessToken)
      setUser(data.user)
      localStorage.setItem('token', data.accessToken)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error: any) => {
      console.error('Registration error:', error)
      throw new Error(error.response?.data || 'Registration failed')
    }
  })

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (name: string, email: string, password: string) => {
    await registerMutation.mutateAsync({ name, email, password })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    queryClient.clear()
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading: userLoading || loginMutation.isPending || registerMutation.isPending
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

