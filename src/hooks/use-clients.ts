import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService, CreateClientData, UpdateClientData } from '@/services/clients.service'

// Query keys for consistent caching
export const CLIENTS_QUERY_KEYS = {
    all: ['clients'] as const,
    lists: () => [...CLIENTS_QUERY_KEYS.all, 'list'] as const,
    list: (page: number, search?: string) => [...CLIENTS_QUERY_KEYS.lists(), { page, search }] as const,
    details: () => [...CLIENTS_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...CLIENTS_QUERY_KEYS.details(), id] as const,
    search: (query: string, page: number) => [...CLIENTS_QUERY_KEYS.all, 'search', { query, page }] as const,
}

// Hook for getting clients list with pagination
export function useClients(page: number = 1, searchQuery?: string, enabled: boolean = true) {
    return useQuery({
        queryKey: searchQuery ? CLIENTS_QUERY_KEYS.search(searchQuery, page) : CLIENTS_QUERY_KEYS.list(page, searchQuery),
        queryFn: () => {
            if (searchQuery?.trim()) {
                return clientService.search(searchQuery.trim(), page)
            }
            return clientService.getAll(page)
        },
        enabled,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    })
}

// Hook for getting a single client
export function useClient(id: string) {
    return useQuery({
        queryKey: CLIENTS_QUERY_KEYS.detail(id),
        queryFn: () => clientService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    })
}

// Hook for creating a client
export function useCreateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateClientData) => clientService.create(data),
        onSuccess: (newClient) => {
            // Invalidate and refetch clients list
            queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.lists() })

            // Add the new client to the cache
            queryClient.setQueryData(CLIENTS_QUERY_KEYS.detail(newClient.id), newClient)
        },
    })
}

// Hook for updating a client
export function useUpdateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
            clientService.update(id, data),
        onSuccess: (updatedClient, { id }) => {
            // Update the specific client in cache
            queryClient.setQueryData(CLIENTS_QUERY_KEYS.detail(id), updatedClient)

            // Invalidate lists to refetch with updated data
            queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.lists() })
        },
    })
}

// Hook for deleting a client
export function useDeleteClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => clientService.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove the client from cache
            queryClient.removeQueries({ queryKey: CLIENTS_QUERY_KEYS.detail(deletedId) })

            // Invalidate lists to refetch without the deleted client
            queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.lists() })
        },
    })
}

// Hook for prefetching a client (useful for hover states)
export function usePrefetchClient() {
    const queryClient = useQueryClient()

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: CLIENTS_QUERY_KEYS.detail(id),
            queryFn: () => clientService.getById(id),
            staleTime: 5 * 60 * 1000,
        })
    }
}
