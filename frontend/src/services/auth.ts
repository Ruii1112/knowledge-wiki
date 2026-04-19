import { RegistrationFormData, SignupResponse, ErrorResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const authService = {
  async signup(data: RegistrationFormData): Promise<SignupResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'ユーザー登録に失敗しました';
      
      try {
        const errorData = (await response.json()) as ErrorResponse;
        errorMessage = errorData.message || errorMessage;
      } catch {
        // JSON parse error, use default message
      }

      const error = new Error(errorMessage);
      error.name = `HTTP_${response.status}`;
      throw error;
    }

    return (await response.json()) as SignupResponse;
  },
};
