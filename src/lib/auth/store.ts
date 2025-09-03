import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type UserRole = "supervisor" | "inspector" | "welder" | "lab_manager" | string

export interface AuthUser {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  role: UserRole
  email_verified?: boolean
}

type AuthState = {
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
  hydrated: boolean
  setTokens: (tokens: { accessToken?: string; refreshToken?: string }) => void
  setUser: (user?: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      user: undefined,
      hydrated: true,
      setTokens: (tokens) => set((s) => ({ ...s, ...tokens })),
      setUser: (user) => set((s) => ({ ...s, user })),
      logout: () => set({ accessToken: undefined, refreshToken: undefined, user: undefined }),
    }),
    {
      name: "lims-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        // mark store as hydrated after rehydration completes
        useAuthStore.setState({ hydrated: true })
      },
    }
  )
)

// helper for non-hook access (ky, etc.)
export const createAuthStore = { getState: useAuthStore.getState, setState: useAuthStore.setState }


