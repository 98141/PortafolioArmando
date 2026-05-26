export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "admin";
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: AuthUser;
  };
  message?: string;
}

export interface MeResponse {
  status: string;
  data: {
    user: AuthUser;
  };
}

export interface ApiErrorResponse {
  status: string;
  message: string;
}
