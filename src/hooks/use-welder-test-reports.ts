import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { welderTestReportsService, CreateWelderTestReportData, CreateWelderTestReportBatchData, UpdateWelderTestReportData, UpdateWelderTestReportBatchData } from '@/services/welder-test-reports.service'

// Query keys for consistent caching
export const WELDER_TEST_REPORTS_QUERY_KEYS = {
  all: ['welder-test-reports'] as const,
  lists: () => [...WELDER_TEST_REPORTS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery: string, limit: number) => 
    [...WELDER_TEST_REPORTS_QUERY_KEYS.lists(), { page, searchQuery, limit }] as const,
  details: () => [...WELDER_TEST_REPORTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WELDER_TEST_REPORTS_QUERY_KEYS.details(), id] as const,
  byWelder: (welderId: string, page: number, limit: number) => 
    [...WELDER_TEST_REPORTS_QUERY_KEYS.all, 'by-welder', welderId, { page, limit }] as const,
  byDateRange: (startDate: string, endDate: string, page: number, limit: number) => 
    [...WELDER_TEST_REPORTS_QUERY_KEYS.all, 'by-date-range', { startDate, endDate, page, limit }] as const,
  byStatus: (status: string, page: number, limit: number) => 
    [...WELDER_TEST_REPORTS_QUERY_KEYS.all, 'by-status', status, { page, limit }] as const,
}

// Get all welder test reports
export const useWelderTestReports = (page: number = 1, searchQuery: string = "", limit: number = 10) => {
  return useQuery({
    queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.list(page, searchQuery, limit),
    queryFn: () => {
      if (searchQuery.trim()) {
        return welderTestReportsService.search(searchQuery, page, limit)
      }
      return welderTestReportsService.getAll(page, limit)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single welder test report
export const useWelderTestReport = (id: string) => {
  return useQuery({
    queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.detail(id),
    queryFn: () => welderTestReportsService.getById(id),
    enabled: !!id,
  })
}

// Get welder test reports by welder ID
export const useWelderTestReportsByWelder = (welderId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.byWelder(welderId, page, limit),
    queryFn: () => welderTestReportsService.getByWelderId(welderId, page, limit),
    enabled: !!welderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get welder test reports by date range
export const useWelderTestReportsByDateRange = (startDate: string, endDate: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.byDateRange(startDate, endDate, page, limit),
    queryFn: () => welderTestReportsService.getByDateRange(startDate, endDate, page, limit),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get welder test reports by result status
export const useWelderTestReportsByStatus = (status: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.byStatus(status, page, limit),
    queryFn: () => welderTestReportsService.getByResultStatus(status, page, limit),
    enabled: !!status,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create welder test report
export const useCreateWelderTestReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWelderTestReportData) => welderTestReportsService.create(data),
    onSuccess: () => {
      // Invalidate and refetch welder test reports lists
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.lists() })
    },
  })
}

// Create batch welder test reports
export const useCreateWelderTestReportBatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWelderTestReportBatchData) => welderTestReportsService.createBatch(data),
    onSuccess: () => {
      // Invalidate and refetch welder test reports lists
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.lists() })
    },
  })
}

// Update welder test report
export const useUpdateWelderTestReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWelderTestReportData }) => 
      welderTestReportsService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch welder test reports lists and detail
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.detail(id) })
    },
  })
}

// Update welder test report batch
export const useUpdateWelderTestReportBatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWelderTestReportBatchData }) => 
      welderTestReportsService.updateBatch(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch welder test reports lists and detail
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.detail(id) })
    },
  })
}

// Delete welder test report
export const useDeleteWelderTestReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => welderTestReportsService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch welder test reports lists
      queryClient.invalidateQueries({ queryKey: WELDER_TEST_REPORTS_QUERY_KEYS.lists() })
    },
  })
}
