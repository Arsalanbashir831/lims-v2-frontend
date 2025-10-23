import { API_ROUTES } from "@/constants/api-routes";
import { api } from "@/lib/api/api";
import {
  SampleInformationResponse,
  CreateSampleInformationData,
  UpdateSampleInformationData,
  SampleInformation,
} from "@/lib/schemas/sample-information";

// Re-export types from schema
export type { SampleInformationResponse };

function mapToUi(item: SampleInformationResponse): SampleInformation {
  return {
    job_id: item.job_id,
    project_name: (item as any).project_name ?? null,
    client_id: (item as any).client_id ?? "",
    client_name:
      (item as any).client_info?.client_name ?? (item as any).client_name ?? "",
    received_by: (item as any).received_by ?? (item as any).end_user ?? null,
    receive_date: (item as any).receive_date ?? null,
    remarks: (item as any).remarks ?? null,
    sample_lots_count: (item as any).sample_lots_count ?? 0,
    is_active: (item as any).is_active !== false,
  };
}

// Shared list-like type for pages that need to handle either `results` or `data`
export type SampleInformationListLike = {
  results?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  count: number;
  next: string | null;
  previous: string | null;
};

export const sampleInformationService = {
  async getAll(page: number = 1): Promise<SampleInformationListLike> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_INFORMATION;
    const response = await api
      .get(endpoint, { searchParams: { page: page.toString() } })
      .json<{
        status: string;
        data: Record<string, unknown>[];
        pagination: {
          current_page: number;
          limit: number;
          total_records: number;
          total_pages: number;
          has_next: boolean;
        };
      }>();

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return {
        results: response.data.map((item: Record<string, unknown>) => ({
          ...mapToUi(item as any),
          id: (item.id || item._id) as string, // Ensure id field is included
        })) as any,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? "next" : null,
        previous: response.pagination.current_page > 1 ? "prev" : null,
      };
    }

    throw new Error("Failed to get sample information");
  },

  async getById(id: string): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_BY_ID(id);
    const response = await api.get(endpoint).json<{
      status: string;
      data: {
        id: string;
        job_id: string;
        client_id: string;
        client_info: {
          client_id: string;
          client_name: string;
          company_name: string;
          email: string;
          phone: string;
        };
        project: string;
        receive_date: string;
        received_by: string;
        remarks: string;
        job_created_at: string;
        created_at: string;
        updated_at: string;
      };
    }>();

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
        sample_lots_count: 0, // Not provided in detail response
      };
      return sampleInfoData;
    }

    throw new Error("Failed to get sample information");
  },

  async create(
    data: CreateSampleInformationData
  ): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_INFORMATION;
    const response = await api.post(endpoint, { json: data }).json<{
      status: string;
      message: string;
      data: {
        id: string;
        job_id: string;
        project_name: string;
        client_name: string;
      };
    }>();

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
        updated_at: undefined,
      };
      return sampleInfoData;
    }

    throw new Error(response.message || "Failed to create sample information");
  },

  async update(
    id: string,
    data: UpdateSampleInformationData
  ): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_INFORMATION(id);
    const response = await api.put(endpoint, { json: data }).json<{
      status: string;
      message: string;
      data: {
        id: string;
        job_id: string;
        project_name: string;
        client_name: string;
      };
    }>();

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
        updated_at: new Date().toISOString(),
      };
      return sampleInfoData;
    }

    throw new Error(response.message || "Failed to update sample information");
  },

  async delete(id: string): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_INFORMATION(id);
    await api.delete(endpoint);
  },

  async search(
    query: string,
    page: number = 1
  ): Promise<SampleInformationListLike> {
    // If no query, return all data
    if (!query.trim()) {
      return this.getAll(page);
    }

    // For simple search, get all data and filter client-side
    const allData = await this.getAll(page);

    // Filter the results client-side across all fields
    const filteredResults =
      allData.results?.filter((item: any) => {
        const searchTerm = query.toLowerCase();

        // Search across multiple fields
        const jobIdMatch =
          item.job_id?.toLowerCase().includes(searchTerm) || false;
        const projectMatch =
          item.project_name?.toLowerCase().includes(searchTerm) || false;
        const clientMatch =
          item.client_name?.toLowerCase().includes(searchTerm) || false;
        const endUserMatch =
          item.received_by?.toLowerCase().includes(searchTerm) || false;

        // Also try searching for individual words in the query
        const searchWords = searchTerm
          .split(/\s+/)
          .filter((word) => word.length > 0);
        let wordMatch = false;

        if (searchWords.length > 1) {
          // If multiple words, check if any word matches any field
          wordMatch = searchWords.some(
            (word) =>
              item.job_id?.toLowerCase().includes(word) ||
              item.project_name?.toLowerCase().includes(word) ||
              item.client_name?.toLowerCase().includes(word) ||
              item.received_by?.toLowerCase().includes(word)
          );
        }

        const isMatch =
          jobIdMatch ||
          projectMatch ||
          clientMatch ||
          endUserMatch ||
          wordMatch;

        return isMatch;
      }) || [];

    return {
      ...allData,
      results: filteredResults,
      count: filteredResults.length,
    };
  },

  async getCompleteSampleInformation(id: string): Promise<{
    job: {
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
    };
    lots: Array<{
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
    }>;
  }> {
    const endpoint =
      API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_COMPLETE_INFO(id);
    const response = await api.get(endpoint).json();
    return response as {
      job: {
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
      };
      lots: Array<{
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
      }>;
    };
  },
};
export type { CreateSampleInformationData, UpdateSampleInformationData };
