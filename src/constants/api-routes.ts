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
    ADD_EQUIPMENT: "equipment/",
    UPDATE_EQUIPMENT: (id: string) => `equipment/${id}/`,
    DELETE_EQUIPMENT: (id: string) => `equipment/${id}/`,
    ALL_EQUIPMENTS: "equipment/",
    EQUIPMENT_BY_ID: (id: string) => `equipment/${id}/`,
    SEARCH_EQUIPMENTS: "equipment/search/",

    // Proficiency Tests
    ADD_PROF_TEST: "proficiency-tests/",
    UPDATE_PROF_TEST: (id: string) => `proficiency-tests/${id}/`,
    DELETE_PROF_TEST: (id: string) => `proficiency-tests/${id}/`,
    ALL_PROF_TESTS: "proficiency-tests/",
    PROF_TEST_BY_ID: (id: string) => `proficiency-tests/${id}/`,
    SEARCH_PROF_TESTS: "proficiency-tests/search/",
    
    // Calibration Tests
    ADD_CALIBRATION_TEST: "calibration-tests/",
    UPDATE_CALIBRATION_TEST: (id: string) => `calibration-tests/${id}/`,
    DELETE_CALIBRATION_TEST: (id: string) => `calibration-tests/${id}/`,
    ALL_CALIBRATION_TESTS: "calibration-tests/",
    CALIBRATION_TEST_BY_ID: (id: string) => `calibration-tests/${id}/`,
    SEARCH_CALIBRATION_TESTS: "calibration-tests/search/",

    // Test Methods
    ADD_TEST_METHOD: "test-methods/",
    UPDATE_TEST_METHOD: (id: string) => `test-methods/${id}/`,
    DELETE_TEST_METHOD: (id: string) => `test-methods/${id}/`,
    ALL_TEST_METHODS: "test-methods/",
    TEST_METHOD_BY_ID: (id: string) => `test-methods/${id}/`,
    SEARCH_TEST_METHODS: "test-methods/search/",

    // Sample Information
    ADD_SAMPLE_INFORMATION: "jobs/",
    UPDATE_SAMPLE_INFORMATION: (id: string) => `jobs/${id}/`,
    DELETE_SAMPLE_INFORMATION: (id: string) => `jobs/${id}/`,
    ALL_SAMPLE_INFORMATION: "jobs/",
    SAMPLE_INFORMATION_BY_ID: (id: string) => `jobs/${id}/`,
    SAMPLE_INFORMATION_COMPLETE_INFO: (id: string) => `jobs/${id}/complete-info`,
    SEARCH_SAMPLE_INFORMATION: "jobs/search/",
    JOBS_WITH_CERTIFICATES: "jobs/with-certificates",

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
    GET_SAMPLE_PREPARATIONS_BY_JOB_ID: (id: string) => `sample-preparations/job/${id}/`,

    // Specimens
    ADD_SPECIMEN: "specimens/",
    UPDATE_SPECIMEN: (id: string) => `specimens/${id}/`,
    DELETE_SPECIMEN: (id: string) => `specimens/${id}/`,
    SPECIMEN_BY_ID: (id: string) => `specimens/${id}/`,

    // Certificates
    ADD_CERTIFICATE: "certificates/",
    UPDATE_CERTIFICATE: (id: string) => `certificates/${id}/`,
    DELETE_CERTIFICATE: (id: string) => `certificates/${id}/`,
    ALL_CERTIFICATES: "certificates/",
    CERTIFICATE_BY_ID: (id: string) => `certificates/${id}/`,
    SEARCH_CERTIFICATES: "certificates/search/",
    GET_CERTIFICATES_BY_JOB_ID: (id: string) => `certificates/job/${id}/`,

    // Certificate Items
    ADD_CERTIFICATE_ITEM: "certificate-items/",
    UPDATE_CERTIFICATE_ITEM: (id: string) => `certificate-items/${id}/`,
    DELETE_CERTIFICATE_ITEM: (id: string) => `certificate-items/${id}/`,
    ALL_CERTIFICATE_ITEMS: "certificate-items/",
    CERTIFICATE_ITEM_BY_ID: (id: string) => `certificate-items/${id}/`,
    SEARCH_CERTIFICATE_ITEMS: "certificate-items/search/",
    GET_CERTIFICATE_ITEMS_BY_CERTIFICATE_ID: (id: string) => `certificate-items/certificate/${id}/`,
    UPLOAD_CERTIFICATE_ITEM_IMAGE: "certificate-items/upload-image/",

    // Sample Lots
    ADD_SAMPLE_LOT: "sample-lots/",
    UPDATE_SAMPLE_LOT: (id: string) => `sample-lots/${id}/`,
    DELETE_SAMPLE_LOT: (id: string) => `sample-lots/${id}/`,
    ALL_SAMPLE_LOTS: "sample-lots/",
    SAMPLE_LOT_BY_ID: (id: string) => `sample-lots/${id}/`,
    SEARCH_SAMPLE_LOTS: "sample-lots/search/",
    GET_SAMPLE_LOTS_BY_JOB_ID: (id: string) => `sample-lots/job/${id}/`,

    // Dashboard Stats
    CLIENTS_STATS: "clients/stats/",
    JOBS_STATS: "jobs/stats/",
    JOBS_STATS_CURRENT_MONTH: "jobs/stats/current-month/",
    SAMPLE_LOTS_STATS: "sample-lots/stats/",
    SAMPLE_LOTS_STATS_CURRENT_MONTH: "sample-lots/stats/current-month/",
    SAMPLE_PREPARATIONS_STATS: "sample-preparations/stats/",
    SPECIMENS_STATS: "specimens/stats/",
    TEST_METHODS_STATS: "test-methods/stats/",
    CERTIFICATES_STATS: "certificates/stats/",
    CERTIFICATE_ITEMS_STATS: "certificate-items/stats/",
    EQUIPMENT_STATS: "equipment/stats/",
    CALIBRATION_TESTS_STATS: "calibration-tests/stats/",
    PROFICIENCY_TESTS_STATS: "proficiency-tests/stats/",
  },
  WELDERS_API:{
    // Welders
    GET_ALL_WELDERS: "welders/",
    GET_WELDER_BY_ID: (id: string) => `welders/${id}/`,
    CREATE_WELDER: "welders/",
    UPDATE_WELDER: (id: string) => `welders/${id}/`,    
    DELETE_WELDER: (id: string) => `welders/${id}/`,
    SEARCH_WELDERS: "welders/search/",

    // Welder Cards
    GET_ALL_WELDER_CARDS: "welder-cards/",
    GET_WELDER_CARD_BY_ID: (id: string) => `welder-cards/${id}/`,
    CREATE_WELDER_CARD: "welder-cards/",
    UPDATE_WELDER_CARD: (id: string) => `welder-cards/${id}/`,
    DELETE_WELDER_CARD: (id: string) => `welder-cards/${id}/`,
    SEARCH_WELDER_CARDS: "welder-cards/search/",

    // Welder CERTIFICATES
    GET_ALL_WELDER_CERTIFICATES: "welder-certificates/",
    GET_WELDER_CERTIFICATE_BY_ID: (id: string) => `welder-certificates/${id}/`,
    CREATE_WELDER_CERTIFICATE: "welder-certificates/",
    UPDATE_WELDER_CERTIFICATE: (id: string) => `welder-certificates/${id}/`,
    DELETE_WELDER_CERTIFICATE: (id: string) => `welder-certificates/${id}/`,
    SEARCH_WELDER_CERTIFICATES: "welder-certificates/search/",

    // Welder OPERATOR PERFORMANCE
    GET_ALL_WELDER_OPERATOR_PERFORMANCE: "welder-performance-records/",
    GET_WELDER_OPERATOR_PERFORMANCE_BY_ID: (id: string) => `welder-performance-records/${id}/`,
    CREATE_WELDER_OPERATOR_PERFORMANCE: "welder-performance-records/",
    UPDATE_WELDER_OPERATOR_PERFORMANCE: (id: string) => `welder-performance-records/${id}/`,
    DELETE_WELDER_OPERATOR_PERFORMANCE: (id: string) => `welder-performance-records/${id}/`,
    SEARCH_WELDER_OPERATOR_PERFORMANCE: "welder-performance-records/search/",

    // Testing Reports
    GET_ALL_WELDER_TESTING_REPORTS: "testing-reports/",
    GET_WELDER_TESTING_REPORT_BY_ID: (id: string) => `testing-reports/${id}/`,
    CREATE_WELDER_TESTING_REPORT: "testing-reports/",
    UPDATE_WELDER_TESTING_REPORT: (id: string) => `testing-reports/${id}/`,
    DELETE_WELDER_TESTING_REPORT: (id: string) => `testing-reports/${id}/`,
    SEARCH_WELDER_TESTING_REPORTS: "testing-reports/search/",

    // Welder PQR
    GET_ALL_WELDER_PQRS: "pqrs/",
    GET_WELDER_PQRS_BY_ID: (id: string) => `pqrs/${id}/`,
    CREATE_WELDER_PQRS: "pqrs/",
    UPDATE_WELDER_PQRS: (id: string) => `pqrs/${id}/`,
    DELETE_WELDER_PQRS: (id: string) => `pqrs/${id}/`,
    SEARCH_WELDER_PQRS: "pqrs/search/",

    // Dashboard Stats
    WELDERS_STATS: "welders/stats/",
  }
}
