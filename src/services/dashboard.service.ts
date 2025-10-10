import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"

// Stats response types
export interface ClientsStats {
  total_clients: number
  active_clients?: number
  inactive_clients?: number
  activity_rate?: number
  [key: string]: unknown
}

export interface JobsStats {
  total_jobs: number
  [key: string]: unknown
}

export interface SampleLotsStats {
  total_sample_lots: number
  sample_type_distribution?: Array<{ _id: string; count: number }>
  material_type_distribution?: Array<{ _id: string; count: number }>
  [key: string]: unknown
}

export interface SamplePreparationsStats {
  total_preparations: number
  total_sample_lots?: number
  total_specimens_used?: number
  avg_sample_lots_per_preparation?: number
  avg_specimens_per_preparation?: number
  [key: string]: unknown
}

export interface SpecimensStats {
  total_specimens: number
  [key: string]: unknown
}

export interface TestMethodsStats {
  total_test_methods: number
  image_support_distribution?: Array<{ _id: boolean; count: number }>
  monthly_creation_stats?: Array<{ _id: { year: number; month: number }; count: number }>
  [key: string]: unknown
}

export interface CertificatesStats {
  total_certificates: number
  monthly_issue_stats?: Array<unknown>
  tester_distribution?: Array<unknown>
  [key: string]: unknown
}

export interface CertificateItemsStats {
  total_certificate_items: number
  total_specimens_tested?: number
  total_images_attached?: number
  avg_specimens_per_item?: number
  unique_certificates_count?: number
  unique_materials_count?: number
  top_materials?: Array<unknown>
  [key: string]: unknown
}

export interface EquipmentStats {
  total_equipment: number
  active_equipment?: number
  inactive_equipment?: number
  verification_due?: number
  [key: string]: unknown
}

export interface CalibrationTestsStats {
  total_tests: number
  overdue_tests?: number
  due_soon_tests?: number
  recent_calibrations?: number
  unique_vendors?: number
  unique_equipment?: number
  overdue_percentage?: number
  [key: string]: unknown
}

export interface ProficiencyTestsStats {
  total_tests: number
  scheduled_tests?: number
  in_progress_tests?: number
  completed_tests?: number
  cancelled_tests?: number
  overdue_tests?: number
  due_soon_tests?: number
  completion_rate?: number
  [key: string]: unknown
}

export interface DashboardStats {
  clients?: ClientsStats
  jobs?: JobsStats
  sample_lots?: SampleLotsStats
  sample_preparations?: SamplePreparationsStats
  specimens?: SpecimensStats
  test_methods?: TestMethodsStats
  certificates?: CertificatesStats
  certificate_items?: CertificateItemsStats
  equipment?: EquipmentStats
  calibration_tests?: CalibrationTestsStats
  proficiency_tests?: ProficiencyTestsStats
}

export interface WeeklyBreakdown {
  week_start: string
  week_end: string
  jobs_count?: number
  sample_lots_count?: number
}

export interface JobsCurrentMonthStats {
  current_month: {
    month: string
    month_name: string
    jobs_count: number
    percentage_of_total: number
  }
  weekly_breakdown: WeeklyBreakdown[]
  daily_breakdown: Array<{ date: string; jobs_count: number }>
  top_clients: Array<{ client_id: string; client_name: string; jobs_count: number }>
  total_jobs: number
  generated_at: string
}

export interface SampleLotsCurrentMonthStats {
  current_month: {
    month: string
    month_name: string
    sample_lots_count: number
    percentage_of_total: number
  }
  weekly_breakdown: WeeklyBreakdown[]
  daily_breakdown: Array<{ date: string; sample_lots_count: number }>
  total_sample_lots: number
  generated_at: string
}

