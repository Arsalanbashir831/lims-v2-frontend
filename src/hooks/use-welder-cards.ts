import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { welderCardService, CreateWelderCardData, UpdateWelderCardData } from '@/services/welder-cards.service'

// Query keys for consistent caching
export const WELDER_CARDS_QUERY_KEYS = {
  all: ['welder-cards'] as const,
  lists: () => [...WELDER_CARDS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, search?: string, limit?: number) => [...WELDER_CARDS_QUERY_KEYS.lists(), { page, search, limit }] as const,
  details: () => [...WELDER_CARDS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WELDER_CARDS_QUERY_KEYS.details(), id] as const,
  search: (query: string, page: number, limit?: number) => [...WELDER_CARDS_QUERY_KEYS.all, 'search', { query, page, limit }] as const,
}

// Hook for getting welder cards list with pagination
export function useWelderCards(page: number = 1, searchQuery?: string, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: searchQuery ? WELDER_CARDS_QUERY_KEYS.search(searchQuery, page, limit) : WELDER_CARDS_QUERY_KEYS.list(page, searchQuery, limit),
    queryFn: () => {
      if (searchQuery?.trim()) {
        return welderCardService.search(searchQuery.trim(), page, limit)
      }
      return welderCardService.getAll(page, limit, false) // Don't show inactive cards
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

// Hook for getting a single welder card
export function useWelderCard(id: string) {
  return useQuery({
    queryKey: WELDER_CARDS_QUERY_KEYS.detail(id),
    queryFn: () => welderCardService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// Hook for creating a welder card
export function useCreateWelderCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWelderCardData) => welderCardService.create(data),
    onSuccess: (newWelderCard) => {
      // Invalidate and refetch welder cards list
      queryClient.invalidateQueries({ queryKey: WELDER_CARDS_QUERY_KEYS.lists() })
      
      // Add the new welder card to the cache
      queryClient.setQueryData(WELDER_CARDS_QUERY_KEYS.detail(newWelderCard.id), newWelderCard)
    },
  })
}

// Hook for updating a welder card
export function useUpdateWelderCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWelderCardData }) =>
      welderCardService.update(id, data),
    onSuccess: (updatedWelderCard, { id }) => {
      // Update the specific welder card in cache
      queryClient.setQueryData(WELDER_CARDS_QUERY_KEYS.detail(id), updatedWelderCard)
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: WELDER_CARDS_QUERY_KEYS.lists() })
    },
  })
}

// Hook for deleting a welder card
export function useDeleteWelderCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => welderCardService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the welder card from cache
      queryClient.removeQueries({ queryKey: WELDER_CARDS_QUERY_KEYS.detail(deletedId) })
      
      // Invalidate lists to refetch without the deleted welder card
      queryClient.invalidateQueries({ queryKey: WELDER_CARDS_QUERY_KEYS.lists() })
    },
  })
}

// Hook for prefetching a welder card (useful for hover states)
export function usePrefetchWelderCard() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: WELDER_CARDS_QUERY_KEYS.detail(id),
      queryFn: () => welderCardService.getById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}
