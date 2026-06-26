// API Response Types
export interface SignupResponse {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}

// Form Types
export interface RegistrationFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}