export const dashboardService = {
  // Get clients statistics
  async getClientsStats(): Promise<ClientsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CLIENTS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as ClientsStats
  },

  // Get jobs statistics
  async getJobsStats(): Promise<JobsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.JOBS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as JobsStats
  },

  // Get sample lots statistics
  async getSampleLotsStats(): Promise<SampleLotsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_LOTS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as SampleLotsStats
  },

  // Get sample preparations statistics
  async getSamplePreparationsStats(): Promise<SamplePreparationsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_PREPARATIONS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as SamplePreparationsStats
  },

  // Get specimens statistics
  async getSpecimensStats(): Promise<SpecimensStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SPECIMENS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as SpecimensStats
  },

  // Get test methods statistics
  async getTestMethodsStats(): Promise<TestMethodsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.TEST_METHODS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as TestMethodsStats
  },

  // Get certificates statistics
  async getCertificatesStats(): Promise<CertificatesStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CERTIFICATES_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as CertificatesStats
  },

  // Get certificate items statistics
  async getCertificateItemsStats(): Promise<CertificateItemsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CERTIFICATE_ITEMS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as CertificateItemsStats
  },

  // Get equipment statistics
  async getEquipmentStats(): Promise<EquipmentStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.EQUIPMENT_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as EquipmentStats
  },

  // Get calibration tests statistics
  async getCalibrationTestsStats(): Promise<CalibrationTestsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CALIBRATION_TESTS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as CalibrationTestsStats
  },

  // Get proficiency tests statistics
  async getProficiencyTestsStats(): Promise<ProficiencyTestsStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.PROFICIENCY_TESTS_STATS
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as ProficiencyTestsStats
  },

  // Get jobs current month statistics
  async getJobsCurrentMonthStats(): Promise<JobsCurrentMonthStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.JOBS_STATS_CURRENT_MONTH
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as JobsCurrentMonthStats
  },

  // Get sample lots current month statistics
  async getSampleLotsCurrentMonthStats(): Promise<SampleLotsCurrentMonthStats> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_LOTS_STATS_CURRENT_MONTH
    const response = await api.get(endpoint).json<{ status: string; data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as SampleLotsCurrentMonthStats
  },

  // Get all dashboard statistics in one call (if you want to fetch all at once)
  async getAllStats(): Promise<DashboardStats> {
    try {
      const [
        clients,
        jobs,
        sampleLots,
        samplePreparations,
        specimens,
        testMethods, 
        certificates,
        certificateItems,
        equipment,
        calibrationTests,
        proficiencyTests
      ] = await Promise.all([
        this.getClientsStats().catch((err) => { console.error('Clients stats error:', err); return { total_clients: 0 } }),
        this.getJobsStats().catch((err) => { console.error('Jobs stats error:', err); return { total_jobs: 0 } }),
        this.getSampleLotsStats().catch((err) => { console.error('Sample lots stats error:', err); return { total_sample_lots: 0 } }),
        this.getSamplePreparationsStats().catch((err) => { console.error('Sample preparations stats error:', err); return { total_preparations: 0 } }),
        this.getSpecimensStats().catch((err) => { console.error('Specimens stats error:', err); return { total_specimens: 0 } }),
        this.getTestMethodsStats().catch((err) => { console.error('Test methods stats error:', err); return { total_test_methods: 0 } }),
        this.getCertificatesStats().catch((err) => { console.error('Certificates stats error:', err); return { total_certificates: 0 } }),
        this.getCertificateItemsStats().catch((err) => { console.error('Certificate items stats error:', err); return { total_certificate_items: 0 } }),
        this.getEquipmentStats().catch((err) => { console.error('Equipment stats error:', err); return { total_equipment: 0 } }),
        this.getCalibrationTestsStats().catch((err) => { console.error('Calibration tests stats error:', err); return { total_tests: 0 } }),
        this.getProficiencyTestsStats().catch((err) => { console.error('Proficiency tests stats error:', err); return { total_tests: 0 } }),
      ])

      const result = {
        clients,
        jobs,
        sample_lots: sampleLots,
        sample_preparations: samplePreparations,
        specimens,
        test_methods: testMethods,
        certificates,
        certificate_items: certificateItems,
        equipment,
        calibration_tests: calibrationTests,
        proficiency_tests: proficiencyTests,
      }
      
      return result
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      throw error
    }
  }
}