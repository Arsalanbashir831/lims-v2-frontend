const ACCESS_KEY = "lims:access"
const REFRESH_KEY = "lims:refresh"
const USER_KEY = "lims:user"

export function getAccessToken(): string | undefined {
  try { return localStorage.getItem(ACCESS_KEY) || undefined } catch { return undefined }
}

export function getRefreshToken(): string | undefined {
  try { return localStorage.getItem(REFRESH_KEY) || undefined } catch { return undefined }
}

export function setTokens(access?: string, refresh?: string) {
  try {
    if (access) localStorage.setItem(ACCESS_KEY, access); else localStorage.removeItem(ACCESS_KEY)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh); else localStorage.removeItem(REFRESH_KEY)
  } catch {}
}

export function clearTokens() {
  try { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY) } catch {}
}

export function setUser(user: any | undefined) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {}
}

export function getUser<T = any>(): T | undefined {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch { return undefined }
}


