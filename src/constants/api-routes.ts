export const API_ROUTES = {
  AUTH: {
    LOGIN: "auth/login/",
    LOGOUT: "auth/logout/",
    REFRESH: "auth/token/refresh/",
  },
  Lab_MANAGERS:{
    // Clients
    ADD_CLIENT: "core/clients/",
    UPDATE_CLIENT: (id: string) => `core/clients/${id}/`,
    DELETE_CLIENT: (id: string) => `core/clients/${id}/`,
    ALL_CLIENTS: "core/clients/",
    CLIENT_BY_ID: (id: string) => `core/clients/${id}/`,
    SEARCH_CLIENTS: "core/clients/search/",
    CLIENT_STATISTICS: 'core/clients/statistics/',

    // Equipments
    ADD_EQUIPMENT: "equipments/",
    UPDATE_EQUIPMENT: (id: string) => `equipments/${id}/`,
    DELETE_EQUIPMENT: (id: string) => `equipments/${id}/`,
    ALL_EQUIPMENTS: "equipments/",
    EQUIPMENT_BY_ID: (id: string) => `equipments/${id}/`,
    SEARCH_EQUIPMENTS: "equipments/search/",
    EQUIPMENT_STATISTICS: 'equipments/statistics/',

    // Proficiency Tests
    ADD_PROF_TEST: "proficiency-tests/",
    UPDATE_PROF_TEST: (id: string) => `proficiency-tests/${id}/`,
    DELETE_PROF_TEST: (id: string) => `proficiency-tests/${id}/`,
    ALL_PROF_TESTS: "proficiency-tests/",
    PROF_TEST_BY_ID: (id: string) => `proficiency-tests/${id}/`,
    SEARCH_PROF_TESTS: "proficiency-tests/search/",
    PROF_TEST_STATISTICS: 'proficiency-tests/statistics/',
    
    // Calibration Tests
    ADD_CALIBRATION_TEST: "calibration-tests/",
    UPDATE_CALIBRATION_TEST: (id: string) => `calibration-tests/${id}/`,
    DELETE_CALIBRATION_TEST: (id: string) => `calibration-tests/${id}/`,
    ALL_CALIBRATION_TESTS: "calibration-tests/",
    CALIBRATION_TEST_BY_ID: (id: string) => `calibration-tests/${id}/`,
    SEARCH_CALIBRATION_TESTS: "calibration-tests/search/",
    CALIBRATION_TEST_STATISTICS: 'calibration-tests/statistics/',

    // Test Methods
    ADD_TEST_METHOD: "test-methods/",
    UPDATE_TEST_METHOD: (id: string) => `test-methods/${id}/`,
    DELETE_TEST_METHOD: (id: string) => `test-methods/${id}/`,
    ALL_TEST_METHODS: "test-methods/",
    TEST_METHOD_BY_ID: (id: string) => `test-methods/${id}/`,
    SEARCH_TEST_METHODS: "test-methods/search/",
    TEST_METHOD_STATISTICS: 'test-methods/statistics/',

    // Sample Information
    ADD_SAMPLE_INFORMATION: "jobs/",
    UPDATE_SAMPLE_INFORMATION: (id: string) => `jobs/${id}/`,
    DELETE_SAMPLE_INFORMATION: (id: string) => `jobs/${id}/`,
    ALL_SAMPLE_INFORMATION: "jobs/",
    SAMPLE_INFORMATION_BY_ID: (id: string) => `jobs/${id}/`,
    SEARCH_SAMPLE_INFORMATION: "jobs/search/",
    SAMPLE_INFORMATION_STATISTICS: 'jobs/statistics/',

    // Sample Details
    ADD_SAMPLE_DETAIL: "samples/",
    UPDATE_SAMPLE_DETAIL: (id: string) => `samples/${id}/`,
    DELETE_SAMPLE_DETAIL: (id: string) => `samples/${id}/`,
    ALL_SAMPLE_DETAILS: "samples/",
    SAMPLE_DETAIL_BY_ID: (id: string) => `samples/${id}/`,
    SEARCH_SAMPLE_DETAILS: "samples/search/",
    SAMPLE_DETAIL_STATISTICS: 'samples/statistics/',

    // Complete Jobs
    GET_COMPLETE_JOB: (jobId: string) => `complete-jobs/${jobId}/`,

    // Sample Preparation (Complete Requests)
    ADD_SAMPLE_PREPARATION: "complete-requests/",
    UPDATE_SAMPLE_PREPARATION: (id: string) => `complete-requests/${id}/`,
    DELETE_SAMPLE_PREPARATION: (id: string) => `complete-requests/${id}/`,
    ALL_SAMPLE_PREPARATIONS: "complete-requests/",
    GET_SAMPLE_PREPARATION: (id: string) => `complete-requests/${id}/`,
    SEARCH_SAMPLE_PREPARATIONS: "complete-requests/search/",
    SAMPLE_PREPARATION_STATISTICS: 'complete-requests/statistics/',
  }
}