export const API_ROUTES = {
  AUTH: {
    LOGIN: "auth/login/",
    REGISTER: "auth/register/",
    VERIFY_TOKEN: "auth/verify/",
    REFRESH_TOKEN: "auth/refresh/",
    LOGOUT: "auth/logout/",
  },
  Lab_MANAGERS: {
    // Clients
    ADD_CLIENT: "clients/",
    UPDATE_CLIENT: (id: string) => `clients/${id}/`,
    DELETE_CLIENT: (id: string) => `clients/${id}/`,
    ALL_CLIENTS: "clients/",
    CLIENT_BY_ID: (id: string) => `clients/${id}/`,
    SEARCH_CLIENTS: "clients/search/",

    // Equipments
    ADD_EQUIPMENT: "equipments/",
    UPDATE_EQUIPMENT: (id: string) => `equipments/${id}/`,
    DELETE_EQUIPMENT: (id: string) => `equipments/${id}/`,
    ALL_EQUIPMENTS: "equipments/",
    EQUIPMENT_BY_ID: (id: string) => `equipments/${id}/`,
    SEARCH_EQUIPMENTS: "equipments/search/",

    // Proficiency Tests
    ADD_PROF_TEST: "proficiency-testing/",
    UPDATE_PROF_TEST: (id: string) => `proficiency-testing/${id}/`,
    DELETE_PROF_TEST: (id: string) => `proficiency-testing/${id}/`,
    ALL_PROF_TESTS: "proficiency-testing/",
    PROF_TEST_BY_ID: (id: string) => `proficiency-testing/${id}/`,
    SEARCH_PROF_TESTS: "proficiency-testing/search/",
    
    // Calibration Tests
    ADD_CALIBRATION_TEST: "calibration-testing/",
    UPDATE_CALIBRATION_TEST: (id: string) => `calibration-testing/${id}/`,
    DELETE_CALIBRATION_TEST: (id: string) => `calibration-testing/${id}/`,
    ALL_CALIBRATION_TESTS: "calibration-testing/",
    CALIBRATION_TEST_BY_ID: (id: string) => `calibration-testing/${id}/`,
    SEARCH_CALIBRATION_TESTS: "calibration-testing/search/",

    // Test Methods
    ADD_TEST_METHOD: "test-methods/",
    UPDATE_TEST_METHOD: (id: string) => `test-methods/${id}/`,
    DELETE_TEST_METHOD: (id: string) => `test-methods/${id}/`,
    ALL_TEST_METHODS: "test-methods/",
    TEST_METHOD_BY_ID: (id: string) => `test-methods/${id}/`,
    SEARCH_TEST_METHODS: "test-methods/search/",

    // Sample Information
    ADD_SAMPLE_INFORMATION: "sample-information/",
    UPDATE_SAMPLE_INFORMATION: (id: string) => `sample-information/${id}/`,
    DELETE_SAMPLE_INFORMATION: (id: string) => `sample-information/${id}/`,
    ALL_SAMPLE_INFORMATION: "sample-information/",
    SAMPLE_INFORMATION_BY_ID: (id: string) => `sample-information/${id}/`,
    SAMPLE_INFORMATION_COMPLETE_INFO: (id: string) => `sample-information/${id}/complete-info`,
    SEARCH_SAMPLE_INFORMATION: "sample-information/search/",

    // Sample Details
    ADD_SAMPLE_DETAIL: "sample-details/",
    UPDATE_SAMPLE_DETAIL: (id: string) => `sample-details/${id}/`,
    DELETE_SAMPLE_DETAIL: (id: string) => `sample-details/${id}/`,
    ALL_SAMPLE_DETAILS: "sample-details/",
    SAMPLE_DETAIL_BY_ID: (id: string) => `sample-details/${id}/`,
    SEARCH_SAMPLE_DETAILS: "sample-details/search/",

    // Sample Preparation (Complete Requests)
    ADD_SAMPLE_PREPARATION: "sample-preparations/",
    UPDATE_SAMPLE_PREPARATION: (id: string) => `sample-preparations/${id}/`,
    DELETE_SAMPLE_PREPARATION: (id: string) => `sample-preparations/${id}/`,
    ALL_SAMPLE_PREPARATIONS: "sample-preparations/",
    SAMPLE_PREPARATION_BY_ID: (id: string) => `sample-preparations/${id}/`,
    SEARCH_SAMPLE_PREPARATIONS: "sample-preparations/search/",

    // Specimens
    ADD_SPECIMEN: "specimens/",
    UPDATE_SPECIMEN: (id: string) => `specimens/${id}/`,
    DELETE_SPECIMEN: (id: string) => `specimens/${id}/`,
    SPECIMEN_BY_ID: (id: string) => `specimens/${id}/`,

    // Complete Certificates
    ADD_COMPLETE_CERTIFICATE: "complete-certificates/",
    UPDATE_COMPLETE_CERTIFICATE: (id: string) => `complete-certificates/${id}/`,
    DELETE_COMPLETE_CERTIFICATE: (id: string) => `complete-certificates/${id}/`,
    ALL_COMPLETE_CERTIFICATES: "complete-certificates/",
    COMPLETE_CERTIFICATE_BY_ID: (id: string) => `complete-certificates/${id}/`,
    SEARCH_COMPLETE_CERTIFICATES: "complete-certificates/search/",

    // Sample Lots
    ADD_SAMPLE_LOT: "sample-lots/",
    UPDATE_SAMPLE_LOT: (id: string) => `sample-lots/${id}/`,
    DELETE_SAMPLE_LOT: (id: string) => `sample-lots/${id}/`,
    ALL_SAMPLE_LOTS: "sample-lots/",
    SAMPLE_LOT_BY_ID: (id: string) => `sample-lots/${id}/`,
    SEARCH_SAMPLE_LOTS: "sample-lots/search/",
  }
}