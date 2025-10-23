import { useQuery } from '@tanstack/react-query'
import { jobsService, type JobsSearchParams } from '@/services/jobs.service'

// Query keys for consistent cache management
export const JOBS_QUERY_KEYS = {
  all: ['jobs'] as const,
  lists: () => [...JOBS_QUERY_KEYS.all, 'list'] as const,
  list: (params: JobsSearchParams) => [...JOBS_QUERY_KEYS.lists(), params] as const,
  details: () => [...JOBS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOBS_QUERY_KEYS.details(), id] as const,
}

export function useJobs(params: JobsSearchParams = {}) {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.list(params),
    queryFn: () => jobsService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  })
}

export function useJobsSearch(query: string, params: JobsSearchParams = {}) {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.list({ ...params, search: query }),
    queryFn: () => jobsService.search(query, params),
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useJobDetail(id: string) {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.detail(id),
    queryFn: () => jobsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useJobsWithCertificates(params: JobsSearchParams = {}) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEYS.list(params), 'with-certificates'],
    queryFn: () => jobsService.getWithCertificates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}