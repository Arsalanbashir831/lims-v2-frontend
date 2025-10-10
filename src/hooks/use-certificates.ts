import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { certificatesService, type Certificate, type CreateCertificateData, type UpdateCertificateData } from "@/services/certificates.service"

// Query Keys
export const CERTIFICATES_QUERY_KEYS = {
  all: ['certificates'] as const,
  lists: () => [...CERTIFICATES_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery?: string) => [...CERTIFICATES_QUERY_KEYS.lists(), page, searchQuery] as const,
  search: (query: string, page: number) => [...CERTIFICATES_QUERY_KEYS.all, 'search', query, page] as const,
  details: () => [...CERTIFICATES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CERTIFICATES_QUERY_KEYS.details(), id] as const,
}

// Hooks
export function useCertificates(page: number = 1, searchQuery?: string, enabled: boolean = true) {
  const hasSearchQuery = searchQuery?.trim()
  
  return useQuery({
    queryKey: hasSearchQuery 
      ? CERTIFICATES_QUERY_KEYS.search(searchQuery, page)
      : CERTIFICATES_QUERY_KEYS.list(page, searchQuery),
    queryFn: () => {
      if (hasSearchQuery) {
        return certificatesService.search(searchQuery, page)
      }
      return certificatesService.getAll(page)
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

export function useCertificateDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: CERTIFICATES_QUERY_KEYS.detail(id),
    queryFn: () => certificatesService.getById(id),
    enabled: enabled && Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCreateCertificate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCertificateData) => certificatesService.create(data),
    onSuccess: (newCertificate) => {
      // Invalidate and refetch certificates list
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEYS.lists() })
      // Set the new certificate in cache
      queryClient.setQueryData(
        CERTIFICATES_QUERY_KEYS.detail(newCertificate.data.id),
        newCertificate
      )
    },
  })
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCertificateData }) =>
      certificatesService.update(id, data),
    onSuccess: (updatedCertificate, { id }) => {
      // Update the specific certificate in cache
      queryClient.setQueryData(
        CERTIFICATES_QUERY_KEYS.detail(id),
        updatedCertificate
      )
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEYS.lists() })
    },
  })
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => certificatesService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted certificate from cache
      queryClient.removeQueries({ queryKey: CERTIFICATES_QUERY_KEYS.detail(deletedId) })
      // Invalidate lists to remove it from the list
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEYS.lists() })
    },
  })
}

export function usePrefetchCertificate() {
  const queryClient = useQueryClient()
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: CERTIFICATES_QUERY_KEYS.detail(id),
      queryFn: () => certificatesService.getById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}
