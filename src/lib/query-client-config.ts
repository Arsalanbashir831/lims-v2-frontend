import { QueryClient } from '@tanstack/react-query'

// Global query client configuration with optimized caching
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Global stale time - data is considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      
      // Global garbage collection time - keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
        // Retry configuration
        retry: (failureCount: number, error: any) => {
          // Don't retry on 401/403 errors (authentication issues)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status
            if (status === 401 || status === 403) {
              return false
            }
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: true,
      
      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
}

// Cache invalidation utilities - these should be used with useQueryClient hook
export const CACHE_UTILS = {
  // Invalidate all auth-related queries
  invalidateAuth: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['auth'] })
  },
  
  // Invalidate all client-related queries
  invalidateClients: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
  },
  
  // Invalidate all test method-related queries
  invalidateTestMethods: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['test-methods'] })
  },
  
  // Invalidate all equipment-related queries
  invalidateEquipments: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['equipments'] })
  },
  
  // Invalidate all sample-related queries
  invalidateSamples: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['sample-information'] })
    queryClient.invalidateQueries({ queryKey: ['sample-preparation'] })
    queryClient.invalidateQueries({ queryKey: ['sample-lots'] })
  },
  
  // Invalidate all testing-related queries
  invalidateTesting: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['proficiency-testing'] })
    queryClient.invalidateQueries({ queryKey: ['calibration-testing'] })
  },
  
  // Invalidate all report-related queries
  invalidateReports: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['test-reports'] })
    queryClient.invalidateQueries({ queryKey: ['complete-certificates'] })
  },
  
  // Invalidate all welder-related queries
  invalidateWelders: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['welders'] })
    queryClient.invalidateQueries({ queryKey: ['pqr'] })
  },
  
  // Clear all cache (useful for logout)
  clearAll: (queryClient: QueryClient) => {
    queryClient.clear()
  },
}

// Prefetch utilities for common data - these should be used with useQueryClient hook
export const PREFETCH_UTILS = {
  // Prefetch client data for better UX
  prefetchClient: (queryClient: QueryClient, id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['clients', 'detail', id],
      queryFn: () => import('@/services/clients.service').then(module => module.clientService.getById(id)),
      staleTime: 5 * 60 * 1000,
    })
  },
  
  // Prefetch test method data
  prefetchTestMethod: (queryClient: QueryClient, id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['test-methods', 'detail', id],
      queryFn: () => import('@/services/test-methods.service').then(module => module.testMethodService.getById(id)),
      staleTime: 10 * 60 * 1000,
    })
  },
  
  // Prefetch equipment data
  prefetchEquipment: (queryClient: QueryClient, id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['equipments', 'detail', id],
      queryFn: () => import('@/services/equipments.service').then(module => module.equipmentService.getById(id)),
      staleTime: 5 * 60 * 1000,
    })
  },
}
