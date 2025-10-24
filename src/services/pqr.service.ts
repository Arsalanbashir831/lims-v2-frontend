import { api, uploadWithFormData } from "@/lib/api/api"
import { API_ROUTES } from "@/constants/api-routes"

// PQR Types
export interface PQR {
  id: string
  type: 'API_1104' | 'ASME_SEC_IX'
  basic_info: {
    pqr_number: string
    date_qualified: string
    qualified_by: string
    approved_by: string
  }
  joints: Record<string, any>
  joint_design_sketch: string[] // Array of file paths
  base_metals: Record<string, any>
  filler_metals: Record<string, any>
  positions: Record<string, any>
  preheat: Record<string, any>
  post_weld_heat_treatment: Record<string, any>
  gas: Record<string, any>
  electrical_characteristics: Record<string, any>
  techniques: Record<string, any>
  welding_parameters: Record<string, any>
  tensile_test: Record<string, any>
  guided_bend_test: Record<string, any>
  toughness_test: Record<string, any>
  fillet_weld_test: Record<string, any>
  other_tests: Record<string, any>
  welder_id: string
  welder_info: {
    welder_id: string
    operator_name: string
    operator_id: string
    iqama: string
    profile_image: string
  }
  mechanical_testing_conducted_by: string
  lab_test_no: string
  law_name: string
  signatures: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreatePQRData {
  basic_info?: {
    pqr_number?: string
    date_qualified?: string
    qualified_by?: string
    approved_by?: string
  }
  joints?: Record<string, any>
  base_metals?: Record<string, any>
  filler_metals?: Record<string, any>
  positions?: Record<string, any>
  preheat?: Record<string, any>
  post_weld_heat_treatment?: Record<string, any>
  gas?: Record<string, any>
  electrical_characteristics?: Record<string, any>
  techniques?: Record<string, any>
  welding_parameters?: Record<string, any>
  tensile_test?: Record<string, any>
  guided_bend_test?: Record<string, any>
  toughness_test?: Record<string, any>
  fillet_weld_test?: Record<string, any>
  other_tests?: Record<string, any>
  welder_id?: string
  mechanical_testing_conducted_by?: string
  lab_test_no?: string
  law_name?: string
  signatures?: Record<string, any>
  type?: 'API_1104' | 'ASME_SEC_IX'
  is_active?: boolean
}

export interface UpdatePQRData extends Partial<CreatePQRData> {}

// Response types
export interface PQRResponse {
  status: string
  message: string
  data: PQR
}

export interface PQRListResponse {
  status: string
  data: PQR[]
  pagination: {
    current_page: number
    limit: number
    total_records: number
    total_pages: number
    has_next: boolean
  }
}

// PQR Service
export const pqrService = {
  // Get all PQRs
  async getAll(page: number = 1, limit: number = 10): Promise<PQRListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_PQRS, {
      searchParams: { page, limit }
    }).json()
    return response as PQRListResponse
  },

  // Search PQRs
  async search(query: string, page: number = 1, limit: number = 10): Promise<PQRListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.SEARCH_WELDER_PQRS, {
      searchParams: { q: query, page, limit }
    }).json()
    return response as PQRListResponse
  },

  // Get PQR by ID
  async getById(id: string): Promise<PQRResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_WELDER_PQRS_BY_ID(id)).json()
    return response as PQRResponse
  },

  // Create PQR - Simplified to match Postman success
  async create(data: CreatePQRData, files?: File[]): Promise<PQRResponse> {
    try {
      const formData = new FormData()
      
      // Add required fields (matching your successful Postman request)
      // Send the type as-is (no mapping needed)
      let backendType: string = data.type || ''
      
      if (backendType !== undefined && backendType !== null) {
        formData.append('type', backendType)
      } else {
        throw new Error("Required field 'type' is missing")
      }
      
      // welder_id is required - throw error if not provided
      if (data.welder_id !== undefined && data.welder_id !== null && data.welder_id !== '') {
        formData.append('welder_id', data.welder_id)
      } else {
        throw new Error("Required field 'welder_id' is missing. Please select a welder.")
      }
      
      // Add optional fields (these can be empty strings)
      if (data.mechanical_testing_conducted_by !== undefined) {
        formData.append('mechanical_testing_conducted_by', data.mechanical_testing_conducted_by || '')
      }
      
      if (data.lab_test_no !== undefined) {
        formData.append('lab_test_no', data.lab_test_no || '')
      }
      
      if (data.law_name !== undefined) {
        formData.append('law_name', data.law_name || '')
      }
      
      // Add optional fields as JSON strings (matching the API documentation)
      if (data.basic_info) {
        formData.append('basic_info', JSON.stringify(data.basic_info))
      }
      if (data.joints) {
        formData.append('joints', JSON.stringify(data.joints))
      }
      if (data.base_metals) {
        formData.append('base_metals', JSON.stringify(data.base_metals))
      }
      if (data.filler_metals) {
        formData.append('filler_metals', JSON.stringify(data.filler_metals))
      }
      if (data.positions) {
        formData.append('positions', JSON.stringify(data.positions))
      }
      if (data.preheat) {
        formData.append('preheat', JSON.stringify(data.preheat))
      }
      if (data.post_weld_heat_treatment) {
        formData.append('post_weld_heat_treatment', JSON.stringify(data.post_weld_heat_treatment))
      }
      if (data.gas) {
        formData.append('gas', JSON.stringify(data.gas))
      }
      if (data.electrical_characteristics) {
        formData.append('electrical_characteristics', JSON.stringify(data.electrical_characteristics))
      }
      if (data.techniques) {
        formData.append('techniques', JSON.stringify(data.techniques))
      }
      if (data.welding_parameters) {
        formData.append('welding_parameters', JSON.stringify(data.welding_parameters))
      }
      if (data.tensile_test) {
        formData.append('tensile_test', JSON.stringify(data.tensile_test))
      }
      if (data.guided_bend_test) {
        formData.append('guided_bend_test', JSON.stringify(data.guided_bend_test))
      }
      if (data.toughness_test) {
        formData.append('toughness_test', JSON.stringify(data.toughness_test))
      }
      if (data.fillet_weld_test) {
        formData.append('fillet_weld_test', JSON.stringify(data.fillet_weld_test))
      }
      if (data.other_tests) {
        formData.append('other_tests', JSON.stringify(data.other_tests))
      }
      if (data.signatures) {
        formData.append('signatures', JSON.stringify(data.signatures))
      }
      
      // Add files
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('joint_design_sketch', file)
        })
      }
      
      // Add is_active if provided
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active ? 'true' : 'false')
      }
      
      const response = await uploadWithFormData<PQRResponse>(API_ROUTES.WELDERS_API.CREATE_WELDER_PQRS, formData, 'POST')
      return response
    } catch (error: unknown) {
      throw error
    }
  },

  // Update PQR
  async update(id: string, data: UpdatePQRData, files?: File[]): Promise<PQRResponse> {
    try {
      const formData = new FormData()
      
      // Add fields if they exist
      if (data.type !== undefined && data.type !== null) {
        // Send the type as-is (no mapping needed)
        let backendType: string = data.type || ''
        formData.append('type', backendType)
      }
      if (data.welder_id !== undefined && data.welder_id !== null) {
        formData.append('welder_id', data.welder_id)
      }
      if (data.mechanical_testing_conducted_by !== undefined) {
        formData.append('mechanical_testing_conducted_by', data.mechanical_testing_conducted_by || '')
      }
      if (data.lab_test_no !== undefined) {
        formData.append('lab_test_no', data.lab_test_no || '')
      }
      if (data.law_name !== undefined) {
        formData.append('law_name', data.law_name || '')
      }
      
      // Add optional fields as JSON strings - only if they have data
      if (data.basic_info && Object.keys(data.basic_info).length > 0) {
        formData.append('basic_info', JSON.stringify(data.basic_info))
      }
      if (data.joints && Object.keys(data.joints).length > 0) {
        formData.append('joints', JSON.stringify(data.joints))
      }
      if (data.base_metals && Object.keys(data.base_metals).length > 0) {
        formData.append('base_metals', JSON.stringify(data.base_metals))
      }
      if (data.filler_metals && Object.keys(data.filler_metals).length > 0) {
        formData.append('filler_metals', JSON.stringify(data.filler_metals))
      }
      if (data.positions && Object.keys(data.positions).length > 0) {
        formData.append('positions', JSON.stringify(data.positions))
      }
      if (data.preheat && Object.keys(data.preheat).length > 0) {
        formData.append('preheat', JSON.stringify(data.preheat))
      }
      if (data.post_weld_heat_treatment && Object.keys(data.post_weld_heat_treatment).length > 0) {
        formData.append('post_weld_heat_treatment', JSON.stringify(data.post_weld_heat_treatment))
      }
      if (data.gas && Object.keys(data.gas).length > 0) {
        formData.append('gas', JSON.stringify(data.gas))
      }
      if (data.electrical_characteristics && Object.keys(data.electrical_characteristics).length > 0) {
        formData.append('electrical_characteristics', JSON.stringify(data.electrical_characteristics))
      }
      if (data.techniques && Object.keys(data.techniques).length > 0) {
        formData.append('techniques', JSON.stringify(data.techniques))
      }
      if (data.welding_parameters && Object.keys(data.welding_parameters).length > 0) {
        formData.append('welding_parameters', JSON.stringify(data.welding_parameters))
      }
      if (data.tensile_test && Object.keys(data.tensile_test).length > 0) {
        formData.append('tensile_test', JSON.stringify(data.tensile_test))
      }
      if (data.guided_bend_test && Object.keys(data.guided_bend_test).length > 0) {
        formData.append('guided_bend_test', JSON.stringify(data.guided_bend_test))
      }
      if (data.toughness_test && Object.keys(data.toughness_test).length > 0) {
        formData.append('toughness_test', JSON.stringify(data.toughness_test))
      }
      if (data.fillet_weld_test && Object.keys(data.fillet_weld_test).length > 0) {
        formData.append('fillet_weld_test', JSON.stringify(data.fillet_weld_test))
      }
      if (data.other_tests && Object.keys(data.other_tests).length > 0) {
        formData.append('other_tests', JSON.stringify(data.other_tests))
      }
      if (data.signatures && Object.keys(data.signatures).length > 0) {
        formData.append('signatures', JSON.stringify(data.signatures))
      }
      
      // Add files
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('joint_design_sketch', file)
        })
      }
      
      // Add is_active if provided
    //   if (data.is_active !== undefined) {
    //     formData.append('is_active', data.is_active ? 'true' : 'false')
    //   }
      
      const response = await uploadWithFormData<PQRResponse>(API_ROUTES.WELDERS_API.UPDATE_WELDER_PQRS(id), formData, 'PUT')
      return response
    } catch (error: unknown) {
      throw error
    }
  },

  // Delete PQR
  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.WELDERS_API.DELETE_WELDER_PQRS(id))
  },

  // Get PQRs by welder ID
  async getByWelder(welderId: string, page: number = 1, limit: number = 10): Promise<PQRListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_PQRS, {
      searchParams: { welder_id: welderId, page, limit }
    }).json()
    return response as PQRListResponse
  },

  // Get PQRs by date range
  async getByDateRange(startDate: string, endDate: string, page: number = 1, limit: number = 10): Promise<PQRListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_PQRS, {
      searchParams: { start_date: startDate, end_date: endDate, page, limit }
    }).json()
    return response as PQRListResponse
  },

  // Get PQRs by type
  async getByType(type: 'API_1104' | 'ASME_SEC_IX', page: number = 1, limit: number = 10): Promise<PQRListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_PQRS, {
      searchParams: { type, page, limit }
    }).json()
    return response as PQRListResponse
  },

  // Get PQRs by status
  async getByStatus(isActive: boolean, page: number = 1, limit: number = 10): Promise<PQRListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_PQRS, {
      searchParams: { is_active: isActive, page, limit }
    }).json()
    return response as PQRListResponse
  }
}