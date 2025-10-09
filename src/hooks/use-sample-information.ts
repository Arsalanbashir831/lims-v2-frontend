import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sampleInformationService, SampleInformationResponse, CreateSampleInformationData, UpdateSampleInformationData } from '@/services/sample-information.service'

// Query keys for consistent caching
export const SAMPLE_INFORMATION_QUERY_KEYS = {
  all: ['sample-information'] as const,
  lists: () => [...SAMPLE_INFORMATION_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, search?: string) => [...SAMPLE_INFORMATION_QUERY_KEYS.lists(), { page, search }] as const,
  details: () => [...SAMPLE_INFORMATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SAMPLE_INFORMATION_QUERY_KEYS.details(), id] as const,
  search: (query: string, page: number) => [...SAMPLE_INFORMATION_QUERY_KEYS.all, 'search', { query, page }] as const,
}

// Hook for getting sample information list with pagination
export function useSampleInformation(page: number = 1, searchQuery?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: searchQuery ? SAMPLE_INFORMATION_QUERY_KEYS.search(searchQuery, page) : SAMPLE_INFORMATION_QUERY_KEYS.list(page, searchQuery),
    queryFn: () => {
      if (searchQuery?.trim()) {
        return sampleInformationService.search(searchQuery.trim(), page)
      }
      return sampleInformationService.getAll(page)
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

// Hook for getting a single sample information
export function useSampleInformationDetail(id: string) {
  return useQuery({
    queryKey: SAMPLE_INFORMATION_QUERY_KEYS.detail(id),
    queryFn: () => sampleInformationService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// Hook for creating sample information
export function useCreateSampleInformation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSampleInformationData) => sampleInformationService.create(data),
    onSuccess: (newSampleInfo) => {
      // Invalidate and refetch sample information list
      queryClient.invalidateQueries({ queryKey: SAMPLE_INFORMATION_QUERY_KEYS.lists() })
      
      // Add the new sample information to the cache
      queryClient.setQueryData(SAMPLE_INFORMATION_QUERY_KEYS.detail(newSampleInfo.job_id), newSampleInfo)
    },
  })
}

// Hook for updating sample information
export function useUpdateSampleInformation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSampleInformationData }) => 
      sampleInformationService.update(id, data),
    onSuccess: (updatedSampleInfo, { id }) => {
      // Update the specific sample information in cache
      queryClient.setQueryData(SAMPLE_INFORMATION_QUERY_KEYS.detail(id), updatedSampleInfo)
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: SAMPLE_INFORMATION_QUERY_KEYS.lists() })
    },
  })
}

// Hook for deleting sample information
export function useDeleteSampleInformation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sampleInformationService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the sample information from cache
      queryClient.removeQueries({ queryKey: SAMPLE_INFORMATION_QUERY_KEYS.detail(deletedId) })
      
      // Invalidate lists to refetch without the deleted sample information
      queryClient.invalidateQueries({ queryKey: SAMPLE_INFORMATION_QUERY_KEYS.lists() })
    },
  })
}

// Hook for prefetching sample information
export function usePrefetchSampleInformation() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: SAMPLE_INFORMATION_QUERY_KEYS.detail(id),
      queryFn: () => sampleInformationService.getById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}
