import { api } from "@/lib/api/api"
import { API_ROUTES } from "@/constants/api-routes"

// Types based on the provided data structure
export interface WelderTestReport {
  id: string
  welder_id: string
  welder_name: string
  iqama_number: string
  test_coupon_id: string
  date_of_inspection: string
  welding_processes: string
  type_of_welding: string
  backing: string
  type_of_weld_joint: string
  thickness_product_type: string
  diameter_of_pipe: string
  base_metal_p_number: string
  filler_metal_electrode_spec: string
  filler_metal_f_number: string
  filler_metal_addition_deletion: string
  deposit_thickness_for_each_process: string
  welding_positions: string
  vertical_progression: string
  type_of_fuel_gas: string
  inert_gas_backing: string
  transfer_mode: string
  current_type_polarity: string
  voltage: string
  current: string
  travel_speed: string
  interpass_temperature: string
  pre_heat: string
  post_weld_heat_treatment: string
  result_status: string
  created_at: string
  updated_at: string
}

export interface WelderTestReportBatch {
  results: WelderTestReport[]
  prepared_by: string
  client_name: string
  project_details: string
  contract_details: string
}

export interface CreateWelderTestReportData {
  welder_id: string
  welder_name: string
  iqama_number: string
  test_coupon_id: string
  date_of_inspection: string
  welding_processes: string
  type_of_welding: string
  backing: string
  type_of_weld_joint: string
  thickness_product_type: string
  diameter_of_pipe: string
  base_metal_p_number: string
  filler_metal_electrode_spec: string
  filler_metal_f_number: string
  filler_metal_addition_deletion: string
  deposit_thickness_for_each_process: string
  welding_positions: string
  vertical_progression: string
  type_of_fuel_gas: string
  inert_gas_backing: string
  transfer_mode: string
  current_type_polarity: string
  voltage: string
  current: string
  travel_speed: string
  interpass_temperature: string
  pre_heat: string
  post_weld_heat_treatment: string
  result_status: string
}

export interface CreateWelderTestReportBatchData {
  results: CreateWelderTestReportData[]
  prepared_by: string
  client_name: string
  project_details: string
  contract_details: string
}

export interface UpdateWelderTestReportData extends Partial<CreateWelderTestReportData> {}

export interface UpdateWelderTestReportBatchData extends Partial<CreateWelderTestReportBatchData> {}

// API Response Types
export interface WelderTestReportResponse {
  status: string
  message: string
  data: WelderTestReport
}

export interface WelderTestReportListResponse {
  status: string
  data: WelderTestReport[]
  total: number
}

export interface WelderTestReportBatchResponse {
  status: string
  message: string
  data: WelderTestReportBatch
}

// Service
export const welderTestReportsService = {
  // Get all welder test reports
  async getAll(page: number = 1, limit: number = 10): Promise<WelderTestReportListResponse> {
    const response = await api.get(`${API_ROUTES.WELDERS_API.GET_ALL_WELDER_TESTING_REPORTS}?page=${page}&limit=${limit}`).json()
    return response as WelderTestReportListResponse
  },

  // Search welder test reports
  async search(query: string, page: number = 1, limit: number = 10): Promise<WelderTestReportListResponse> {
    console.log('Calling search API with query:', query, 'page:', page, 'limit:', limit)
    const url = `${API_ROUTES.WELDERS_API.SEARCH_WELDER_TESTING_REPORTS}?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    console.log('Search URL:', url)
    const response = await api.get(url).json()
    console.log('Search response:', response)
    return response as WelderTestReportListResponse
  },

  // Get single welder test report
  async getById(id: string): Promise<WelderTestReportResponse> {
    const response = await api.get(`${API_ROUTES.WELDERS_API.GET_WELDER_TESTING_REPORT_BY_ID(id)}`).json()
    return response as WelderTestReportResponse
  },

  // Create single welder test report
  async create(data: CreateWelderTestReportData): Promise<WelderTestReportResponse> {
    const response = await api.post(API_ROUTES.WELDERS_API.CREATE_WELDER_TESTING_REPORT, { json: data }).json()
    return response as WelderTestReportResponse
  },

  // Create batch welder test reports
  async createBatch(data: CreateWelderTestReportBatchData): Promise<WelderTestReportBatchResponse> {
    // Try to send the batch data directly to the API
    try {
      const response = await api.post(API_ROUTES.WELDERS_API.CREATE_WELDER_TESTING_REPORT, { json: data }).json() as WelderTestReportBatchResponse
      return response
    } catch (error) {
      // Fallback: create individual reports if batch endpoint doesn't work
      const results = []
      
      for (const reportData of data.results) {
        try {
          const response = await api.post(API_ROUTES.WELDERS_API.CREATE_WELDER_TESTING_REPORT, { json: reportData }).json() as WelderTestReportResponse
          results.push(response.data)
        } catch (individualError) {
          throw individualError
        }
      }
      
      return {
        status: "success",
        message: `Successfully created ${results.length} welder test reports`,
        data: {
          results,
          prepared_by: data.prepared_by,
          client_name: data.client_name,
          project_details: data.project_details,
          contract_details: data.contract_details
        }
      } as WelderTestReportBatchResponse
    }
  },

  // Update welder test report
  async update(id: string, data: UpdateWelderTestReportData): Promise<WelderTestReportResponse> {
    const response = await api.put(API_ROUTES.WELDERS_API.UPDATE_WELDER_TESTING_REPORT(id), { json: data }).json()
    return response as WelderTestReportResponse
  },

  // Update welder test report batch
  async updateBatch(id: string, data: UpdateWelderTestReportBatchData): Promise<WelderTestReportBatchResponse> {
    const response = await api.put(API_ROUTES.WELDERS_API.UPDATE_WELDER_TESTING_REPORT(id), { json: data }).json()
    return response as WelderTestReportBatchResponse
  },

  // Delete welder test report
  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.WELDERS_API.DELETE_WELDER_TESTING_REPORT(id))
  },

  // Get welder test reports by welder ID
  async getByWelderId(welderId: string, page: number = 1, limit: number = 10): Promise<WelderTestReportListResponse> {
    const response = await api.get(`${API_ROUTES.WELDERS_API.GET_ALL_WELDER_TESTING_REPORTS}?welder_id=${welderId}&page=${page}&limit=${limit}`).json()
    return response as WelderTestReportListResponse
  },

  // Get welder test reports by date range
  async getByDateRange(startDate: string, endDate: string, page: number = 1, limit: number = 10): Promise<WelderTestReportListResponse> {
    const response = await api.get(`${API_ROUTES.WELDERS_API.GET_ALL_WELDER_TESTING_REPORTS}?start_date=${startDate}&end_date=${endDate}&page=${page}&limit=${limit}`).json()
    return response as WelderTestReportListResponse
  },

  // Get welder test reports by result status
  async getByResultStatus(status: string, page: number = 1, limit: number = 10): Promise<WelderTestReportListResponse> {
    const response = await api.get(`${API_ROUTES.WELDERS_API.GET_ALL_WELDER_TESTING_REPORTS}?result_status=${status}&page=${page}&limit=${limit}`).json()
    return response as WelderTestReportListResponse
  }
}
