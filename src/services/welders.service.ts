import { API_ROUTES } from "@/constants/api-routes"
import { api, uploadWithFormData } from "@/lib/api/api"
import {
  Welder,
  WelderResponse,
  WelderListResponse,
  CreateWelderData,
  UpdateWelderData,
} from "@/lib/schemas/welder"

// Re-export types for use in hooks
export type { CreateWelderData, UpdateWelderData } from "@/lib/schemas/welder"

export const welderService = {
  async getAll(page: number = 1, limit: number = 10, showInactive: boolean = false): Promise<WelderListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDERS, {
      searchParams: {
        page: page.toString(),
        limit: limit.toString(),
        show_inactive: showInactive.toString(),
        include_inactive: showInactive.toString(),
      }
    }).json<{
      status: string
      data: WelderResponse[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    if (response.status === "success" && response.data) {
      return {
        results: response.data,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? 'next' : null,
        previous: response.pagination.current_page > 1 ? 'prev' : null,
      }
    }
    
    throw new Error("Failed to get welders")
  },

  async getById(id: string): Promise<WelderResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_WELDER_BY_ID(id)).json<{
      status: string
      data: WelderResponse
    }>()

    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to get welder")
  },

  async create(data: CreateWelderData & { profile_image?: File }): Promise<WelderResponse> {
    const formData = new FormData()
    formData.append('operator_name', data.operator_name)
    formData.append('operator_id', data.operator_id)
    formData.append('iqama', data.iqama)
    
    if (data.profile_image) {
      formData.append('profile_image', data.profile_image)
    }

    try {

      const response = await uploadWithFormData<{
        status: string
        data: WelderResponse
      }>(API_ROUTES.WELDERS_API.CREATE_WELDER, formData, "POST")


      if (response.status === "success" && response.data) {
        return response.data
      }
      
      throw new Error(`Failed to create welder: ${response.status}`)
    } catch (error: any) {
      console.error('Error creating welder:', error)
      
      // Handle specific UTF-8 decoding errors
      if (error.message?.includes("utf-8 codec can't decode")) {
        throw new Error("Invalid image file format. Please ensure the image is a valid PNG, JPG, or JPEG file.")
      }
      if (error.message?.includes("Invalid response format")) {
        throw new Error("Server returned an invalid response. Please check your image file and try again.")
      }
      throw error
    }
  },

  async update(id: string, data: UpdateWelderData & { profile_image?: File; remove_image?: boolean }): Promise<WelderResponse> {
    const formData = new FormData()
    
    if (data.operator_name) {
      formData.append('operator_name', data.operator_name)
    }
    if (data.operator_id) {
      formData.append('operator_id', data.operator_id)
    }
    if (data.iqama) {
      formData.append('iqama', data.iqama)
    }
    
    if (data.profile_image) {
      formData.append('profile_image', data.profile_image)
    }
    
    if (data.remove_image) {
      formData.append('remove_image', 'true')
    }

    try {
      const response = await uploadWithFormData<{
        status: string
        data: WelderResponse
      }>(API_ROUTES.WELDERS_API.UPDATE_WELDER(id), formData, "PUT")

      if (response.status === "success" && response.data) {
        return response.data
      }
      
      throw new Error("Failed to update welder")
    } catch (error: any) {
      // Handle specific UTF-8 decoding errors
      if (error.message?.includes("utf-8 codec can't decode")) {
        throw new Error("Invalid image file format. Please ensure the image is a valid PNG, JPG, or JPEG file.")
      }
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.WELDERS_API.DELETE_WELDER(id))
  },

  async search(operator_id: string, page: number = 1, limit: number = 10): Promise<WelderListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.SEARCH_WELDERS, {
      searchParams: {
        operator_id: operator_id,
        page: page.toString(),
        limit: limit.toString(),
      }
    }).json<{
      status: string
      data: WelderResponse[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    if (response.status === "success" && response.data) {
      return {
        results: response.data,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? 'next' : null,
        previous: response.pagination.current_page > 1 ? 'prev' : null,
      }
    }
    
    throw new Error("Failed to search welders")
  }
}