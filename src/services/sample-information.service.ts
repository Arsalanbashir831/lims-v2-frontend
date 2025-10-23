import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  SampleInformationResponse,
  CreateSampleInformationData,
  UpdateSampleInformationData,
  SampleInformation,
} from "@/lib/schemas/sample-information"



// Re-export types from schema
export type { SampleInformationResponse }

function mapToUi(item: SampleInformationResponse): SampleInformation {
  return {
    job_id: item.job_id,
    project_name: (item as any).project_name ?? null,
    client_id: (item as any).client_id ?? "",
    client_name: (item as any).client_info?.client_name ?? (item as any).client_name ?? "",
    received_by: (item as any).received_by ?? (item as any).end_user ?? null,
    receive_date: (item as any).receive_date ?? null,
    remarks: (item as any).remarks ?? null,
    sample_lots_count: (item as any).sample_lots_count ?? 0,
    is_active: (item as any).is_active !== false,
  }
}

// Shared list-like type for pages that need to handle either `results` or `data`
export type SampleInformationListLike = {
  results?: Record<string, unknown>[]
  data?: Record<string, unknown>[]
  count: number
  next: string | null
  previous: string | null
}

export const sampleInformationService = {
  async getAll(page: number = 1): Promise<SampleInformationListLike> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_INFORMATION
    const response = await api.get(endpoint, { searchParams: { page: page.toString() } }).json<{
      status: string
      data: Record<string, unknown>[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return {
        results: response.data.map((item: Record<string, unknown>) => ({
          ...mapToUi(item as any),
          id: (item.id || item._id) as string, // Ensure id field is included
        })) as any,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? 'next' : null,
        previous: response.pagination.current_page > 1 ? 'prev' : null,
      }
    }
    
    throw new Error("Failed to get sample information")
  },

  async getById(id: string): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_BY_ID(id)
    const response = await api.get(endpoint).json<{
      status: string
      data: {
        id: string
        job_id: string
        client_id: string
        client_info: {
          client_id: string
          client_name: string
          company_name: string
          email: string
          phone: string
        }
        project: string
        receive_date: string
        received_by: string
        remarks: string
        job_created_at: string
        created_at: string
        updated_at: string
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our SampleInformationResponse format
      const sampleInfoData: SampleInformationResponse = {
        id: response.data.id,
        job_id: response.data.job_id,
        client_id: response.data.client_id,
        client_name: response.data.client_info.client_name,
        project_name: response.data.project,
        receive_date: response.data.receive_date,
        received_by: response.data.received_by,
        remarks: response.data.remarks,
        is_active: true,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        sample_lots_count: 0 // Not provided in detail response
      }
      return sampleInfoData
    }
    
    throw new Error("Failed to get sample information")
  },

  async create(data: CreateSampleInformationData): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_INFORMATION
    const response = await api.post(endpoint, { json: data }).json<{
      status: string
      message: string
      data: {
        id: string
        job_id: string
        project_name: string
        client_name: string
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our SampleInformationResponse format
      const sampleInfoData: SampleInformationResponse = {
        id: response.data.id,
        job_id: response.data.job_id,
        project_name: response.data.project_name,
        client_id: "", // Not provided in create response
        client_name: response.data.client_name,
        received_by: undefined,
        receive_date: undefined,
        remarks: undefined,
        sample_lots_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: undefined
      }
      return sampleInfoData
    }
    
    throw new Error(response.message || "Failed to create sample information")
  },

  async update(id: string, data: UpdateSampleInformationData): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_INFORMATION(id)
    const response = await api.put(endpoint, { json: data }).json<{
      status: string
      message: string
      data: {
        id: string
        job_id: string
        project_name: string
        client_name: string
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our SampleInformationResponse format
      const sampleInfoData: SampleInformationResponse = {
        id: response.data.id,
        job_id: response.data.job_id,
        project_name: response.data.project_name,
        client_id: "", // Not provided in update response
        client_name: response.data.client_name,
        received_by: undefined,
        receive_date: undefined,
        remarks: undefined,
        sample_lots_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return sampleInfoData
    }
    
    throw new Error(response.message || "Failed to update sample information")
  },

  async delete(id: string): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_INFORMATION(id)
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<SampleInformationListLike> {
    // If no query, return all data
    if (!query.trim()) {
      return this.getAll(page)
    }
    
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_INFORMATION
    
    // Parse the combined query to extract individual search terms
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0)
    
    // Create search parameters - try different approaches
    const searchParams: Record<string, string> = { page: page.toString() }
    
    // Extract specific field searches
    let jobId = ""
    let projectName = ""
    let clientName = ""
    let endUser = ""
    const generalTerms: string[] = []
    
    // Parse each term to see if it has a field prefix
    searchTerms.forEach(term => {
      if (term.includes(':')) {
        const colonIndex = term.indexOf(':')
        const field = term.substring(0, colonIndex)
        const value = term.substring(colonIndex + 1)
        
        switch (field.toLowerCase()) {
          case 'job_id':
            jobId = value
            break
          case 'project':
            projectName = value
            break
          case 'client':
            clientName = value
            break
          case 'end_user':
            endUser = value
            break
          default:
            generalTerms.push(term)
        }
      } else {
        generalTerms.push(term)
      }
    })
    
    // Try different search strategies
    if (jobId) {
      // If we have a specific job_id, use it
      searchParams.job_id = jobId
    } else if (generalTerms.length > 0) {
      // Use the first general term as job_id (API limitation)
      searchParams.job_id = generalTerms[0]
    }
    
    // Add other search parameters if the API supports them
    if (projectName) {
      searchParams.project = projectName
    }
    if (clientName) {
      searchParams.client_name = clientName
    }
    if (endUser) {
      searchParams.received_by = endUser
    }
    
    // Debug: Log the search parameters being sent
    console.log('Search parameters being sent:', searchParams)
    console.log('Original query:', query)
    console.log('Extracted fields:', { jobId, projectName, clientName, endUser, generalTerms })
    
    // If we only have client/project/end_user filters but no job_id, get all data and filter client-side
    if (!jobId && !generalTerms.length && (projectName || clientName || endUser)) {
      console.log('Using client-side filtering for non-job_id searches')
      const allData = await this.getAll(page)
      
      // Filter the results client-side
      const filteredResults = allData.results?.filter((item: any) => {
        let matches = true
        
        if (projectName && matches) {
          matches = item.project_name?.toLowerCase().includes(projectName.toLowerCase()) || false
        }
        
        if (clientName && matches) {
          matches = item.client_name?.toLowerCase().includes(clientName.toLowerCase()) || false
        }
        
        if (endUser && matches) {
          matches = item.received_by?.toLowerCase().includes(endUser.toLowerCase()) || false
        }
        
        return matches
      }) || []
      
      return {
        ...allData,
        results: filteredResults,
        count: filteredResults.length
      }
    }
    
    const response = await api.get(endpoint, { searchParams }).json<{
      status: string
      data: Record<string, unknown>[]
      total: number
      filters_applied?: Record<string, unknown>
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // If we have additional filters (project, client, end_user), filter the results client-side
      let filteredData = response.data
      
      if (projectName || clientName || endUser) {
        filteredData = response.data.filter((item: any) => {
          let matches = true
          
        if (projectName && matches) {
          matches = item.project_name?.toLowerCase().includes(projectName.toLowerCase()) || false
        }
          
          if (clientName && matches) {
            matches = item.client_name?.toLowerCase().includes(clientName.toLowerCase()) || false
          }
          
          if (endUser && matches) {
            matches = item.received_by?.toLowerCase().includes(endUser.toLowerCase()) || false
          }
          
          return matches
        })
      }
      
      return {
        results: filteredData.map((item: Record<string, unknown>) => ({
          ...mapToUi(item as any),
          id: (item.id || item._id) as string, // Ensure id field is included
        })) as any,
        count: filteredData.length,
        next: null, // Simplified for now
        previous: null, // Simplified for now
      }
    }
    
    throw new Error("Failed to search sample information")
  },

  async getCompleteSampleInformation(id: string): Promise<{ job: {
    id: string;
    job_id: string;
    client_name: string;
    project_name: string;
    sample_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
  }, lots: Array<{
    id: string;
    item_no: string;
    description: string;
    sample_type: string;
    material_type: string;
    heat_no: string;
    mtc_no: string;
    storage_location: string;
    test_method_oids: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
  }> }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_COMPLETE_INFO(id)
    const response = await api.get(endpoint).json()
    return response as { job: {
      id: string;
      job_id: string;
      client_name: string;
      project_name: string;
      sample_count: number;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      created_by: string;
      updated_by: string;
    }, lots: Array<{
      id: string;
      item_no: string;
      description: string;
      sample_type: string;
      material_type: string;
      heat_no: string;
      mtc_no: string;
      storage_location: string;
      test_method_oids: string[];
      is_active: boolean;
      created_at: string;
      updated_at: string;
      created_by: string;
      updated_by: string;
    }> }
  },
}
export type { CreateSampleInformationData, UpdateSampleInformationData }
