import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sampleInformationService,
  SampleInformationResponse,
  CreateSampleInformationData,
  UpdateSampleInformationData,
} from "@/services/sample-information.service";
import { sampleLotService } from "@/services/sample-lots.service";

// Query keys for consistent caching
export const SAMPLE_INFORMATION_QUERY_KEYS = {
  all: ["sample-information"] as const,
  lists: () => [...SAMPLE_INFORMATION_QUERY_KEYS.all, "list"] as const,
  list: (page: number, search?: string) =>
    [...SAMPLE_INFORMATION_QUERY_KEYS.lists(), { page, search }] as const,
  details: () => [...SAMPLE_INFORMATION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...SAMPLE_INFORMATION_QUERY_KEYS.details(), id] as const,
  search: (query: string, page: number) =>
    [...SAMPLE_INFORMATION_QUERY_KEYS.all, "search", { query, page }] as const,
};

// Hook for getting sample information list with pagination
export function useSampleInformation(
  page: number = 1,
  searchQuery?: string,
  enabled: boolean = true
) {
  const hasSearchQuery = searchQuery && searchQuery.trim() !== "";

  return useQuery({
    queryKey: hasSearchQuery
      ? SAMPLE_INFORMATION_QUERY_KEYS.search(searchQuery, page)
      : SAMPLE_INFORMATION_QUERY_KEYS.list(page),
    queryFn: () => {
      return sampleInformationService.search(searchQuery?.trim() ?? "", page);
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  });
}

// Hook for getting sample information list filtered to show only jobs WITHOUT sample details
export function useSampleInformationWithoutDetails(
  page: number = 1,
  searchQuery?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: searchQuery
      ? [
          ...SAMPLE_INFORMATION_QUERY_KEYS.search(searchQuery, page),
          "without-details",
        ]
      : [
          ...SAMPLE_INFORMATION_QUERY_KEYS.list(page, searchQuery),
          "without-details",
        ],
    queryFn: async () => {
      const jobsData = await sampleInformationService.search(
        searchQuery?.trim() ?? "",
        page
      );

      // Filter to show only jobs that DON'T have sample details (sample lots)
      const filteredJobs = [];

      if (jobsData.results) {
        for (const job of jobsData.results) {
          try {
            // Check if this job has sample lots (sample details)
            const sampleLotsResponse =
              await sampleLotService.getByJobDocumentId(String(job.id));
            // If no sample lots exist, include this job in the filtered list
            if (sampleLotsResponse.data.length === 0) {
              filteredJobs.push(job);
            }
          } catch (error) {
            // If there's an error checking sample lots, assume no sample details exist
            // and include the job in the filtered list
            filteredJobs.push(job);
          }
        }
      }

      return {
        ...jobsData,
        results: filteredJobs,
        count: filteredJobs.length,
      };
    },
    enabled,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache this data
  });
}

// Hook for getting sample information list filtered to show only jobs WITH sample details
export function useSampleInformationWithDetails(
  page: number = 1,
  searchQuery?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: searchQuery
      ? [
          ...SAMPLE_INFORMATION_QUERY_KEYS.search(searchQuery, page),
          "with-details",
        ]
      : [
          ...SAMPLE_INFORMATION_QUERY_KEYS.list(page, searchQuery),
          "with-details",
        ],
    queryFn: async () => {
      const jobsData = await sampleInformationService.search(
        searchQuery?.trim() ?? "",
        page
      );

      // Filter to show only jobs that DO have sample details (sample lots)
      const filteredJobs = [];

      if (jobsData.results) {
        for (const job of jobsData.results) {
          try {
            // Check if this job has sample lots (sample details)
            const sampleLotsResponse =
              await sampleLotService.getByJobDocumentId(String(job.id));
            // If sample lots exist, include this job in the filtered list
            if (sampleLotsResponse.data.length > 0) {
              filteredJobs.push(job);
            }
          } catch (error) {
            // If there's an error checking sample lots, assume no sample details exist
            // and exclude the job from the filtered list
            // (don't add to filteredJobs)
          }
        }
      }

      return {
        ...jobsData,
        results: filteredJobs,
        count: filteredJobs.length,
      };
    },
    enabled,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache this data
  });
}

// Hook for getting a single sample information
export function useSampleInformationDetail(id: string) {
  return useQuery({
    queryKey: SAMPLE_INFORMATION_QUERY_KEYS.detail(id),
    queryFn: () => sampleInformationService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for creating sample information
export function useCreateSampleInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSampleInformationData) =>
      sampleInformationService.create(data),
    onSuccess: (newSampleInfo) => {
      // Invalidate and refetch sample information list
      queryClient.invalidateQueries({
        queryKey: SAMPLE_INFORMATION_QUERY_KEYS.lists(),
      });

      // Add the new sample information to the cache
      queryClient.setQueryData(
        SAMPLE_INFORMATION_QUERY_KEYS.detail(newSampleInfo.job_id),
        newSampleInfo
      );
    },
  });
}

// Hook for updating sample information
export function useUpdateSampleInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSampleInformationData;
    }) => sampleInformationService.update(id, data),
    onSuccess: (updatedSampleInfo, { id }) => {
      // Update the specific sample information in cache
      queryClient.setQueryData(
        SAMPLE_INFORMATION_QUERY_KEYS.detail(id),
        updatedSampleInfo
      );

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({
        queryKey: SAMPLE_INFORMATION_QUERY_KEYS.lists(),
      });
    },
  });
}

// Hook for deleting sample information
export function useDeleteSampleInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sampleInformationService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the sample information from cache
      queryClient.removeQueries({
        queryKey: SAMPLE_INFORMATION_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists to refetch without the deleted sample information
      queryClient.invalidateQueries({
        queryKey: SAMPLE_INFORMATION_QUERY_KEYS.lists(),
      });
    },
  });
}

// Hook for prefetching sample information
export function usePrefetchSampleInformation() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: SAMPLE_INFORMATION_QUERY_KEYS.detail(id),
      queryFn: () => sampleInformationService.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}
