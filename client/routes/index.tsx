export const Routes = {
  ADMIN: () => `admin`,
  AUTH: () => `/auth`,
  AUTH_SIGN_UP: () => `${Routes.AUTH()}/sign-up`,
  AUTH_SIGN_IN: () => `${Routes.AUTH()}/sign-in`,
  NOT_FOUND: () => `/404`,
  VOTER: (uid?: string) => `/voter/${uid ?? ":uid"}`,
  ELECTION: (vid?: string) => `election/${vid ?? ":vid"}`,
  PRIVACY_POLICY: () => `/privacy-policy`,
  SOCIETY: () => `/society`,
};
