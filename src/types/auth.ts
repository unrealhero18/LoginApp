export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthToken = {
  accessToken: string;
  refreshToken: string;
  id: number;
  expiresInMins?: number;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};
