import { API_ROUTES } from "@/constants/api-routes";
import { api } from "@/lib/api/api";
import {
  SamplePreparationResponse,
  SamplePreparationListResponse,
  CreateSamplePreparationData,
  UpdateSamplePreparationData,
  SpecimenResponse,
  CreateSpecimenData,
  UpdateSpecimenData,
} from "@/lib/schemas/sample-preparation";

export const samplePreparationService = {
  // Sample Preparation CRUD
  async getAll(page: number = 1): Promise<SamplePreparationListResponse> {
    const response = await api
      .get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_PREPARATIONS, {
        searchParams: { page: page.toString() },
      })
      .json<{
        status: string;
        data: Array<{
          id: string;
          request_no: string;
          sample_lots: Array<{
            item_description: string;
            planned_test_date: string | null;
            dimension_spec: string | null;
            request_by: string | null;
            remarks: string | null;
            sample_lot_id: string;
            test_method: {
              test_method_oid: string;
              test_name: string;
            };
            job_id: string;
            item_no: string;
            client_name: string | null;
            project_name: string | null;
            specimens: Array<{
              specimen_oid: string;
              specimen_id: string;
            }>;
            specimens_count: number;
          }>;
          sample_lots_count: number;
          created_at: string;
          updated_at: string;
        }>;
        total: number;
      }>();

    if (response.status === "success" && response.data) {
      return {
        status: response.status,
        data: response.data,
        total: response.total,
      };
    }

    throw new Error("Failed to get sample preparations");
  },

  async getById(id: string): Promise<SamplePreparationResponse> {
    const response = await api
      .get(API_ROUTES.Lab_MANAGERS.SAMPLE_PREPARATION_BY_ID(id))
      .json<{
        status: string;
        data: {
          id: string;
          request_no: string;
          sample_lots: Array<{
            item_description: string;
            planned_test_date: string | null;
            dimension_spec: string | null;
            request_by: string | null;
            remarks: string | null;
            sample_lot_id: string;
            test_method: {
              test_method_oid: string;
              test_name: string;
            };
            job_id: string;
            item_no: string;
            client_name: string | null;
            project_name: string | null;
            specimens: Array<{
              specimen_oid: string;
              specimen_id: string;
            }>;
            specimens_count: number;
          }>;
          sample_lots_count: number;
          created_at: string;
          updated_at: string;
        };
      }>();

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to get sample preparation");
  },

  async create(
    data: CreateSamplePreparationData
  ): Promise<SamplePreparationResponse> {
    const response = await api
      .post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_PREPARATION, { json: data })
      .json();
    return response as SamplePreparationResponse;
  },

  async update(
    id: string,
    data: UpdateSamplePreparationData
  ): Promise<SamplePreparationResponse> {
    const response = await api
      .put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_PREPARATION(id), {
        json: data,
      })
      .json();
    return response as SamplePreparationResponse;
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_PREPARATION(id));
  },

  async search(
    query: string,
    page: number = 1
  ): Promise<SamplePreparationListResponse> {
    // If no query, return all data
    if (!query.trim()) {
      return this.getAll(page);
    }

    // For simple search, get all data and filter client-side
    const allData = await this.getAll(page);

    // Filter the results client-side across all fields
    const filteredResults =
      allData.data?.filter((item: any) => {
        const searchTerm = query.toLowerCase();

        // Search across multiple fields
        const requestMatch =
          item.request_no?.toLowerCase().includes(searchTerm) || false;
        const jobIdMatch =
          item.sample_lots?.some((lot: any) =>
            lot.job_id?.toLowerCase().includes(searchTerm)
          ) || false;
        const projectMatch =
          item.sample_lots?.some((lot: any) =>
            lot.project_name?.toLowerCase().includes(searchTerm)
          ) || false;
        const clientMatch =
          item.sample_lots?.some((lot: any) =>
            lot.client_name?.toLowerCase().includes(searchTerm)
          ) || false;

        // Also try searching for individual words in the query
        const searchWords = searchTerm
          .split(/\s+/)
          .filter((word) => word.length > 0);
        let wordMatch = false;

        if (searchWords.length > 1) {
          // If multiple words, check if any word matches any field
          wordMatch = searchWords.some(
            (word) =>
              item.request_no?.toLowerCase().includes(word) ||
              item.sample_lots?.some(
                (lot: any) =>
                  lot.job_id?.toLowerCase().includes(word) ||
                  lot.project_name?.toLowerCase().includes(word) ||
                  lot.client_name?.toLowerCase().includes(word)
              )
          );
        }

        const isMatch =
          requestMatch ||
          jobIdMatch ||
          projectMatch ||
          clientMatch ||
          wordMatch;

        return isMatch;
      }) || [];

    return {
      status: allData.status,
      data: filteredResults,
      total: filteredResults.length,
    };
  },

  // Specimen CRUD
  async getSpecimenById(id: string): Promise<SpecimenResponse> {
    const response = await api
      .get(API_ROUTES.Lab_MANAGERS.SPECIMEN_BY_ID(id))
      .json();
    return response as SpecimenResponse;
  },

  async createSpecimen(data: CreateSpecimenData): Promise<SpecimenResponse> {
    const response = await api
      .post(API_ROUTES.Lab_MANAGERS.ADD_SPECIMEN, { json: data })
      .json();
    return response as SpecimenResponse;
  },

  async updateSpecimen(
    id: string,
    data: UpdateSpecimenData
  ): Promise<SpecimenResponse> {
    const response = await api
      .put(API_ROUTES.Lab_MANAGERS.UPDATE_SPECIMEN(id), { json: data })
      .json();
    return response as SpecimenResponse;
  },

  async deleteSpecimen(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SPECIMEN(id));
  },

  // Get sample preparations by job ID
  async getByJobId(jobId: string): Promise<{
    status: string;
    data: Array<{
      id: string;
      request_no: string;
      sample_lots: Array<{
        item_description: string;
        planned_test_date: string | null;
        dimension_spec: string | null;
        request_by: string | null;
        remarks: string | null;
        sample_lot_id: string;
        test_method: {
          test_method_oid: string;
          test_name: string;
        };
        job_id: string;
        item_no: string;
        client_name: string | null;
        project_name: string | null;
        specimens: Array<{
          specimen_oid: string;
          specimen_id: string;
        }>;
        specimens_count: number;
      }>;
      sample_lots_count: number;
      created_at: string;
      updated_at: string;
    }>;
    total: number;
    job_oid: string;
    job_id: string;
    project_name: string;
    client_name: string;
  }> {
    const response = await api
      .get(API_ROUTES.Lab_MANAGERS.GET_SAMPLE_PREPARATIONS_BY_JOB_ID(jobId))
      .json<{
        status: string;
        data: Array<{
          id: string;
          request_no: string;
          sample_lots: Array<{
            item_description: string;
            planned_test_date: string | null;
            dimension_spec: string | null;
            request_by: string | null;
            remarks: string | null;
            sample_lot_id: string;
            test_method: {
              test_method_oid: string;
              test_name: string;
            };
            job_id: string;
            item_no: string;
            client_name: string | null;
            project_name: string | null;
            specimens: Array<{
              specimen_oid: string;
              specimen_id: string;
            }>;
            specimens_count: number;
          }>;
          sample_lots_count: number;
          created_at: string;
          updated_at: string;
        }>;
        total: number;
        job_oid: string;
        job_id: string;
        project_name: string;
        client_name: string;
      }>();

    if (response.status === "success") {
      return response;
    }

    throw new Error("Failed to get sample preparations by job ID");
  },
};

export type {
  SamplePreparationResponse,
  SamplePreparationListResponse,
  CreateSamplePreparationData,
  UpdateSamplePreparationData,
  SpecimenResponse,
  CreateSpecimenData,
  UpdateSpecimenData,
};
