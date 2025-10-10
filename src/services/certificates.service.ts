import { api } from "@/lib/api/api"
import { API_ROUTES } from "@/constants/api-routes"

export interface Certificate {
  id: string
  certificate_id: string
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  revision_no: string
  customers_name_no: string
  atten: string
  customer_po: string
  tested_by: string
  reviewed_by: string
  request_info: {
    request_id: string
    request_no: string
    sample_lots_count: number
    total_specimens: number
    sample_lots: Array<{
      item_description: string
      planned_test_date: string
      dimension_spec: string
      request_by: string
      remarks: string
      sample_lot_info: {
        sample_lot_id: string
        item_no: string
        sample_type: string
        material_type: string
        description?: string
        job_id: string
        job_details?: {
          project_name: string
          end_user: string
          receive_date: string
        }
      }
      test_method: {
        test_method_oid: string
        test_name: string
        test_description?: string
        test_columns?: string[]
        hasImage?: boolean
      }
      specimens: Array<{
        specimen_oid: string
        specimen_id: string
        created_at?: string
        updated_at?: string
      }>
      specimens_count: number
    }>
    specimens: Array<{
      specimen_oid: string
      specimen_id: string
      created_at?: string
      updated_at?: string
    }>
    created_at?: string
    updated_at?: string
  }
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CreateCertificateData {
  request_id: string
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  revision_no: string
  customers_name_no: string
  atten: string
  customer_po: string
  tested_by: string
  reviewed_by: string
}

export interface UpdateCertificateData extends Partial<CreateCertificateData> {}

export interface CertificateResponse {
  status: string
  data: Certificate
  message?: string
}

export interface CertificateListResponse {
  status: string
  data: Certificate[]
  total: number
  message?: string
}

export interface CertificateSearchResponse {
  status: string
  data: Certificate[]
  total: number
  message?: string
}

export const certificatesService = {
  async create(data: CreateCertificateData): Promise<CertificateResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_CERTIFICATE, { json: data }).json<CertificateResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to create certificate")
  },

  async update(id: string, data: UpdateCertificateData): Promise<CertificateResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_CERTIFICATE(id), { json: data }).json<CertificateResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to update certificate")
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_CERTIFICATE(id))
  },

  async getById(id: string): Promise<CertificateResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.CERTIFICATE_BY_ID(id)).json<CertificateResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to get certificate")
  },

  async getAll(page: number = 1): Promise<CertificateListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATES, { 
      searchParams: { page: page.toString() } 
    }).json<CertificateListResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to get certificates")
  },

  async search(query: string, page: number = 1): Promise<CertificateSearchResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_CERTIFICATES, { 
      searchParams: { q: query, page: page.toString() } 
    }).json<CertificateSearchResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to search certificates")
  }
}
