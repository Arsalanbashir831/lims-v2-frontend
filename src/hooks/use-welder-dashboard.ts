import { useQuery } from "@tanstack/react-query"
import { weldersDashboardService, type WelderDashboardStats } from "@/services/welders-dashboard.service"

export function useWelderDashboardStats() {
  return useQuery<WelderDashboardStats>({
    queryKey: ["welder-dashboard-stats"],
    queryFn: () => weldersDashboardService.getAllStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

