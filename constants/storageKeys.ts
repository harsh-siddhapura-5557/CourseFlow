/** SecureStore keys — keep in sync across auth, API interceptors, and services */
export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "auth_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER_DATA: "user_data",
} as const;

/** AsyncStorage keys for local LMS cache */
export const ASYNC_STORAGE_KEYS = {
  BOOKMARKS: "bookmarks",
  ENROLLED: "enrolled",
  MILESTONE_5_SENT: "milestone_5_sent",
} as const;
