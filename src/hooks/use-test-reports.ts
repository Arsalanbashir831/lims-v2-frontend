import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { testReportsService, type TestReport, type TestReportItem, type CreateTestReportData, type CreateTestReportItemData, type UpdateTestReportData, type UpdateTestReportItemData } from "@/services/test-reports.service"

// Query Keys
export const TEST_REPORTS_QUERY_KEYS = {
  all: ['test-reports'] as const,
  lists: () => [...TEST_REPORTS_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, searchQuery?: string) => [...TEST_REPORTS_QUERY_KEYS.lists(), page, searchQuery] as const,
  search: (query: string, page: number) => [...TEST_REPORTS_QUERY_KEYS.all, 'search', query, page] as const,
  details: () => [...TEST_REPORTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TEST_REPORTS_QUERY_KEYS.details(), id] as const,
  items: (certificateId: string) => [...TEST_REPORTS_QUERY_KEYS.all, 'items', certificateId] as const,
}

// Test Reports (Certificates) Hooks
export function useTestReports(page: number = 1, searchQuery?: string, enabled: boolean = true) {
  const hasSearchQuery = searchQuery?.trim()
  
  return useQuery({
    queryKey: hasSearchQuery 
      ? TEST_REPORTS_QUERY_KEYS.search(hasSearchQuery, page)
      : TEST_REPORTS_QUERY_KEYS.list(page, searchQuery),
    queryFn: () => {
      if (hasSearchQuery) {
        return testReportsService.search(hasSearchQuery, page)
      }
      return testReportsService.getAll(page)
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  })
}

export function useTestReportDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: TEST_REPORTS_QUERY_KEYS.detail(id),
    queryFn: () => testReportsService.getById(id),
    enabled: enabled && Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useTestReportItems(certificateId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: TEST_REPORTS_QUERY_KEYS.items(certificateId),
    queryFn: () => testReportsService.getItemsByCertificateId(certificateId),
    enabled: enabled && Boolean(certificateId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCreateTestReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateTestReportData) => testReportsService.create(data),
    onSuccess: (newTestReport) => {
      // Invalidate and refetch test reports list
      queryClient.invalidateQueries({ queryKey: TEST_REPORTS_QUERY_KEYS.lists() })
      // Set the new test report in cache
      queryClient.setQueryData(
        TEST_REPORTS_QUERY_KEYS.detail(newTestReport.data.id),
        newTestReport
      )
    },
  })
}

export function useUpdateTestReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestReportData }) =>
      testReportsService.update(id, data),
    onSuccess: (updatedTestReport, { id }) => {
      // Update the specific test report in cache
      queryClient.setQueryData(
        TEST_REPORTS_QUERY_KEYS.detail(id),
        updatedTestReport
      )
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: TEST_REPORTS_QUERY_KEYS.lists() })
    },
  })
}

export function useDeleteTestReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => testReportsService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted test report from cache
      queryClient.removeQueries({ queryKey: TEST_REPORTS_QUERY_KEYS.detail(deletedId) })
      // Invalidate lists to remove it from the list
      queryClient.invalidateQueries({ queryKey: TEST_REPORTS_QUERY_KEYS.lists() })
    },
  })
}

// Test Report Items Hooks
export function useCreateTestReportItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateTestReportItemData) => testReportsService.createItem(data),
    onSuccess: (newItem, variables) => {
      // Invalidate certificate items for this certificate
      queryClient.invalidateQueries({ 
        queryKey: TEST_REPORTS_QUERY_KEYS.items(variables.certificate_id) 
      })
    },
  })
}

export function useUpdateTestReportItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestReportItemData }) =>
      testReportsService.updateItem(id, data),
    onSuccess: (updatedItem, { data }) => {
      // Invalidate certificate items if certificate_id is provided
      if (data.certificate_id) {
        queryClient.invalidateQueries({ 
          queryKey: TEST_REPORTS_QUERY_KEYS.items(data.certificate_id) 
        })
      }
    },
  })
}

export function useDeleteTestReportItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => testReportsService.deleteItem(id),
    onSuccess: () => {
      // Invalidate all items queries (we don't know which certificate it belonged to)
      queryClient.invalidateQueries({ queryKey: TEST_REPORTS_QUERY_KEYS.all })
    },
  })
}

export function useUploadTestReportImage() {
  return useMutation({
    mutationFn: (data: { image: File; specimen_id: string }) => 
      testReportsService.uploadImage(data)
  })
}
