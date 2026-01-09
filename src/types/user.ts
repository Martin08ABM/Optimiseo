/**
 * Tipos relacionados con usuarios
 */

export type UserRole = 'basic' | 'premium' | 'admin';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

export interface UserMetadata {
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}
