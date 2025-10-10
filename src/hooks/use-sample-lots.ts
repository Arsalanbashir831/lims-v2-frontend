import { useQuery } from '@tanstack/react-query'
import { sampleLotService } from '@/services/sample-lots.service'

// Query keys for consistent cache management
export const SAMPLE_LOTS_QUERY_KEYS = {
  all: ['sample-lots'] as const,
  lists: () => [...SAMPLE_LOTS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number) => [...SAMPLE_LOTS_QUERY_KEYS.lists(), page] as const,
  search: (query: string, page: number) => [...SAMPLE_LOTS_QUERY_KEYS.lists(), 'search', query, page] as const,
  details: () => [...SAMPLE_LOTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SAMPLE_LOTS_QUERY_KEYS.details(), id] as const,
  byJob: (jobId: string) => [...SAMPLE_LOTS_QUERY_KEYS.all, 'by-job', jobId] as const,
}

export function useSampleLots(page: number = 1) {
  return useQuery({
    queryKey: SAMPLE_LOTS_QUERY_KEYS.list(page),
    queryFn: () => sampleLotService.getAll(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSampleLotsSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: SAMPLE_LOTS_QUERY_KEYS.search(query, page),
    queryFn: () => sampleLotService.search(query, page),
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSampleLotDetail(id: string) {
  return useQuery({
    queryKey: SAMPLE_LOTS_QUERY_KEYS.detail(id),
    queryFn: () => sampleLotService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSampleLotsByJob(jobId: string) {
  return useQuery({
    queryKey: SAMPLE_LOTS_QUERY_KEYS.byJob(jobId),
    queryFn: () => sampleLotService.getByJobDocumentId(jobId),
    enabled: !!jobId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
