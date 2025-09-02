export const ROUTES = {
    AUTH: {
        LOGIN: "/login",
        FORGOT_PASSWORD: "/forgot-password",
    },
    APP: {
        DASHBOARD: "/dashboard",
        TEST_METHODS: {
            ROOT: "/test-methods",
            NEW: "/test-methods/new",
            EDIT: (id: string) => `/test-methods/${id}/edit`,
        },
        LAB_EQUIPMENTS: {
            ROOT: "/lab-equipments",
            NEW: "/lab-equipments/new",
            EDIT: (id: string) => `/lab-equipments/${id}/edit`,
        },
        PROFICIENCY_TESTING: {
            ROOT: "/proficiency-testing",
            NEW: "/proficiency-testing/new",
            EDIT: (id: string) => `/proficiency-testing/${id}/edit`,
        },
        CALIBRATION_TESTING: {
            ROOT: "/calibration-testing",
            NEW: "/calibration-testing/new",
            EDIT: (id: string) => `/calibration-testing/${id}/edit`,
        },
        SAMPLE_RECEIVING: {
            ROOT: "/sample-receiving",
            NEW: "/sample-receiving/new",
            EDIT: (id: string) => `/sample-receiving/${id}/edit`,
        },
        SAMPLE_PREPARATION: {
            ROOT: "/sample-preparation",
            NEW: "/sample-preparation/new",
            EDIT: (id: string) => `/sample-preparation/${id}/edit`,
        },
        TEST_REPORTS: {
            ROOT: "/test-reports",
            NEW: "/test-reports/new",
            EDIT: (id: string) => `/test-reports/${id}/edit`,
            VIEW: (id: string) => `/test-reports/${id}/view`,
        },
        MATERIAL_DISCARDS: {
            ROOT: "/discarded-materials",
            NEW: "/discarded-materials/new",
            EDIT: (id: string) => `/discarded-materials/${id}/edit`,
        },
        TRACKING_DATABASE: "/tracking-database",
        PQR: {
            ROOT: "/pqr",
            NEW: "/pqr/new",
            EDIT: (id: string) => `/pqr/${id}/edit`,
            VIEW: (id: string) => `/pqr/${id}/view`,
        },
        WELDERS: {
            DASHBOARD: "/welders/dashboard",
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
                VIEW: (id: string) => `/welders/testing-reports/${id}/view`,
            },
        },
    },
    PUBLIC: {
        PQR_PREVIEW: (id: string) => `/public/pqr/preview/${id}`,
        TEST_REPORT_PREVIEW: (id: string) => `/public/test-report/preview/${id}`,
        WELDER_QUALIFICATION_PREVIEW: (id: string) => `/public/welder-qualification/preview/${id}`,
        WELDER_TESTING_REPORT_PREVIEW: (id: string) => `/public/welder-testing-report/preview/${id}`,
        WELDER_OPERATOR_PERFORMANCE_PREVIEW: (id: string) => `/public/welder-operator-performance/preview/${id}`,
        WELDER_CARDS_PREVIEW: (id: string) => `/public/welder-cards/preview/${id}`,
    }
}
