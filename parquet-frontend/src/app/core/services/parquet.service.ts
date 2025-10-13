import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicion, ParquetDataResponse, ParquetStats, ParquetQuery } from '../models/parquet.model';

@Injectable({
  providedIn: 'root'
})
export class ParquetService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/parquet';

  // Obtener datos del Parquet (POST, body)
  getData(query: ParquetQuery): Observable<ParquetDataResponse> {
    return this.http.post<ParquetDataResponse>(`${this.API_URL}/read`, query);
  }

  // Obtener estadísticas
  getStats(filePath?: string): Observable<ParquetStats> {
    return this.http.post<ParquetStats>(`${this.API_URL}/statistics`, { filePath });
  }

  // Recargar datos desde archivo ya existente en backend
  reloadData(filePath?: string): Observable<{ message: string; registros: number }> {
    return this.http.post<{ message: string; registros: number }>(`${this.API_URL}/read`, { filePath });
  }

  // Subir archivo Parquet desde frontend
uploadFile(file: File): Observable<{ message: string; total_registros: number; ruta_archivo: string }> {
  const formData = new FormData();
  formData.append('file', file); // 👈 aquí se crea FormData
  return this.http.post<{ message: string; total_registros: number; ruta_archivo: string }>(
    `${this.API_URL}/upload`,
    formData
  );
}
}
