import { useMutation, useQueryClient } from '@tanstack/react-query'
import { specimensService, CreateSpecimenData, ParallelCreateSpecimensResponse, SpecimenResponse } from '@/services/specimens.service'

// Query keys for consistent caching
export const SPECIMENS_QUERY_KEYS = {
  all: ['specimens'] as const,
  details: () => [...SPECIMENS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SPECIMENS_QUERY_KEYS.details(), id] as const,
}

// Hook for creating a single specimen
export function useCreateSpecimen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSpecimenData) => specimensService.create(data),
    onSuccess: (newSpecimen) => {
      // Add the new specimen to the cache
      queryClient.setQueryData(SPECIMENS_QUERY_KEYS.detail(newSpecimen.id), newSpecimen)
    },
  })
}

// Hook for parallel creating specimens
export function useParallelCreateSpecimens() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (specimens: CreateSpecimenData[]) => specimensService.createParallel(specimens),
    onSuccess: (response) => {
      // Add all successfully created specimens to the cache
      response.success.forEach(specimen => {
        queryClient.setQueryData(SPECIMENS_QUERY_KEYS.detail(specimen.id), specimen)
      })
    },
  })
}

// Hook for updating a specimen
export function useUpdateSpecimen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSpecimenData> }) =>
      specimensService.update(id, data),
    onSuccess: (updatedSpecimen, { id }) => {
      // Update the specific specimen in cache
      queryClient.setQueryData(SPECIMENS_QUERY_KEYS.detail(id), updatedSpecimen)
    },
  })
}

// Hook for deleting a specimen
export function useDeleteSpecimen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => specimensService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the specimen from cache
      queryClient.removeQueries({ queryKey: SPECIMENS_QUERY_KEYS.detail(deletedId) })
    },
  })
}
