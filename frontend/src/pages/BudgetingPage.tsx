import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingUp } from 'lucide-react'

export const BudgetingPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budgeting Dashboard</h1>
        <p className="text-gray-600">Track your spending and manage your budget</p>
      </div>

      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Budgeting feature coming soon</h3>
        <p className="text-gray-500">Budgeting and analytics functionality will be available in the next update.</p>
      </div>
    </div>
  )
}
