import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { welderService, CreateWelderData, UpdateWelderData } from '@/services/welders.service'

// Query keys for consistent caching
export const WELDERS_QUERY_KEYS = {
  all: ['welders'] as const,
  lists: () => [...WELDERS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, search?: string, limit?: number) => [...WELDERS_QUERY_KEYS.lists(), { page, search, limit }] as const,
  details: () => [...WELDERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WELDERS_QUERY_KEYS.details(), id] as const,
  search: (query: string, page: number, limit?: number) => [...WELDERS_QUERY_KEYS.all, 'search', { query, page, limit }] as const,
}

// Hook for getting welders list with pagination
export function useWelders(page: number = 1, searchQuery?: string, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: searchQuery ? WELDERS_QUERY_KEYS.search(searchQuery, page, limit) : WELDERS_QUERY_KEYS.list(page, searchQuery, limit),
    queryFn: () => {
      if (searchQuery?.trim()) {
        return welderService.search(searchQuery.trim(), page, limit)
      }
      return welderService.getAll(page, limit, false) // Don't show inactive welders
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

// Hook for getting a single welder
export function useWelder(id: string) {
  return useQuery({
    queryKey: WELDERS_QUERY_KEYS.detail(id),
    queryFn: () => welderService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// Hook for creating a welder
export function useCreateWelder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWelderData & { profile_image?: File }) => welderService.create(data),
    onSuccess: (newWelder) => {
      // Invalidate and refetch welders list
      queryClient.invalidateQueries({ queryKey: WELDERS_QUERY_KEYS.lists() })
      
      // Add the new welder to the cache
      queryClient.setQueryData(WELDERS_QUERY_KEYS.detail(newWelder.id), newWelder)
    },
  })
}

// Hook for updating a welder
export function useUpdateWelder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWelderData & { profile_image?: File; remove_image?: boolean } }) =>
      welderService.update(id, data),
    onSuccess: (updatedWelder, { id }) => {
      // Update the specific welder in cache
      queryClient.setQueryData(WELDERS_QUERY_KEYS.detail(id), updatedWelder)
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: WELDERS_QUERY_KEYS.lists() })
    },
  })
}

// Hook for deleting a welder
export function useDeleteWelder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => welderService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the welder from cache
      queryClient.removeQueries({ queryKey: WELDERS_QUERY_KEYS.detail(deletedId) })
      
      // Invalidate lists to refetch without the deleted welder
      queryClient.invalidateQueries({ queryKey: WELDERS_QUERY_KEYS.lists() })
    },
  })
}

// Hook for prefetching a welder (useful for hover states)
export function usePrefetchWelder() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: WELDERS_QUERY_KEYS.detail(id),
      queryFn: () => welderService.getById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}
