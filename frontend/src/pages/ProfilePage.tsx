import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { User, Mail, Shield, Lock } from 'lucide-react'
import api from '../lib/api'

export const ProfilePage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string; email: string }) => {
      const response = await api.put('/api/users/me', profileData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      alert('Profile updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error)
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message))
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/api/users/me/password', passwordData)
      return response.data
    },
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      alert('Password updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating password:', error)
      alert('Failed to update password: ' + (error.response?.data?.message || error.message))
    }
  })

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      alert('Name and email are required')
      return
    }
    updateProfileMutation.mutate({ name, email })
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }
    updatePasswordMutation.mutate({ currentPassword, newPassword })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveProfile} 
              variant="hellenic"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Your account information and role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-hellenic-blue rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Role</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Account Security</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
              
              {showPasswordForm && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={updatePasswordMutation.isPending}
                      size="sm"
                    >
                      {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}






