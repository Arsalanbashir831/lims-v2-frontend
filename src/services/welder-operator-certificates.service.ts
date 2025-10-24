import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"

// Types based on the actual API response structure
export interface OperatorCertificate {
  id: string
  welder_card_id: string
  welder_card_info?: {
    card_id: string
    card_no: string
    company: string
    welder_info: {
      welder_id: string
      operator_name: string
      operator_id: string
      iqama: string
      profile_image?: string
    }
  }
  certificate_no: string
  wps_followed_date?: string
  date_of_issue?: string
  date_of_welding: string
  joint_weld_type: string
  base_metal_spec: string
  base_metal_p_no?: string
  filler_sfa_spec?: string
  filler_class_aws?: string
  test_coupon_size?: string
  positions?: string
  testing_variables_and_qualification_limits_automatic?: TestingVariable[]
  testing_variables_and_qualification_limits_machine?: TestingVariable[]
  tests?: TestResult[]
  law_name: string
  tested_by: string
  witnessed_by: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface TestingVariable {
  name: string
  actual_values: string
  range_values: string
}

export interface TestResult {
  type: string
  test_performed: boolean
  results: string
  report_no: string
}

export interface CreateOperatorCertificateData {
  welder_card_id: string
  certificate_no: string
  wps_followed_date: string
  date_of_issue: string
  date_of_welding: string
  joint_weld_type: string
  base_metal_spec: string
  base_metal_p_no: string
  filler_sfa_spec: string
  filler_class_aws: string
  test_coupon_size: string
  positions: string
  testing_variables_and_qualification_limits_automatic: TestingVariable[]
  testing_variables_and_qualification_limits_machine: TestingVariable[]
  tests: TestResult[]
  law_name: string
  tested_by: string
  witnessed_by: string
}

export interface UpdateOperatorCertificateData extends Partial<CreateOperatorCertificateData> {}

export interface OperatorCertificateListResponse {
  results: OperatorCertificate[]
  count: number
  next: string | null
  previous: string | null
}

export const operatorCertificateService = {
  async getAll(page: number = 1, limit: number = 10, showInactive: boolean = false): Promise<OperatorCertificateListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_OPERATOR_PERFORMANCE, {
      searchParams: {
        page: page.toString(),
        limit: limit.toString(),
        show_inactive: showInactive.toString(),
        include_inactive: showInactive.toString(),
      }
    }).json<{
      status: string
      data: OperatorCertificate[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    return {
      results: response.data,
      count: response.pagination.total_records,
      next: response.pagination.has_next ? `page=${page + 1}` : null,
      previous: page > 1 ? `page=${page - 1}` : null,
    }
  },

  async getById(id: string): Promise<{ data: OperatorCertificate }> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_WELDER_OPERATOR_PERFORMANCE_BY_ID(id))
      .json<{
        status: string
        data: OperatorCertificate
      }>()

    return response
  },

  async create(data: CreateOperatorCertificateData): Promise<OperatorCertificate> {
    const response = await api.post(API_ROUTES.WELDERS_API.CREATE_WELDER_OPERATOR_PERFORMANCE, {
      json: data
    }).json<{
      status: string
      data: OperatorCertificate
    }>()

    return response.data
  },

  async update(id: string, data: UpdateOperatorCertificateData): Promise<OperatorCertificate> {
    const response = await api.put(API_ROUTES.WELDERS_API.UPDATE_WELDER_OPERATOR_PERFORMANCE(id), {
      json: data
    }).json<{
      status: string
      data: OperatorCertificate
    }>()

    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.WELDERS_API.DELETE_WELDER_OPERATOR_PERFORMANCE(id))
  },

  async search(query: string, page: number = 1, limit: number = 10): Promise<OperatorCertificateListResponse> {
    // Use the search endpoint directly
    const searchUrl = `${API_ROUTES.WELDERS_API.SEARCH_WELDER_OPERATOR_PERFORMANCE}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    const response = await api.get(searchUrl).json<{
      status: string
      data: Array<{
        id: string
        certificate_no: string
        law_name: string
        date_of_welding: string
        tested_by: string
        witnessed_by: string
        joint_weld_type: string
        base_metal_spec: string
        is_active: boolean
        created_at: string
      }>
      total: number
      filters_applied: {
        certificate_no: string
        company: string
        card_no: string
        law_name: string
        tested_by: string
        date_of_welding: string
        welder_card_id: string
      }
    }>()

    if (response.status === "success" && response.data) {
      // Transform search response to match OperatorCertificate interface
      const transformedData: OperatorCertificate[] = response.data.map(item => ({
        id: item.id,
        welder_card_id: "",
        welder_card_info: undefined,
        certificate_no: item.certificate_no,
        date_of_welding: item.date_of_welding,
        joint_weld_type: item.joint_weld_type,
        base_metal_spec: item.base_metal_spec,
        law_name: item.law_name,
        tested_by: item.tested_by,
        witnessed_by: item.witnessed_by,
        is_active: item.is_active,
        created_at: item.created_at,
        wps_followed_date: undefined,
        date_of_issue: undefined,
        base_metal_p_no: undefined,
        filler_sfa_spec: undefined,
        filler_class_aws: undefined,
        test_coupon_size: undefined,
        positions: undefined,
        testing_variables_and_qualification_limits_automatic: undefined,
        testing_variables_and_qualification_limits_machine: undefined,
        tests: undefined,
        updated_at: undefined,
      }))

      return {
        results: transformedData,
        count: response.total,
        next: null,
        previous: null,
      }
    }
    
    throw new Error("Failed to search operator certificates")
  }
}
