import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pqrService, CreatePQRData, UpdatePQRData } from '@/services/pqr.service'

// Query keys for consistent caching
export const PQR_QUERY_KEYS = {
  all: ['pqrs'] as const,
  lists: () => [...PQR_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery: string, limit: number) => 
    [...PQR_QUERY_KEYS.lists(), { page, searchQuery, limit }] as const,
  details: () => [...PQR_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PQR_QUERY_KEYS.details(), id] as const,
  byWelder: (welderId: string, page: number, limit: number) => 
    [...PQR_QUERY_KEYS.all, 'by-welder', welderId, { page, limit }] as const,
  byDateRange: (startDate: string, endDate: string, page: number, limit: number) => 
    [...PQR_QUERY_KEYS.all, 'by-date-range', { startDate, endDate, page, limit }] as const,
  byType: (type: 'API_1104' | 'ASME_SEC_IX', page: number, limit: number) => 
    [...PQR_QUERY_KEYS.all, 'by-type', type, { page, limit }] as const,
}

// Get all PQRs with search
export const usePQRs = (page: number = 1, searchQuery: string = '', limit: number = 10) => {
  return useQuery({
    queryKey: PQR_QUERY_KEYS.list(page, searchQuery, limit),
    queryFn: () => searchQuery 
      ? pqrService.search(searchQuery, page, limit)
      : pqrService.getAll(page, limit),
    enabled: true,
  })
}

// Get single PQR
export const usePQR = (id: string) => {
  return useQuery({
    queryKey: PQR_QUERY_KEYS.detail(id),
    queryFn: () => pqrService.getById(id),
    enabled: !!id,
  })
}

// Get PQRs by welder
export const usePQRsByWelder = (welderId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: PQR_QUERY_KEYS.byWelder(welderId, page, limit),
    queryFn: () => pqrService.getByWelder(welderId, page, limit),
    enabled: !!welderId,
  })
}

// Get PQRs by date range
export const usePQRsByDateRange = (startDate: string, endDate: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: PQR_QUERY_KEYS.byDateRange(startDate, endDate, page, limit),
    queryFn: () => pqrService.getByDateRange(startDate, endDate, page, limit),
    enabled: !!startDate && !!endDate,
  })
}

// Get PQRs by type
export const usePQRsByType = (type: 'API_1104' | 'ASME_SEC_IX', page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: PQR_QUERY_KEYS.byType(type, page, limit),
    queryFn: () => pqrService.getByType(type, page, limit),
    enabled: true,
  })
}

// Create PQR
export const useCreatePQR = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, files }: { data: CreatePQRData; files?: File[] }) => pqrService.create(data, files),
    onSuccess: () => {
      // Invalidate and refetch PQR lists
      queryClient.invalidateQueries({ queryKey: PQR_QUERY_KEYS.lists() })
    },
  })
}

// Update PQR
export const useUpdatePQR = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data, files }: { id: string; data: UpdatePQRData; files?: File[] }) => 
      pqrService.update(id, data, files),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch PQR lists and detail
      queryClient.invalidateQueries({ queryKey: PQR_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PQR_QUERY_KEYS.detail(id) })
    },
  })
}

// Delete PQR
export const useDeletePQR = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pqrService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch PQR lists
      queryClient.invalidateQueries({ queryKey: PQR_QUERY_KEYS.lists() })
    },
  })
}
