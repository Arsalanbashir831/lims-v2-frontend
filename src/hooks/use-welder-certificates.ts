import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { welderCertificateService, CreateWelderCertificateData, UpdateWelderCertificateData } from '@/services/welder-certificates.service'

// Query keys for consistent caching
export const WELDER_CERTIFICATES_QUERY_KEYS = {
  all: ['welder-certificates'] as const,
  lists: () => [...WELDER_CERTIFICATES_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery: string, limit: number) => 
    [...WELDER_CERTIFICATES_QUERY_KEYS.lists(), { page, searchQuery, limit }] as const,
  details: () => [...WELDER_CERTIFICATES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WELDER_CERTIFICATES_QUERY_KEYS.details(), id] as const,
}

// Get all welder certificates
export const useWelderCertificates = (page: number = 1, searchQuery: string = "", limit: number = 10) => {
  return useQuery({
    queryKey: WELDER_CERTIFICATES_QUERY_KEYS.list(page, searchQuery, limit),
    queryFn: () => {
      if (searchQuery && searchQuery.trim()) {
        return welderCertificateService.search(searchQuery.trim(), page, limit)
      }
      return welderCertificateService.getAll(page, limit, false)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  })
}

// Get single welder certificate
export const useWelderCertificate = (id: string) => {
  return useQuery({
    queryKey: WELDER_CERTIFICATES_QUERY_KEYS.detail(id),
    queryFn: () => welderCertificateService.getById(id),
    enabled: !!id,
  })
}

// Create welder certificate
export const useCreateWelderCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWelderCertificateData) => welderCertificateService.create(data),
    onSuccess: () => {
      // Invalidate and refetch welder certificates lists
      queryClient.invalidateQueries({ queryKey: WELDER_CERTIFICATES_QUERY_KEYS.lists() })
    },
  })
}

// Update welder certificate
export const useUpdateWelderCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWelderCertificateData }) => 
      welderCertificateService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch welder certificates lists and detail
      queryClient.invalidateQueries({ queryKey: WELDER_CERTIFICATES_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: WELDER_CERTIFICATES_QUERY_KEYS.detail(id) })
    },
  })
}

// Delete welder certificate
export const useDeleteWelderCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => welderCertificateService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch welder certificates lists
      queryClient.invalidateQueries({ queryKey: WELDER_CERTIFICATES_QUERY_KEYS.lists() })
    },
  })
}
