import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentService, CreateEquipmentData, UpdateEquipmentData } from '@/services/equipments.service'

// Query keys for consistent caching
export const EQUIPMENTS_QUERY_KEYS = {
    all: ['equipments'] as const,
    lists: () => [...EQUIPMENTS_QUERY_KEYS.all, 'list'] as const,
    list: (page: number, search?: string) => [...EQUIPMENTS_QUERY_KEYS.lists(), { page, search }] as const,
    details: () => [...EQUIPMENTS_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...EQUIPMENTS_QUERY_KEYS.details(), id] as const,
    search: (query: string, page: number) => [...EQUIPMENTS_QUERY_KEYS.all, 'search', { query, page }] as const,
}

// Hook for getting equipments list with pagination
export function useEquipments(page: number = 1, searchQuery?: string) {
    return useQuery({
        queryKey: searchQuery ? EQUIPMENTS_QUERY_KEYS.search(searchQuery, page) : EQUIPMENTS_QUERY_KEYS.list(page, searchQuery),
        queryFn: () => {
            if (searchQuery?.trim()) {
                return equipmentService.search(searchQuery.trim(), page)
            }
            return equipmentService.getAll(page)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes (equipments change less frequently)
        gcTime: 20 * 60 * 1000, // 20 minutes
        placeholderData: (previousData) => previousData,
    })
}

// Hook for getting a single equipment
export function useEquipment(id: string) {
    return useQuery({
        queryKey: EQUIPMENTS_QUERY_KEYS.detail(id),
        queryFn: () => equipmentService.getById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

// Hook for creating an equipment
export function useCreateEquipment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEquipmentData) => equipmentService.create(data),
        onSuccess: (newEquipment) => {
            // Invalidate and refetch equipments list
            queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEYS.lists() })

            // Add the new equipment to the cache
            queryClient.setQueryData(EQUIPMENTS_QUERY_KEYS.detail(newEquipment.id), newEquipment)
        },
    })
}

// Hook for updating an equipment
export function useUpdateEquipment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentData }) =>
            equipmentService.update(id, data),
        onSuccess: (updatedEquipment, { id }) => {
            // Update the specific equipment in cache
            queryClient.setQueryData(EQUIPMENTS_QUERY_KEYS.detail(id), updatedEquipment)

            // Invalidate lists to refetch with updated data
            queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEYS.lists() })
        },
    })
}

// Hook for deleting an equipment
export function useDeleteEquipment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => equipmentService.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove the equipment from cache
            queryClient.removeQueries({ queryKey: EQUIPMENTS_QUERY_KEYS.detail(deletedId) })

            // Invalidate lists to refetch without the deleted equipment
            queryClient.invalidateQueries({ queryKey: EQUIPMENTS_QUERY_KEYS.lists() })
        },
    })
}

// Hook for prefetching an equipment
export function usePrefetchEquipment() {
    const queryClient = useQueryClient()

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: EQUIPMENTS_QUERY_KEYS.detail(id),
            queryFn: () => equipmentService.getById(id),
            staleTime: 10 * 60 * 1000,
        })
    }
}
