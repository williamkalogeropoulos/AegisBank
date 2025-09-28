import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { 
  Edit,
  Save,
  X,
  AlertCircle
} from 'lucide-react'

interface EditRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  requestType: 'ACCOUNT' | 'CARD' | 'LOAN'
  requestId: number
  currentData: any
  onSave: (data: any) => void
}

export const EditRequestDialog = ({ 
  isOpen, 
  onClose, 
  requestType, 
  requestId, 
  currentData, 
  onSave 
}: EditRequestDialogProps) => {
  const [formData, setFormData] = useState(currentData || {})
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const renderAccountFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Account Type</Label>
        <select
          id="type"
          value={formData.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="CHECKING">Checking</option>
          <option value="SAVINGS">Savings</option>
        </select>
      </div>
      <div>
        <Label htmlFor="balance">Balance</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          value={formData.balance || ''}
          onChange={(e) => handleInputChange('balance', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          value={formData.currency || 'EUR'}
          onChange={(e) => handleInputChange('currency', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
    </div>
  )

  const renderCardFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Card Type</Label>
        <select
          id="type"
          value={formData.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="DEBIT">Debit</option>
          <option value="CREDIT">Credit</option>
        </select>
      </div>
      <div>
        <Label htmlFor="expiryMonth">Expiry Month</Label>
        <Input
          id="expiryMonth"
          type="number"
          min="1"
          max="12"
          value={formData.expiryMonth || ''}
          onChange={(e) => handleInputChange('expiryMonth', parseInt(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="expiryYear">Expiry Year</Label>
        <Input
          id="expiryYear"
          type="number"
          min={new Date().getFullYear()}
          value={formData.expiryYear || ''}
          onChange={(e) => handleInputChange('expiryYear', parseInt(e.target.value))}
        />
      </div>
      {formData.type === 'CREDIT' && (
        <div>
          <Label htmlFor="limit">Credit Limit</Label>
          <Input
            id="limit"
            type="number"
            step="0.01"
            value={formData.limit || ''}
            onChange={(e) => handleInputChange('limit', parseFloat(e.target.value))}
          />
        </div>
      )}
    </div>
  )

  const renderLoanFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="principal">Principal Amount</Label>
        <Input
          id="principal"
          type="number"
          step="0.01"
          value={formData.principal || ''}
          onChange={(e) => handleInputChange('principal', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="interestRate">Interest Rate (%)</Label>
        <Input
          id="interestRate"
          type="number"
          step="0.01"
          value={formData.interestRate || ''}
          onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="termMonths">Term (Months)</Label>
        <Input
          id="termMonths"
          type="number"
          value={formData.termMonths || ''}
          onChange={(e) => handleInputChange('termMonths', parseInt(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="monthlyPayment">Monthly Payment</Label>
        <Input
          id="monthlyPayment"
          type="number"
          step="0.01"
          value={formData.monthlyPayment || ''}
          onChange={(e) => handleInputChange('monthlyPayment', parseFloat(e.target.value))}
        />
      </div>
    </div>
  )

  const getTitle = () => {
    switch (requestType) {
      case 'ACCOUNT':
        return 'Edit Account'
      case 'CARD':
        return 'Edit Card'
      case 'LOAN':
        return 'Edit Loan'
      default:
        return 'Edit Request'
    }
  }

  const getDescription = () => {
    switch (requestType) {
      case 'ACCOUNT':
        return 'Modify account details and settings'
      case 'CARD':
        return 'Update card information and limits'
      case 'LOAN':
        return 'Adjust loan terms and conditions'
      default:
        return 'Edit request details'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>{getTitle()}</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{getDescription()}</p>

        <div className="py-4">
          {requestType === 'ACCOUNT' && renderAccountFields()}
          {requestType === 'CARD' && renderCardFields()}
          {requestType === 'LOAN' && renderLoanFields()}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Changes will be logged in the approval history
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
