import { z } from "zod"
import { api } from "./api/client"
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
  gripco_ref_no: z.string(),
  revision_no: z.string(),
  client_name: z.string(),
  customer_name_no: z.string().optional(),
  atten: z.string().optional(),
  customer_po: z.string().optional(),
  project_name: z.string(),
  name_of_laboratory: z.string(),
  address: z.string(),
  tested_by: z.string(),
  reviewed_by: z.string(),
  certificate_items_json: z.array(CertificateItemSchema)
})

export type CompleteCertificate = z.infer<typeof CompleteCertificateSchema>
export type CertificateItem = z.infer<typeof CertificateItemSchema>
export type SpecimenSection = z.infer<typeof SpecimenSectionSchema>
export type TestResult = z.infer<typeof TestResultSchema>

// API Response Schema for list
export const CompleteCertificateListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(CompleteCertificateSchema),
})

export type CompleteCertificateListResponse = z.infer<typeof CompleteCertificateListResponseSchema>

export const completeCertificateService = {
  async getAll(page: number = 1): Promise<CompleteCertificateListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_COMPLETE_CERTIFICATES, {
      searchParams: { page }
    }).json()
    
    return CompleteCertificateListResponseSchema.parse(response)
  },

  async getById(id: string): Promise<CompleteCertificate> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.COMPLETE_CERTIFICATE_BY_ID(id)).json()
    return CompleteCertificateSchema.parse(response)
  },

  async search(query: string, page: number = 1): Promise<CompleteCertificateListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_COMPLETE_CERTIFICATES, {
      searchParams: { q: query, page }
    }).json()
    
    return CompleteCertificateListResponseSchema.parse(response)
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
