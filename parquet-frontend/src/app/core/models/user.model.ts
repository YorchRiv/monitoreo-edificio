export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}