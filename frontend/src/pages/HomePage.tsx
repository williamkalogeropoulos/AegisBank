import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Carousel } from '../components/Carousel'
import { 
  Shield, 
  CreditCard, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Star,
  CheckCircle,
  Globe,
  Smartphone,
  Lock
} from 'lucide-react'

export const HomePage = () => {
  const carouselImages = [
    '/carousel-1.png',
    '/carousel-2.png', 
    '/carousel-3.png',
    '/carousel-4.png'
  ]

  const features = [
    {
      icon: Shield,
      title: 'Secure Banking',
      description: 'Advanced encryption and security measures to protect your financial data.'
    },
    {
      icon: CreditCard,
      title: 'Digital Cards',
      description: 'Virtual and physical cards with instant activation and real-time spending controls.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'AI-powered insights to help you manage your finances and reach your goals.'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Round-the-clock customer service to assist you whenever you need help.'
    }
  ]

  const benefits = [
    'Zero monthly fees on checking accounts',
    'Competitive interest rates on savings',
    'Instant money transfers',
    'Mobile banking app with biometric login',
    'Free ATM withdrawals worldwide',
    'Personal financial advisor included'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-slate-100/40 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl animate-float" style={{animationDelay: '6s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Aegis Bank Logo */}
              <div className="flex justify-center lg:justify-start mb-8">
                <img 
                  src="/Logo.svg" 
                  alt="Aegis Bank Logo" 
                  className="h-16 w-auto"
                />
              </div>
              
              <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse-glow"></div>
                <span className="text-blue-700 font-semibold text-sm">Secure Banking Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-blue-900">Your Financial</span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Security Partner
                </span>
              </h1>
              
              <p className="text-xl text-blue-700 mb-8 leading-relaxed max-w-2xl">
                Experience next-generation banking with military-grade security, 
                instant transactions, and AI-powered financial insights. 
                Your money, your control, your future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-102"
                  >
                    Start Banking Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 hover:text-blue-700 font-bold px-8 py-4 text-lg rounded-2xl transition-all duration-500 transform hover:scale-102"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500K+</div>
                  <div className="text-sm text-blue-700">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">€2.5B+</div>
                  <div className="text-sm text-blue-700">Assets Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-blue-700">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Content - Minimized Carousel */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Carousel images={carouselImages} />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-600 rounded-2xl shadow-xl flex items-center justify-center animate-float" style={{animationDelay: '3s'}}>
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Why Choose Aegis Bank?
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              We combine advanced security with cutting-edge technology to deliver an exceptional banking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 animate-pulse-glow">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-700 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Banking Made Simple
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join thousands of satisfied customers who have made the switch to secure banking. 
                Experience the difference with Aegis Bank.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-white flex-shrink-0 animate-pulse-glow" />
                    <span className="text-white/90 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                    <Star className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">4.9/5 Rating</h3>
                  <p className="text-white/90 mb-6">Based on 10,000+ customer reviews</p>
                  <div className="flex justify-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-white fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 italic">
                    "The most secure banking experience I've ever had. Advanced protection and always available."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Built for the Digital Age
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Our platform is designed with the latest technology to ensure security, speed, and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Global Access</h3>
              <p className="text-blue-700 leading-relaxed">
                Access your accounts from anywhere in the world with our secure global network.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Mobile First</h3>
              <p className="text-blue-700 leading-relaxed">
                Designed for mobile devices with intuitive interfaces and lightning-fast performance.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Bank-Grade Security</h3>
              <p className="text-blue-700 leading-relaxed">
                Military-grade encryption and multi-factor authentication to protect your assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join Aegis Bank today and experience the future of secure banking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30"
              >
                Open Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 font-bold px-8 py-4 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}