/** Shaped user returned by Praxis `/users/current-user` and login. */
export type PraxisUser = {
  _id: string;
  username: string;
  email: string;
  role?: string;
  loginType?: string;
  isEmailVerified?: boolean;
  avatar?: {
    url?: string;
    localPath?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type ApiEnvelope<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};
