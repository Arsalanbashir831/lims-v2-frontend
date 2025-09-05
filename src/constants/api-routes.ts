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

  },
  EQUIPMENTS: {
    ADD: "equipments/",
    LIST: "equipments/",
    BY_ID: (id: string) => `equipments/${id}/`,
    UPDATE: (id: string) => `equipments/${id}/`,
    DELETE: (id: string) => `equipments/${id}/`,
  }
}