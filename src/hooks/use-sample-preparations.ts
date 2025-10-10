import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { samplePreparationService, SamplePreparationResponse, CreateSamplePreparationData, UpdateSamplePreparationData } from '@/services/sample-preparation.service'

// Query keys for consistent caching
export const SAMPLE_PREPARATIONS_QUERY_KEYS = {
    all: ['sample-preparations'] as const,
    lists: () => [...SAMPLE_PREPARATIONS_QUERY_KEYS.all, 'list'] as const,
    list: (page: number, search?: string, filters?: any) => [...SAMPLE_PREPARATIONS_QUERY_KEYS.lists(), { page, search, filters }] as const,
    details: () => [...SAMPLE_PREPARATIONS_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...SAMPLE_PREPARATIONS_QUERY_KEYS.details(), id] as const,
    search: (query: string, page: number, filters?: any) => [...SAMPLE_PREPARATIONS_QUERY_KEYS.all, 'search', { query, page, filters }] as const,
    byJob: (jobId: string) => [...SAMPLE_PREPARATIONS_QUERY_KEYS.all, 'by-job', jobId] as const,
}

// Hook for getting sample preparations list with pagination
export function useSamplePreparations(page: number = 1, searchQuery?: string, filters?: any, enabled: boolean = true) {
  // Check if there are actual filter values (not just empty strings)
  const hasFilters = searchQuery?.trim() || (filters && Object.values(filters).some(value => value && value.toString().trim() !== ''))
  
  return useQuery({
    queryKey: hasFilters ? SAMPLE_PREPARATIONS_QUERY_KEYS.search(searchQuery || '', page, filters) : SAMPLE_PREPARATIONS_QUERY_KEYS.list(page, searchQuery, filters),
    queryFn: () => {
      if (hasFilters) {
        return samplePreparationService.search(searchQuery?.trim() || '', page, filters)
      }
      return samplePreparationService.getAll(page)
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

// Hook for getting a single sample preparation record
export function useSamplePreparationDetail(id: string) {
    return useQuery({
        queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.detail(id),
        queryFn: () => samplePreparationService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 20 * 60 * 1000, // 20 minutes
    })
}

// Hook for creating sample preparation
export function useCreateSamplePreparation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateSamplePreparationData) => samplePreparationService.create(data),
        onSuccess: (newSamplePrep) => {
            // Invalidate and refetch sample preparations list
            queryClient.invalidateQueries({ queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.lists() })

            // Add the new sample preparation to the cache
            queryClient.setQueryData(SAMPLE_PREPARATIONS_QUERY_KEYS.detail(newSamplePrep.id), newSamplePrep)
        },
    })
}

// Hook for updating sample preparation
export function useUpdateSamplePreparation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSamplePreparationData }) =>
            samplePreparationService.update(id, data),
        onSuccess: (updatedSamplePrep, { id }) => {
            // Update the specific sample preparation in cache
            queryClient.setQueryData(SAMPLE_PREPARATIONS_QUERY_KEYS.detail(id), updatedSamplePrep)

            // Invalidate the specific detail query to ensure fresh data on re-edit
            queryClient.invalidateQueries({ queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.detail(id) })

            // Invalidate lists to refetch with updated data
            queryClient.invalidateQueries({ queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.lists() })
        },
    })
}

// Hook for deleting sample preparation
export function useDeleteSamplePreparation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => samplePreparationService.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove the sample preparation from cache
            queryClient.removeQueries({ queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.detail(deletedId) })

            // Invalidate lists to refetch without the deleted sample preparation
            queryClient.invalidateQueries({ queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.lists() })
        },
    })
}

// Hook for prefetching sample preparation
export function usePrefetchSamplePreparation() {
    const queryClient = useQueryClient()

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.detail(id),
            queryFn: () => samplePreparationService.getById(id),
            staleTime: 5 * 60 * 1000,
        })
    }
}

// Hook for getting sample preparations by job ID
export function useSamplePreparationsByJob(jobId: string) {
    return useQuery({
        queryKey: SAMPLE_PREPARATIONS_QUERY_KEYS.byJob(jobId),
        queryFn: () => samplePreparationService.getByJobId(jobId),
        enabled: !!jobId,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    })
}
