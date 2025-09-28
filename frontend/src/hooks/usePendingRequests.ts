import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const usePendingRequests = () => {
  return useQuery({
    queryKey: ['pending-requests-count'],
    queryFn: async () => {
      if (!localStorage.getItem('token')) return 0
      
      try {
        const [accountsRes, cardsRes, loansRes] = await Promise.all([
          api.get('/api/accounts/admin/pending').catch(() => ({ data: [] })),
          api.get('/api/cards/admin/pending').catch(() => ({ data: [] })),
          api.get('/api/loans/admin/pending').catch(() => ({ data: [] }))
        ])

        const totalPending = 
          (Array.isArray(accountsRes.data) ? accountsRes.data.length : 0) + 
          (Array.isArray(cardsRes.data) ? cardsRes.data.length : 0) + 
          (Array.isArray(loansRes.data) ? loansRes.data.length : 0)

        return totalPending
      } catch (error) {
        // If user is not admin or not authenticated, return 0
        console.error('Error fetching pending requests count:', error)
        return 0
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false
  })
}
