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
        LAB_EQUIPMENTS: "/lab-equipments",
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
    },
    PUBLIC: {
        PQR_PREVIEW: (id: string) => `/public/pqr/preview/${id}`,
    }
}
