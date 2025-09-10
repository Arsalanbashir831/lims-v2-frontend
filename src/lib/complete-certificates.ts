import { z } from "zod"
import { api } from "./api/api"
import { API_ROUTES } from "@/constants/api-routes"

// Test Results Schema for JSON field - Object with columns and data
export const TestResultSchema = z.object({
  columns: z.array(z.string()), // Column names
  data: z.array(z.array(z.any())) // Array of rows, each row is array of column values
})

// Specimen Section Schema
export const SpecimenSectionSchema = z.object({
  test_results: TestResultSchema
})

// Certificate Item Schema
export const CertificateItemSchema = z.object({
  test_items_id: z.string(),
  specimen_id: z.string(),
  calibration_equipment_id: z.string(),
  sample_description: z.string(),
  sample_preparation_method: z.string(),
  material_grade: z.string(),
  temperature: z.string(),
  humidity: z.string(),
  po_number: z.string().optional(),
  mtc_no: z.string().optional(),
  heat_no: z.string().optional(),
  comments: z.string().optional(),
  specimen_sections: z.array(SpecimenSectionSchema)
})

// Complete Certificate Schema
export const CompleteCertificateSchema = z.object({
  request_id: z.string(),
  date_of_sampling: z.string(),
  date_of_testing: z.string(),
  issue_date: z.string(),
  gripco_ref_no: z.string().optional().default(""),
  revision_no: z.string(),
  client_name: z.string().optional().default(""),
  customer_name_no: z.string().optional(),
  atten: z.string().optional(),
  customer_po: z.string().optional(),
  project_name: z.string().optional().default(""),
  name_of_laboratory: z.string().optional().default(""),
  address: z.string().optional().default(""),
  tested_by: z.string(),
  reviewed_by: z.string(),
  certificate_items_json: z.array(CertificateItemSchema).optional().default([])
})

export type CompleteCertificate = z.infer<typeof CompleteCertificateSchema>
export type CertificateItem = z.infer<typeof CertificateItemSchema>
export type SpecimenSection = z.infer<typeof SpecimenSectionSchema>
export type TestResult = z.infer<typeof TestResultSchema>

// API Response Schema for list
export const CompleteCertificateListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.string(), z.number()]).nullable().transform(val => val ? String(val) : null),
  previous: z.union([z.string(), z.number()]).nullable().transform(val => val ? String(val) : null),
  results: z.array(CompleteCertificateSchema),
})

export type CompleteCertificateListResponse = z.infer<typeof CompleteCertificateListResponseSchema>

export const completeCertificateService = {
  async getAll(page: number = 1): Promise<CompleteCertificateListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_COMPLETE_CERTIFICATES, {
      searchParams: { page }
    }).json()
    
    // Transform the response to handle undefined values
    const transformedResponse = {
      ...response,
      results: (response.results || []).map((item: any) => ({
        ...item,
        gripco_ref_no: item.gripco_ref_no || "",
        client_name: item.client_name || "",
        project_name: item.project_name || "",
        name_of_laboratory: item.name_of_laboratory || "",
        address: item.address || "",
        certificate_items_json: item.certificate_items_json || []
      }))
    }
    
    return CompleteCertificateListResponseSchema.parse(transformedResponse)
  },

  async getById(id: string): Promise<CompleteCertificate> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.COMPLETE_CERTIFICATE_BY_ID(id)).json()
    return CompleteCertificateSchema.parse(response)
  },

  async search(query: string, page: number = 1): Promise<CompleteCertificateListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_COMPLETE_CERTIFICATES, {
      searchParams: { q: query, page }
    }).json()
    
    // Transform the response to handle undefined values
    const transformedResponse = {
      ...response,
      results: (response.results || []).map((item: any) => ({
        ...item,
        gripco_ref_no: item.gripco_ref_no || "",
        client_name: item.client_name || "",
        project_name: item.project_name || "",
        name_of_laboratory: item.name_of_laboratory || "",
        address: item.address || "",
        certificate_items_json: item.certificate_items_json || []
      }))
    }
    
    return CompleteCertificateListResponseSchema.parse(transformedResponse)
  },

  async create(data: CompleteCertificate): Promise<any> {
    // Convert to FormData for multipart/form-data submission
    const formData = new FormData()
    
    // Add all certificate fields
    formData.append('request_id', data.request_id)
    formData.append('date_of_sampling', data.date_of_sampling)
    formData.append('date_of_testing', data.date_of_testing)
    formData.append('issue_date', data.issue_date)
    formData.append('gripco_ref_no', data.gripco_ref_no)
    formData.append('revision_no', data.revision_no)
    formData.append('client_name', data.client_name)
    
    if (data.customer_name_no) formData.append('customer_name_no', data.customer_name_no)
    if (data.atten) formData.append('atten', data.atten)
    if (data.customer_po) formData.append('customer_po', data.customer_po)
    
    formData.append('project_name', data.project_name)
    formData.append('name_of_laboratory', data.name_of_laboratory)
    formData.append('address', data.address)
    formData.append('tested_by', data.tested_by)
    formData.append('reviewed_by', data.reviewed_by)
    
    // Add certificate items as JSON
    formData.append('certificate_items_json', JSON.stringify(data.certificate_items_json))
    
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_COMPLETE_CERTIFICATE, {
      body: formData
    }).json()
    
    return response
  },

  async update(id: string, data: Partial<CompleteCertificate>): Promise<CompleteCertificate> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_COMPLETE_CERTIFICATE(id), {
      json: data
    }).json()
    
    return CompleteCertificateSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_COMPLETE_CERTIFICATE(id))
  },
}
