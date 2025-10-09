// Cookie utility functions for authentication
export const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document !== "undefined") {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

export const removeCookie = (name: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const getCookie = (name: string): string | null => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(cookie => cookie.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
  }
  return null;
};

// Auth-specific cookie helpers
export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  setCookie("accessToken", accessToken);
  setCookie("refreshToken", refreshToken);
};

export const clearAuthCookies = () => {
  removeCookie("accessToken");
  removeCookie("refreshToken");
};

export const getAuthTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  return {
    accessToken: getCookie("accessToken"),
    refreshToken: getCookie("refreshToken"),
  };
};
