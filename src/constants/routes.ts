export const ROUTES = {
    AUTH: {
        LOGIN: "/login",
        REGISTER: "/register",
        FORGOT_PASSWORD: "/forgot-password",
    },
    APP: {
        DASHBOARD: "/lab/dashboard",
        TEST_METHODS: {
            ROOT: "/lab/test-methods",
            NEW: "/lab/test-methods/new",
            EDIT: (id: string) => `/lab/test-methods/${id}/edit`,
        },
        LAB_EQUIPMENTS: {
            ROOT: "/lab/lab-equipments",
            NEW: "/lab/lab-equipments/new",
            EDIT: (id: string) => `/lab/lab-equipments/${id}/edit`,
        },
        PROFICIENCY_TESTING: {
            ROOT: "/lab/proficiency-testing",
            NEW: "/lab/proficiency-testing/new",
            EDIT: (id: string) => `/lab/proficiency-testing/${id}/edit`,
        },
        CALIBRATION_TESTING: {
            ROOT: "/lab/calibration-testing",
            NEW: "/lab/calibration-testing/new",
            EDIT: (id: string) => `/lab/calibration-testing/${id}/edit`,
        },
        SAMPLE_RECEIVING: {
            ROOT: "/lab/sample-receiving",
            NEW: "/lab/sample-receiving/new",
            EDIT: (id: string) => `/lab/sample-receiving/${id}/edit`,
        },
        SAMPLE_INFORMATION: {
            ROOT: "/lab/sample-information",
            NEW: "/lab/sample-information/new",
            EDIT: (id: string) => `/lab/sample-information/${id}/edit`,
        },
        SAMPLE_DETAILS: {
            NEW: "/lab/sample-details/new",
            EDIT: (id: string) => `/lab/sample-details/${id}/edit`,
        },
        SAMPLE_LOTS: {
            EDIT_FOR_JOB: (jobId: string) => `/lab/sample-lots/${jobId}/edit`,
        },
        SAMPLE_PREPARATION: {
            ROOT: "/lab/sample-preparation",
            NEW: "/lab/sample-preparation/new",
            EDIT: (id: string) => `/lab/sample-preparation/${id}/edit`,
        },
        TEST_REPORTS: {
            ROOT: "/lab/test-reports",
            NEW: "/lab/test-reports/new",
            EDIT: (id: string) => `/lab/test-reports/${id}/edit`,
            VIEW: (id: string) => `/lab/test-reports/${id}/view`,
        },
        MATERIAL_DISCARDS: {
            ROOT: "/lab/discarded-materials",
            NEW: "/lab/discarded-materials/new",
            EDIT: (id: string) => `/lab/discarded-materials/${id}/edit`,
        },
        TRACKING_DATABASE: "/lab/tracking-database",
        CLIENTS: {
            ROOT: "/lab/clients",
            NEW: "/lab/clients/new",
            EDIT: (id: string) => `/lab/clients/${id}/edit`,
        },
        WELDERS: {
            DASHBOARD: "/welders/dashboard",
            WELDERS: "/welders/welders",
            WELDER_NEW: "/welders/welders/new",
            WELDER_EDIT: (id: string) => `/welders/welders/${id}/edit`,
            PQR: {
                ROOT: "/welders/pqr",
                NEW: "/welders/pqr/new",
                EDIT: (id: string) => `/welders/pqr/${id}/edit`,
                VIEW: (id: string) => `/welders/pqr/${id}/view`,
            },
            WELDER_QUALIFICATION: {
                ROOT: "/welders/welder-qualification",
                NEW: "/welders/welder-qualification/new",
                EDIT: (id: string) => `/welders/welder-qualification/${id}/edit`,
                VIEW: (id: string) => `/welders/welder-qualification/${id}/view`,
            },
            OPERATOR_PERFORMANCE: {
                ROOT: "/welders/operator-performance",
                NEW: "/welders/operator-performance/new",
                EDIT: (id: string) => `/welders/operator-performance/${id}/edit`,
                VIEW: (id: string) => `/welders/operator-performance/${id}/view`,
            },
            WELDER_CARDS: {
                ROOT: "/welders/welder-cards",
                NEW: "/welders/welder-cards/new",
                EDIT: (id: string) => `/welders/welder-cards/${id}/edit`,
                VIEW: (id: string) => `/welders/welder-cards/${id}/view`,
            },
            TESTING_REPORTS: {
                ROOT: "/welders/testing-reports",
                NEW: "/welders/testing-reports/new",
                EDIT: (id: string) => `/welders/testing-reports/${id}/edit`,
            },
        },
    },
    PUBLIC: {
        PQR_PREVIEW: (id: string) => `/public/pqr/preview/${id}`,
        TEST_REPORT_PREVIEW: (id: string) => `/public/test-report/preview/${id}`,
        WELDER_QUALIFICATION_PREVIEW: (id: string) => `/public/welder-qualification/preview/${id}`,
        WELDER_OPERATOR_PERFORMANCE_PREVIEW: (id: string) => `/public/welder-operator-performance/preview/${id}`,
        WELDER_CARDS_PREVIEW: (id: string) => `/public/welder-cards/preview/${id}`,
        WELDER_PREVIEW: (id: string) => `/public/welder/preview/${id}`,
    }
}
