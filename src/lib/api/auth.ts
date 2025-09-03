import { z } from "zod"
import { api } from "./ky"
import { setTokens, setUser, getRefreshToken, clearTokens } from "../auth/storage"

const LoginResponse = z.object({
  refresh: z.string(),
  access: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    username: z.string(),
    first_name: z.string().optional().nullable().transform((v) => v ?? ""),
    last_name: z.string().optional().nullable().transform((v) => v ?? ""),
    role: z.string(),
    email_verified: z.boolean().optional().default(false),
  }),
})

export type LoginResponseT = z.infer<typeof LoginResponse>

export async function login(payload: { email: string; password: string }) {
  const json = await api.post("auth/login/", { json: payload }).json()
  const parsed = LoginResponse.parse(json)
  // set tokens and user
  setTokens(parsed.access, parsed.refresh)
  setUser({
    id: parsed.user.id,
    email: parsed.user.email,
    username: parsed.user.username,
    first_name: parsed.user.first_name,
    last_name: parsed.user.last_name,
    role: (parsed.user.role as any) ?? "supervisor",
    email_verified: parsed.user.email_verified,
  })
  return parsed
}

export async function logout() {
  const refresh = getRefreshToken()
  try {
    if (refresh) {
      await api.post("auth/logout/", { json: { refresh_token: refresh } })
    }
  } catch (e) {
    // ignore network/API errors on logout
  } finally {
    clearTokens(); setUser(undefined as any)
  }
}

export async function refreshAccess() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error("No refresh token")
  const res = await api.post("auth/token/refresh/", { json: { refresh } }).json<{ access: string }>()
  setTokens(res.access, refresh)
  return res.access
}


