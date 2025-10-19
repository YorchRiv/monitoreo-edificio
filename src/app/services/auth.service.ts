import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // URL actualizada con el prefijo api
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = 'Error: ' + error.error.message;
    } else {
      if (error.status === 401) {
        errorMessage = error.error?.message || 'Credenciales inválidas';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'El correo ya está registrado';
      } else if (error.status === 404) {
        errorMessage = 'El servicio no está disponible';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor. Por favor, verifica tu conexión.';
      }
    }
    return throwError(() => errorMessage);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }

  register(nombre: string, apellido: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { nombre, apellido, email, password })
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}