import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  WelderCertificate,
  WelderCertificateResponse,
  WelderCertificateListResponse,
  CreateWelderCertificateData,
  UpdateWelderCertificateData,
} from "@/lib/schemas/welder"

// Re-export types for use in hooks
export type { CreateWelderCertificateData, UpdateWelderCertificateData }

export const welderCertificateService = {
  async getAll(page: number = 1, limit: number = 10, showInactive: boolean = false): Promise<WelderCertificateListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_CERTIFICATES, {
      searchParams: {
        page: page.toString(),
        limit: limit.toString(),
        show_inactive: showInactive.toString(),
        include_inactive: showInactive.toString(),
      }
    }).json<{
      status: string
      data: WelderCertificate[]
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

  async getById(id: string): Promise<{ data: WelderCertificate }> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_WELDER_CERTIFICATE_BY_ID(id))
      .json<{
        status: string
        data: WelderCertificate
      }>()

    return response
  },

  async create(data: CreateWelderCertificateData): Promise<WelderCertificate> {
    const response = await api.post(API_ROUTES.WELDERS_API.CREATE_WELDER_CERTIFICATE, {
      json: data
    }).json<{
      status: string
      data: WelderCertificate
    }>()

    return response.data
  },

  async update(id: string, data: UpdateWelderCertificateData): Promise<WelderCertificate> {
    const response = await api.put(API_ROUTES.WELDERS_API.UPDATE_WELDER_CERTIFICATE(id), {
      json: data
    }).json<{
      status: string
      data: WelderCertificate
    }>()

    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.WELDERS_API.DELETE_WELDER_CERTIFICATE(id))
  },

  async search(query: string, page: number = 1, limit: number = 10): Promise<WelderCertificateListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.SEARCH_WELDER_CERTIFICATES, {
      searchParams: {
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      }
    }).json<{
      status: string
      data: WelderCertificate[]
      total: number
      filters_applied: {
        certificate_no: string
        company: string
        card_no: string
        q: string
      }
    }>()

    return {
      results: response.data,
      count: response.total,
      next: null, // Search API doesn't provide pagination info
      previous: null,
    }
  }
}
