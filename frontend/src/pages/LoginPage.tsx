import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Building2, Eye, EyeOff, Shield, CreditCard, TrendingUp } from 'lucide-react'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  // Animation effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Step-by-step animation
  useEffect(() => {
    if (isAnimating) {
      const steps = [0, 1, 2, 3]
      steps.forEach((step, index) => {
        setTimeout(() => {
          setAnimationStep(step)
        }, index * 200)
      })
    }
  }, [isAnimating])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2">
                <img 
                  src="/Logo.svg" 
                  alt="Aegis Bank Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Aegis Bank</h1>
                <p className="text-white/80 text-sm">Secure Banking</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Welcome to the future of
              <span className="block text-white/90">secure banking</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Experience next-generation financial services with military-grade security, 
              instant transactions, and AI-powered insights.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Military-grade encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Instant global transfers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">24/7 AI-powered support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center p-3">
                <img 
                  src="/Logo.svg" 
                  alt="Aegis Bank Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-blue-900">Welcome back</h2>
            <p className="text-blue-700 mt-2">Sign in to your Aegis Bank account</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-blue-900">Sign in to your account</h2>
            <p className="text-blue-700 mt-2">Enter your credentials to access your secure banking portal</p>
          </div>
          
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-800 font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-800 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-12 pr-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in to Aegis Bank'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-blue-700">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-300"
              >
                Create one now
              </Link>
            </p>
            <p className="text-sm text-blue-600 mt-4">
              Demo: admin@aegisbank.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}





