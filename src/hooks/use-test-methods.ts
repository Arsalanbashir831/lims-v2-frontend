import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testMethodService, CreateTestMethodData, UpdateTestMethodData } from '@/services/test-methods.service'

// Query keys for consistent caching
export const TEST_METHODS_QUERY_KEYS = {
  all: ['test-methods'] as const,
  lists: () => [...TEST_METHODS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, search?: string) => [...TEST_METHODS_QUERY_KEYS.lists(), { page, search }] as const,
  details: () => [...TEST_METHODS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TEST_METHODS_QUERY_KEYS.details(), id] as const,
  search: (query: string, page: number) => [...TEST_METHODS_QUERY_KEYS.all, 'search', { query, page }] as const,
}

// Hook for getting test methods list with pagination
export function useTestMethods(page: number = 1, searchQuery?: string) {
  return useQuery({
    queryKey: searchQuery ? TEST_METHODS_QUERY_KEYS.search(searchQuery, page) : TEST_METHODS_QUERY_KEYS.list(page, searchQuery),
    queryFn: () => {
      if (searchQuery?.trim()) {
        return testMethodService.search(searchQuery.trim(), page)
      }
      return testMethodService.getAll(page)
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (test methods change less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

// Hook for getting a single test method
export function useTestMethod(id: string) {
  return useQuery({
    queryKey: TEST_METHODS_QUERY_KEYS.detail(id),
    queryFn: () => testMethodService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes (test methods are relatively static)
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for creating a test method
export function useCreateTestMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTestMethodData) => testMethodService.create(data),
    onSuccess: (newTestMethod) => {
      // Invalidate and refetch test methods list
      queryClient.invalidateQueries({ queryKey: TEST_METHODS_QUERY_KEYS.lists() })

      // Add the new test method to the cache
      queryClient.setQueryData(TEST_METHODS_QUERY_KEYS.detail(newTestMethod.id), newTestMethod)
    },
  })
}

// Hook for updating a test method
export function useUpdateTestMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestMethodData }) =>
      testMethodService.update(id, data),
    onSuccess: (updatedTestMethod, { id }) => {
      // Update the specific test method in cache
      queryClient.setQueryData(TEST_METHODS_QUERY_KEYS.detail(id), updatedTestMethod)

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: TEST_METHODS_QUERY_KEYS.lists() })
    },
  })
}

// Hook for deleting a test method
export function useDeleteTestMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => testMethodService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the test method from cache
      queryClient.removeQueries({ queryKey: TEST_METHODS_QUERY_KEYS.detail(deletedId) })

      // Invalidate lists to refetch without the deleted test method
      queryClient.invalidateQueries({ queryKey: TEST_METHODS_QUERY_KEYS.lists() })
    },
  })
}

// Hook for prefetching a test method
export function usePrefetchTestMethod() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: TEST_METHODS_QUERY_KEYS.detail(id),
      queryFn: () => testMethodService.getById(id),
      staleTime: 10 * 60 * 1000,
    })
  }
}
