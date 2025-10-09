import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"

export interface CreateSpecimenData {
  specimen_id: string
}

export interface SpecimenResponse {
  id: string
  specimen_id: string
  created_at: string
  updated_at: string
}

export interface ParallelCreateSpecimensResponse {
  success: SpecimenResponse[]
  errors: { specimen_id: string; error: string }[]
}

export const specimensService = {
  async create(data: CreateSpecimenData): Promise<SpecimenResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SPECIMEN, { json: data }).json<{
      status: string
      data: SpecimenResponse
    }>()
    
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to create specimen")
  },

  async createParallel(specimens: CreateSpecimenData[]): Promise<ParallelCreateSpecimensResponse> {
    const promises = specimens.map(async (specimen) => {
      try {
        const result = await this.create(specimen)
        return { success: result, error: null }
      } catch (error) {
        return { 
          success: null, 
          error: { 
            specimen_id: specimen.specimen_id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          } 
        }
      }
    })

    const results = await Promise.all(promises)
    
    const success: SpecimenResponse[] = []
    const errors: { specimen_id: string; error: string }[] = []
    
    results.forEach(result => {
      if (result.success) {
        success.push(result.success)
      } else if (result.error) {
        errors.push(result.error)
      }
    })

    return { success, errors }
  },

  async getById(id: string): Promise<SpecimenResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SPECIMEN_BY_ID(id)).json<{
      status: string
      data: SpecimenResponse
    }>()
    
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to get specimen")
  },

  async update(id: string, data: Partial<CreateSpecimenData>): Promise<SpecimenResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SPECIMEN(id), { json: data }).json<{
      status: string
      data: SpecimenResponse
    }>()
    
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to update specimen")
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SPECIMEN(id))
  },
}
