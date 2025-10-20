
export interface TestMethod {
    id: string
    test_name: string
  }
  
  export interface SampleLotApiResponse {
    id: string
    item_no: string
    description: string
    sample_type: string
    material_type: string
    heat_no: string
    mtc_no: string
    storage_location: string
    test_methods: TestMethod[]
    is_active: boolean
    created_at: string
    updated_at: string
  }