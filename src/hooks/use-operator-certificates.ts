import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { operatorCertificateService, CreateOperatorCertificateData, UpdateOperatorCertificateData } from '@/services/welder-operator-certificates.service'

// Query keys for consistent caching
export const OPERATOR_CERTIFICATES_QUERY_KEYS = {
  all: ['operator-certificates'] as const,
  lists: () => [...OPERATOR_CERTIFICATES_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery: string, limit: number) => 
    [...OPERATOR_CERTIFICATES_QUERY_KEYS.lists(), { page, searchQuery, limit }] as const,
  details: () => [...OPERATOR_CERTIFICATES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...OPERATOR_CERTIFICATES_QUERY_KEYS.details(), id] as const,
}

// Get all operator certificates
export const useOperatorCertificates = (page: number = 1, searchQuery: string = "", limit: number = 10) => {
  return useQuery({
    queryKey: OPERATOR_CERTIFICATES_QUERY_KEYS.list(page, searchQuery, limit),
    queryFn: () => {
      if (searchQuery.trim()) {
        return operatorCertificateService.search(searchQuery, page, limit)
      }
      return operatorCertificateService.getAll(page, limit, false)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single operator certificate
export const useOperatorCertificate = (id: string) => {
  return useQuery({
    queryKey: OPERATOR_CERTIFICATES_QUERY_KEYS.detail(id),
    queryFn: () => operatorCertificateService.getById(id),
    enabled: !!id,
  })
}

// Create operator certificate
export const useCreateOperatorCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOperatorCertificateData) => operatorCertificateService.create(data),
    onSuccess: () => {
      // Invalidate and refetch operator certificates lists
      queryClient.invalidateQueries({ queryKey: OPERATOR_CERTIFICATES_QUERY_KEYS.lists() })
    },
  })
}

// Update operator certificate
export const useUpdateOperatorCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOperatorCertificateData }) => 
      operatorCertificateService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch operator certificates lists and detail
      queryClient.invalidateQueries({ queryKey: OPERATOR_CERTIFICATES_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: OPERATOR_CERTIFICATES_QUERY_KEYS.detail(id) })
    },
  })
}

// Delete operator certificate
export const useDeleteOperatorCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => operatorCertificateService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch operator certificates lists
      queryClient.invalidateQueries({ queryKey: OPERATOR_CERTIFICATES_QUERY_KEYS.lists() })
    },
  })
}
