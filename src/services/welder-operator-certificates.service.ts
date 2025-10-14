import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"

// Types based on the actual API response structure
export interface OperatorCertificate {
  id: string
  welder_card_id: string
  welder_card_info: {
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
  is_active: boolean
  created_at: string
  updated_at: string
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
    const response = await api.get(API_ROUTES.WELDERS_API.SEARCH_WELDER_OPERATOR_PERFORMANCE, {
      searchParams: {
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      }
    }).json<{
      results: OperatorCertificate[]
      count: number
      next: string | null
      previous: string | null
    }>()

    return response
  }
}
