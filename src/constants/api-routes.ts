export const API_ROUTES = {
  AUTH: {
    LOGIN: "auth/login/",
    LOGOUT: "auth/logout/",
    REFRESH: "auth/token/refresh/",
  },
  Lab_MANAGERS:{
    ADD_CLIENT: "core/clients/",
    UPDATE_CLIENT: (id: string) => `core/clients/${id}/`,
    DELETE_CLIENT: (id: string) => `core/clients/${id}/`,
    ALL_CLIENTS: "core/clients/",
    CLIENT_BY_ID: (id: string) => `core/clients/${id}/`,
    SEARCH_CLIENTS: "core/clients/search/",
    CLIENT_STATISTICS: 'core/clients/statistics/',
  }
}