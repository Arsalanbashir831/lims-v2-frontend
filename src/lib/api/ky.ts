import ky, { HTTPError, Options } from "ky"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../auth/storage"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

async function refreshToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error("No refresh token")
  const res = await ky.post(`${API_BASE_URL}/auth/token/refresh/`, {
    json: { refresh },
    timeout: 15000,
  }).json<{ access: string }>()
  setTokens(res.access, refresh)
  return res.access
}

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15000,
  retry: { limit: 1 },
  // header-based bearer auth (no cookies)
  hooks: {
    beforeRequest: [
      async (request) => {
        const accessToken = getAccessToken()
        if (accessToken) request.headers.set("Authorization", `Bearer ${accessToken}`)
        request.headers.set("Accept", "application/json")
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401) return
        // Try refresh once
        try {
          const newAccess = await refreshToken()
          // retry original request with new access token
          const retryHeaders = new Headers(request.headers)
          retryHeaders.set("Authorization", `Bearer ${newAccess}`)
          return api(request, { headers: retryHeaders })
        } catch {
          clearTokens()
        }
      },
    ],
  },
})

export type Api = typeof api


