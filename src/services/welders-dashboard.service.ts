import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"

// Stats response types for welders
export interface WeldersOverview {
  total_welders: number
  active_welders: number
  inactive_welders: number
  activity_rate: number
}

export interface WeldersRecentActivity {
  new_welders_last_30_days: number
  new_welders_last_7_days: number
}

export interface WeldersStats {
  overview: WeldersOverview
  recent_activity: WeldersRecentActivity
}

export interface WelderCardsOverview {
  total_cards: number
  active_cards: number
  inactive_cards: number
  activity_rate: number
}

export interface WelderCardsRecentActivity {
  new_cards_last_30_days: number
}

export interface WelderCardsStats {
  overview: WelderCardsOverview
  recent_activity: WelderCardsRecentActivity
}

export interface WelderCertificatesOverview {
  total_certificates: number
  active_certificates: number
  inactive_certificates: number
  activity_rate: number
}

export interface WelderCertificatesRecentActivity {
  new_certificates_last_30_days: number
}

export interface WelderCertificatesStats {
  overview: WelderCertificatesOverview
  recent_activity: WelderCertificatesRecentActivity
}

export interface WelderPerformanceRecordsOverview {
  total_records: number
  active_records: number
  inactive_records: number
  activity_rate: number
}

export interface WelderPerformanceRecordsRecentActivity {
  new_records_last_30_days: number
}

export interface WelderPerformanceRecordsStats {
  overview: WelderPerformanceRecordsOverview
  recent_activity: WelderPerformanceRecordsRecentActivity
}

export interface TestingReportsOverview {
  total_reports: number
  active_reports: number
  inactive_reports: number
  activity_rate: number
}

export interface TestingReportsRecentActivity {
  new_reports_last_30_days: number
}

export interface TestingReportsStats {
  overview: TestingReportsOverview
  recent_activity: TestingReportsRecentActivity
}

export interface PQRsOverview {
  total_pqrs: number
  active_pqrs: number
  inactive_pqrs: number
  activity_rate: number
}

export interface PQRsRecentActivity {
  new_pqrs_last_30_days: number
}

export interface PQRsStats {
  overview: PQRsOverview
  recent_activity: PQRsRecentActivity
}

export interface WelderDashboardStats {
  welders: WeldersStats
  welder_cards: WelderCardsStats
  welder_certificates: WelderCertificatesStats
  welder_performance_records: WelderPerformanceRecordsStats
  testing_reports: TestingReportsStats
  pqrs: PQRsStats
  generated_at: string
}

export const weldersDashboardService = {
  // Get all welder dashboard statistics in one call
  async getAllStats(): Promise<WelderDashboardStats> {
    try {
      const endpoint = API_ROUTES.WELDERS_API.WELDERS_STATS
      const response = await api.get(endpoint).json<{ status: string; data: WelderDashboardStats }>()
      
      if (response.status === 'success' && response.data) {
        return response.data
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Failed to fetch welder dashboard stats:', error)
      throw error
    }
  }
}

