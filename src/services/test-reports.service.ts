import { api } from "@/lib/api/api"
import { API_ROUTES } from "@/constants/api-routes"
import { TokenStorage } from "@/lib/auth/token-storage"

// Types
export interface TestReport {
  id: string
  certificate_id: string
  client_name?: string
  job_id?: string
  project_name?: string
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  revision_no: string
  customers_name_no: string
  atten: string
  customer_po: string
  tested_by: string
  reviewed_by: string
  request_info?: {
    request_id: string
    request_no: string
    sample_lots_count: number
    total_specimens: number
    sample_lots: Array<{
      item_description: string
      planned_test_date: string | null
      dimension_spec: string | null
      request_by: string | null
      remarks: string | null
      sample_lot_info: {
        sample_lot_id: string
        item_no: string
        sample_type: string
        material_type: string
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
}

export interface TestReportItem {
  _id: string
  certificate_id: string
  sample_preparation_method: string
  material_grade: string
  temperature: string
  humidity: string
  po: string
  mtc_no: string
  heat_no: string
  comments: string
  equipment_name: string
  equipment_calibration: string
  specimen_sections: Array<{
    specimen_id: string
    test_results: string // JSON string
    images_list: Array<{
      image_url: string
      caption: string
    }>
  }>
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface CreateTestReportData {
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

export interface CreateTestReportItemData {
  certificate_id: string
  sample_preparation_method: string
  material_grade: string
  temperature: string
  humidity: string
  po: string
  mtc_no: string
  heat_no: string
  comments: string
  equipment_name: string
  equipment_calibration: string
  specimen_sections: Array<{
    specimen_id: string
    test_results: string
    images_list: Array<{
      image_url: string
      caption: string
    }>
  }>
}

export interface UpdateTestReportData extends Partial<CreateTestReportData> {}
export interface UpdateTestReportItemData extends Partial<CreateTestReportItemData> {}

// API Response Types
export interface TestReportResponse {
  status: string
  message: string
  data: TestReport
}

export interface TestReportListResponse {
  status: string
  data: TestReport[]
  total: number
}

export interface TestReportItemResponse {
  status: string
  message: string
  data: TestReportItem
}

export interface TestReportItemListResponse {
  status: string
  data: TestReportItem[]
  total: number
  certificate_oid: string
  certificate_id: string
}

// Service
export const testReportsService = {
  // Test Reports (Certificates)
  async getAll(page: number = 1): Promise<TestReportListResponse> {
    const response = await api.get(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATES}?page=${page}`).json()
    return response as TestReportListResponse
  },

  async search(query: string, page: number = 1): Promise<TestReportListResponse> {
    // If no query, return all data
    if (!query.trim()) {
      return this.getAll(page)
    }

    // For simple search, get all data and filter client-side
    const allData = await this.getAll(page)

    // Filter the results client-side across all fields
    const filteredResults = allData.data?.filter((item: TestReport) => {
      const searchTerm = query.toLowerCase()

      // Search across multiple fields
      const certificateMatch = item.certificate_id?.toLowerCase().includes(searchTerm) || false
      const requestMatch = item.request_info?.request_no?.toLowerCase().includes(searchTerm) || false
      const customerMatch = item.customers_name_no?.toLowerCase().includes(searchTerm) || false
      const poMatch = item.customer_po?.toLowerCase().includes(searchTerm) || false

      // Also try searching for individual words in the query
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0)
      let wordMatch = false

      if (searchWords.length > 1) {
        // If multiple words, check if any word matches any field
        wordMatch = searchWords.some(word => 
          item.certificate_id?.toLowerCase().includes(word) ||
          item.request_info?.request_no?.toLowerCase().includes(word) ||
          item.customers_name_no?.toLowerCase().includes(word) ||
          item.customer_po?.toLowerCase().includes(word)
        )
      }

      const isMatch = certificateMatch || requestMatch || customerMatch || poMatch || wordMatch

      return isMatch
    }) || []

    return {
      status: allData.status,
      data: filteredResults,
      total: filteredResults.length,
    }
  },

  async getById(id: string): Promise<TestReportResponse> {
    const response = await api.get(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATES}${id}/`).json()
    return response as TestReportResponse
  },

  async create(data: CreateTestReportData): Promise<TestReportResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATES, { json: data }).json()
    return response as TestReportResponse
  },

  async update(id: string, data: UpdateTestReportData): Promise<TestReportResponse> {
    const response = await api.put(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATES}${id}/`, { json: data }).json()
    return response as TestReportResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATES}${id}/`)
  },

  // Test Report Items (Certificate Items)
  async getItemsByCertificateId(certificateId: string): Promise<TestReportItemListResponse> {
    const response = await api.get(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATE_ITEMS}certificate/${certificateId}/`).json()
    return response as TestReportItemListResponse
  },

  async createItem(data: CreateTestReportItemData): Promise<TestReportItemResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATE_ITEMS, { json: data }).json()
    return response as TestReportItemResponse
  },

  async updateItem(id: string, data: UpdateTestReportItemData): Promise<TestReportItemResponse> {
    const response = await api.put(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATE_ITEMS}${id}/`, { json: data }).json()
    return response as TestReportItemResponse
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATE_ITEMS}${id}/`)
  },

  // Image Upload
  async uploadImage(data: { image: File; specimen_id: string }): Promise<{
    status: string
    message: string
    data: {
      image_url: string
      filename: string
      original_filename: string
      file_size: number
      file_extension: string
      specimen_id: string
      specimen_info: {
        specimen_id: string
        specimen_name: string
      }
      uploaded_at: string
      file_path: string
    }
  }> {
    const formData = new FormData()
    formData.append('image', data.image)
    formData.append('specimen_id', data.specimen_id)
    
    const accessToken = TokenStorage.getAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available. Please log in again.')
    }
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL+'/api' || "http://192.168.1.2:8000/api"}/${API_ROUTES.Lab_MANAGERS.UPLOAD_CERTIFICATE_ITEM_IMAGE}`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload error response:', errorText)
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    return result
  }
}