export const API_ROUTES = {
  AUTH: {
    REGISTER: "auth/register",
  },
  Lab_MANAGERS: {
    // Clients
    ADD_CLIENT: "api/clients",
    UPDATE_CLIENT: (id: string) => `api/clients/${id}`,
    DELETE_CLIENT: (id: string) => `api/clients/${id}`,
    ALL_CLIENTS: "api/clients",
    CLIENT_BY_ID: (id: string) => `api/clients/${id}`,
    SEARCH_CLIENTS: "api/clients/search",

    // Equipments
    ADD_EQUIPMENT: "api/equipments",
    UPDATE_EQUIPMENT: (id: string) => `api/equipments/${id}`,
    DELETE_EQUIPMENT: (id: string) => `api/equipments/${id}`,
    ALL_EQUIPMENTS: "api/equipments",
    EQUIPMENT_BY_ID: (id: string) => `api/equipments/${id}`,
    SEARCH_EQUIPMENTS: "api/equipments/search",

    // Proficiency Tests
    ADD_PROF_TEST: "api/proficiency-tests",
    UPDATE_PROF_TEST: (id: string) => `api/proficiency-tests/${id}`,
    DELETE_PROF_TEST: (id: string) => `api/proficiency-tests/${id}`,
    ALL_PROF_TESTS: "api/proficiency-tests",
    PROF_TEST_BY_ID: (id: string) => `api/proficiency-tests/${id}`,
    SEARCH_PROF_TESTS: "api/proficiency-tests/search",
    
    // Calibration Tests
    ADD_CALIBRATION_TEST: "api/calibration-tests",
    UPDATE_CALIBRATION_TEST: (id: string) => `api/calibration-tests/${id}`,
    DELETE_CALIBRATION_TEST: (id: string) => `api/calibration-tests/${id}`,
    ALL_CALIBRATION_TESTS: "api/calibration-tests",
    CALIBRATION_TEST_BY_ID: (id: string) => `api/calibration-tests/${id}`,
    SEARCH_CALIBRATION_TESTS: "api/calibration-tests/search",

    // Test Methods
    ADD_TEST_METHOD: "api/test-methods",
    UPDATE_TEST_METHOD: (id: string) => `api/test-methods/${id}`,
    DELETE_TEST_METHOD: (id: string) => `api/test-methods/${id}`,
    ALL_TEST_METHODS: "api/test-methods",
    TEST_METHOD_BY_ID: (id: string) => `api/test-methods/${id}`,
    SEARCH_TEST_METHODS: "api/test-methods/search",

    // Sample Information
    ADD_SAMPLE_INFORMATION: "api/sample-information",
    UPDATE_SAMPLE_INFORMATION: (id: string) => `api/sample-information/${id}`,
    DELETE_SAMPLE_INFORMATION: (id: string) => `api/sample-information/${id}`,
    ALL_SAMPLE_INFORMATION: "api/sample-information",
    SAMPLE_INFORMATION_BY_ID: (id: string) => `api/sample-information/${id}`,
    SEARCH_SAMPLE_INFORMATION: "api/sample-information/search",

    // Sample Details
    ADD_SAMPLE_DETAIL: "api/sample-details",
    UPDATE_SAMPLE_DETAIL: (id: string) => `api/sample-details/${id}`,
    DELETE_SAMPLE_DETAIL: (id: string) => `api/sample-details/${id}`,
    ALL_SAMPLE_DETAILS: "api/sample-details",
    SAMPLE_DETAIL_BY_ID: (id: string) => `api/sample-details/${id}`,
    SEARCH_SAMPLE_DETAILS: "api/sample-details/search",

    // Sample Preparation (Complete Requests)
    ADD_SAMPLE_PREPARATION: "api/sample-preparation",
    DELETE_SAMPLE_PREPARATION: (id: string) => `api/sample-preparation/${id}`,
    ALL_SAMPLE_PREPARATIONS: "api/sample-preparation",
    GET_SAMPLE_PREPARATION: (id: string) => `api/sample-preparation/${id}`,

    // Complete Certificates
    ADD_COMPLETE_CERTIFICATE: "api/complete-certificates",
    UPDATE_COMPLETE_CERTIFICATE: (id: string) => `api/complete-certificates/${id}`,
    DELETE_COMPLETE_CERTIFICATE: (id: string) => `api/complete-certificates/${id}`,
    ALL_COMPLETE_CERTIFICATES: "api/complete-certificates",
    COMPLETE_CERTIFICATE_BY_ID: (id: string) => `api/complete-certificates/${id}`,
    SEARCH_COMPLETE_CERTIFICATES: "api/complete-certificates/search",
  }
}