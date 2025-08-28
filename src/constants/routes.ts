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
        CALIBRATION_TESTING: "/calibration-testing",
        SAMPLE_RECEIVING: "/sample-receiving",
        SAMPLE_PREPARATION: "/sample-preparation",
        TEST_REPORTS: "/test-reports",
        MATERIAL_DISCARDS: "/material-discards",
        TRACKING_DATABASE: "/tracking-database",
        PQR: {
            ROOT: "/pqr",
            NEW: "/pqr/new",
            EDIT: (id: string) => `/pqr/${id}/edit`,
        }
    },
}
