import { api } from "@/lib/api/api"
import { API_ROUTES } from "@/constants/api-routes"
import { TokenStorage } from "@/lib/auth/token-storage"

export interface SpecimenSection {
  specimen_id: string
  test_results: string // JSON string
  images_list?: Array<{
    image_url: string
    caption: string
  }>
  equipment_name: string
  equipment_calibration: string
}

export interface CertificateItem {
  id: string
  certificate_id: string
  sample_preparation_method: string
  material_grade: string
  temperature: string
  humidity: string
  po: string
  mtc_no: string
  heat_no: string
  comments: string
  specimen_sections: SpecimenSection[]
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CreateCertificateItemData {
  certificate_id: string
  sample_preparation_method: string
  material_grade: string
  temperature: string
  humidity: string
  po: string
  mtc_no: string
  heat_no: string
  comments: string
  specimen_sections: SpecimenSection[]
}

export interface UpdateCertificateItemData extends Partial<CreateCertificateItemData> {}

export interface CertificateItemResponse {
  status: string
  data: CertificateItem
  message?: string
}

export interface CertificateItemListResponse {
  status: string
  data: CertificateItem[]
  total: number
  message?: string
}

export interface CertificateItemSearchResponse {
  status: string
  data: CertificateItem[]
  total: number
  message?: string
}

export interface ImageUploadResponse {
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
}

export interface ImageUploadData {
  image: File
  specimen_id: string
}

export const certificateItemsService = {
  async create(data: CreateCertificateItemData): Promise<CertificateItemResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_CERTIFICATE_ITEM, { json: data }).json<CertificateItemResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to create certificate item")
  },

  async update(id: string, data: UpdateCertificateItemData): Promise<CertificateItemResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_CERTIFICATE_ITEM(id), { json: data }).json<CertificateItemResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to update certificate item")
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_CERTIFICATE_ITEM(id))
  },

  async getById(id: string): Promise<CertificateItemResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.CERTIFICATE_ITEM_BY_ID(id)).json<CertificateItemResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to get certificate item")
  },

  async getAll(page: number = 1): Promise<CertificateItemListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_CERTIFICATE_ITEMS, { 
      searchParams: { page: page.toString() } 
    }).json<CertificateItemListResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to get certificate items")
  },

  async getByCertificateId(certificateId: string): Promise<CertificateItemListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.GET_CERTIFICATE_ITEMS_BY_CERTIFICATE_ID(certificateId)).json<CertificateItemListResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to get certificate items by certificate ID")
  },

  async search(query: string, page: number = 1): Promise<CertificateItemSearchResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_CERTIFICATE_ITEMS, { 
      searchParams: { q: query, page: page.toString() } 
    }).json<CertificateItemSearchResponse>()
    
    if (response.status === "success" && response.data) {
      return response
    }
    throw new Error("Failed to search certificate items")
  },

  async uploadImage(data: ImageUploadData): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('image', data.image)
    formData.append('specimen_id', data.specimen_id)
    
    // Create a custom request for FormData to avoid Content-Type override
    const accessToken = TokenStorage.getAccessToken()
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL+'/api' || "http://192.168.1.2:8000/api"}/${API_ROUTES.Lab_MANAGERS.UPLOAD_CERTIFICATE_ITEM_IMAGE}`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || ''}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json() as ImageUploadResponse
    return result
  }
}
