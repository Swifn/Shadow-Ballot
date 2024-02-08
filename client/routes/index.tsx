export const Routes = {
  ADMIN: () => `admin`,
  AUTH: () => `/auth`,
  AUTH_SIGN_UP: () => `${Routes.AUTH()}/sign-up`,
  AUTH_SIGN_IN: () => `${Routes.AUTH()}/sign-in`,
  NOT_FOUND: () => `/404`,
  VOTER: () => `/voter`,
  ELECTION: () => `/election`,
  VOTE: () => `/vote`,
  PRIVACY_POLICY: () => `/privacy-policy`,
  SOCIETY: () => `/society`,
  LANDING: () => `/landing`,
};
