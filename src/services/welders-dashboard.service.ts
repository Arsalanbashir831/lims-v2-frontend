import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"

// Stats response types for welders
export interface WeldersStats {
  total_welders: number
  active_welders?: number
  inactive_welders?: number
  activity_rate?: number
  [key: string]: unknown
}

export interface WelderCardsStats {
  total_cards: number
  active_cards?: number
  inactive_cards?: number
  activity_rate?: number
  [key: string]: unknown
}

export interface WelderCertificatesStats {
  total_certificates: number
  active_qualifications?: number
  expired_certificates?: number
  expiring_soon?: number
  valid_certifications_percentage?: number
  [key: string]: unknown
}

export interface WelderOperatorPerformanceStats {
  total_records: number
  law_distribution?: Array<{ _id: string; count: number }>
  tester_distribution?: Array<{ _id: string; count: number }>
  [key: string]: unknown
}

export interface WelderTestingReportsStats {
  total_reports: number
  total_welders_tested?: number
  client_distribution?: Array<{ _id: string; count: number }>
  preparer_distribution?: Array<{ _id: string; count: number }>
  [key: string]: unknown
}

export interface WelderPQRsStats {
  total_pqrs: number
  type_distribution?: Array<{ _id: string; count: number }>
  law_distribution?: Array<{ _id: string; count: number }>
  tester_distribution?: Array<{ _id: string; count: number }>
  [key: string]: unknown
}

export interface WelderDashboardStats {
  welders?: WeldersStats
  welder_cards?: WelderCardsStats
  welder_certificates?: WelderCertificatesStats
  welder_operator_performance?: WelderOperatorPerformanceStats
  welder_testing_reports?: WelderTestingReportsStats
  welder_pqrs?: WelderPQRsStats
}

export const weldersDashboardService = {
  // Get welders statistics
  async getWeldersStats(): Promise<WeldersStats> {
    const endpoint = API_ROUTES.WELDERS_API.WELDERS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as WeldersStats
  },

  // Get welder cards statistics
  async getWelderCardsStats(): Promise<WelderCardsStats> {
    const endpoint = API_ROUTES.WELDERS_API.WELDER_CARDS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as WelderCardsStats
  },

  // Get welder certificates statistics
  async getWelderCertificatesStats(): Promise<WelderCertificatesStats> {
    const endpoint = API_ROUTES.WELDERS_API.WELDER_CERTIFICATES_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as WelderCertificatesStats
  },

  // Get welder operator performance statistics
  async getWelderOperatorPerformanceStats(): Promise<WelderOperatorPerformanceStats> {
    const endpoint = API_ROUTES.WELDERS_API.WELDER_OPERATOR_PERFORMANCE_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as WelderOperatorPerformanceStats
  },

  // Get welder testing reports statistics
  async getWelderTestingReportsStats(): Promise<WelderTestingReportsStats> {
    const endpoint = API_ROUTES.WELDERS_API.WELDER_TESTING_REPORTS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as WelderTestingReportsStats
  },

  // Get welder PQRs statistics
  async getWelderPQRsStats(): Promise<WelderPQRsStats> {
    const endpoint = API_ROUTES.WELDERS_API.WELDER_PQRS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as WelderPQRsStats
  },

  // Get all welder dashboard statistics in one call
  async getAllStats(): Promise<WelderDashboardStats> {
    try {
      const [
        welders,
        welderCards,
        welderCertificates,
        welderOperatorPerformance,
        welderTestingReports,
        welderPQRs
      ] = await Promise.all([
        this.getWeldersStats().catch((err) => { console.error('Welders stats error:', err); return { total_welders: 0 } }),
        this.getWelderCardsStats().catch((err) => { console.error('Welder cards stats error:', err); return { total_cards: 0 } }),
        this.getWelderCertificatesStats().catch((err) => { console.error('Welder certificates stats error:', err); return { total_certificates: 0 } }),
        this.getWelderOperatorPerformanceStats().catch((err) => { console.error('Welder operator performance stats error:', err); return { total_records: 0 } }),
        this.getWelderTestingReportsStats().catch((err) => { console.error('Welder testing reports stats error:', err); return { total_reports: 0 } }),
        this.getWelderPQRsStats().catch((err) => { console.error('Welder PQRs stats error:', err); return { total_pqrs: 0 } }),
      ])

      return {
        welders,
        welder_cards: welderCards,
        welder_certificates: welderCertificates,
        welder_operator_performance: welderOperatorPerformance,
        welder_testing_reports: welderTestingReports,
        welder_pqrs: welderPQRs,
      }
    } catch (error) {
      console.error('Failed to fetch welder dashboard stats:', error)
      throw error
    }
  }
}

