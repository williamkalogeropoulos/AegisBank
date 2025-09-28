import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  isLoading?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false
}) => {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <Trash2 className="h-6 w-6 text-red-600" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          titleColor: 'text-red-600'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          titleColor: 'text-yellow-600'
        }
      default:
        return {
          icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          titleColor: 'text-blue-600'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            {styles.icon}
            <CardTitle className={styles.titleColor}>
              {title}
            </CardTitle>
          </div>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 ${styles.confirmButton}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}









