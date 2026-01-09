/**
 * Tipos relacionados con autenticación
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  error?: string;
  userId?: string;
  success?: boolean;
}
