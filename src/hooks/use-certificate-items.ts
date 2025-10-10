import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { certificateItemsService, type CertificateItem, type CreateCertificateItemData, type UpdateCertificateItemData } from "@/services/certificate-items.service"

// Query Keys
export const CERTIFICATE_ITEMS_QUERY_KEYS = {
  all: ['certificate-items'] as const,
  lists: () => [...CERTIFICATE_ITEMS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery?: string) => [...CERTIFICATE_ITEMS_QUERY_KEYS.lists(), page, searchQuery] as const,
  search: (query: string, page: number) => [...CERTIFICATE_ITEMS_QUERY_KEYS.all, 'search', query, page] as const,
  details: () => [...CERTIFICATE_ITEMS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CERTIFICATE_ITEMS_QUERY_KEYS.details(), id] as const,
  byCertificate: (certificateId: string) => [...CERTIFICATE_ITEMS_QUERY_KEYS.all, 'by-certificate', certificateId] as const,
}

// Hooks
export function useCertificateItems(page: number = 1, searchQuery?: string, enabled: boolean = true) {
  const hasSearchQuery = searchQuery?.trim()
  
  return useQuery({
    queryKey: hasSearchQuery 
      ? CERTIFICATE_ITEMS_QUERY_KEYS.search(searchQuery || '', page)
      : CERTIFICATE_ITEMS_QUERY_KEYS.list(page, searchQuery),
    queryFn: () => {
      if (hasSearchQuery) {
        return certificateItemsService.search(searchQuery || '', page)
      }
      return certificateItemsService.getAll(page)
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

export function useCertificateItemsByCertificate(certificateId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.byCertificate(certificateId),
    queryFn: () => certificateItemsService.getByCertificateId(certificateId),
    enabled: enabled && Boolean(certificateId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCertificateItemDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.detail(id),
    queryFn: () => certificateItemsService.getById(id),
    enabled: enabled && Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCreateCertificateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCertificateItemData) => certificateItemsService.create(data),
    onSuccess: (newCertificateItem, variables) => {
      // Invalidate and refetch certificate items list
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.lists() })
      // Invalidate certificate-specific items
      queryClient.invalidateQueries({ 
        queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.byCertificate(variables.certificate_id) 
      })
      // Set the new certificate item in cache
      queryClient.setQueryData(
        CERTIFICATE_ITEMS_QUERY_KEYS.detail(newCertificateItem.data.id),
        newCertificateItem
      )
    },
  })
}

export function useUpdateCertificateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCertificateItemData }) =>
      certificateItemsService.update(id, data),
    onSuccess: (updatedCertificateItem, { id, data }) => {
      // Update the specific certificate item in cache
      queryClient.setQueryData(
        CERTIFICATE_ITEMS_QUERY_KEYS.detail(id),
        updatedCertificateItem
      )
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.lists() })
      // Invalidate certificate-specific items if certificate_id changed
      if (data.certificate_id) {
        queryClient.invalidateQueries({ 
          queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.byCertificate(data.certificate_id) 
        })
      }
    },
  })
}

export function useDeleteCertificateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => certificateItemsService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted certificate item from cache
      queryClient.removeQueries({ queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.detail(deletedId) })
      // Invalidate lists to remove it from the list
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.lists() })
      // Invalidate all certificate-specific items (we don't know which certificate it belonged to)
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.all })
    },
  })
}

export function usePrefetchCertificateItem() {
  const queryClient = useQueryClient()
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: CERTIFICATE_ITEMS_QUERY_KEYS.detail(id),
      queryFn: () => certificateItemsService.getById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

export function useUploadCertificateItemImage() {
  return useMutation({
    mutationFn: (data: { image: File; specimen_id: string }) => 
      certificateItemsService.uploadImage(data)
  })
}
