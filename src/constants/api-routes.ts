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
    
  }
}