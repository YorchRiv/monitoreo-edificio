import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParquetFilterRequest {
  limit: number;
  edificio?: string;
  zona?: string;
  nivel?: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface MedicionData {
  id_medicion: number;
  voltaje: number;
  corriente: number;
  potencia_calc: number;
  energia_acumulada_calc: number;
  factor_potencia: number;
  frecuencia: number;
  sensor_modelo: string;
  sensor_tipo_medicion: string;
  sensor_estado: boolean;
  circuito_capacidad_nominal: string;
  circuito_descripcion: string;
  circuito_tipo: string;
  zona_nombre: string;
  zona_descripcion: string;
  nivel_nombre: string;
  nivel_descripcion: string;
  edificio_nombre: string;
  edificio_descripcion: string;
  dia: number;
  mes: number;
  anio: number;
  fecha_creacion: string;
}

export interface ParquetApiResponse {
  success: boolean;
  message: string;
  totalRegistros: number;
  registrosMostrados: number;
  filtros: ParquetFilterRequest;
  data: MedicionData[];
}

@Injectable({
  providedIn: 'root'
})
export class ParquetDataService {
  private readonly apiUrl = 'http://localhost:3000/api/parquet/local-filter';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos filtrados de la API de parquet
   * @param filter Objeto con los filtros a aplicar
   * @returns Observable con la respuesta de la API
   */
  getFilteredData(filter: ParquetFilterRequest): Observable<ParquetApiResponse> {
    return this.http.post<ParquetApiResponse>(this.apiUrl, filter);
  }

  /**
   * Genera filtro para obtener datos del día actual
   * @returns Objeto con filtros para el día actual
   */
  getDayFilter(): ParquetFilterRequest {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const fechaInicio = `${year}-${month}-${day} 00:00:00`;
    const fechaFin = `${year}-${month}-${day} 23:59:59`;

    return {
      limit: 5000,
      fechaInicio,
      fechaFin
    };
  }

  /**
   * Genera filtro para obtener datos del mes actual
   * @returns Objeto con filtros para el mes actual
   */
  getMonthFilter(): ParquetFilterRequest {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    const fechaInicio = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const fechaFin = `${year}-${month.toString().padStart(2, '0')}-${lastDay} 23:59:59`;

    return {
      limit: 5000,
      fechaInicio,
      fechaFin
    };
  }

  /**
   * Genera filtro para obtener datos del año actual
   * @returns Objeto con filtros para el año actual
   */
  getYearFilter(): ParquetFilterRequest {
    const today = new Date();
    const year = today.getFullYear();
    
    const fechaInicio = `${year}-01-01`;
    const fechaFin = `${year}-12-31 23:59:59`;

    return {
      limit: 5000,
      fechaInicio,
      fechaFin
    };
  }

  /**
   * Genera filtro para obtener datos del día anterior
   * @returns Objeto con filtros para el día anterior
   */
  getPreviousDayFilter(): ParquetFilterRequest {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fechaInicio = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    const fechaFin = `${fechaInicio} 23:59:59`;

    return {
      limit: 5000,
      fechaInicio,
      fechaFin
    };
  }

  /**
   * Genera filtro para obtener datos del mes anterior
   * @returns Objeto con filtros para el mes anterior
   */
  getPreviousMonthFilter(): ParquetFilterRequest {
    const today = new Date();
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = previousMonth.getFullYear();
    const month = previousMonth.getMonth() + 1;
    
    const fechaInicio = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const fechaFin = `${year}-${month.toString().padStart(2, '0')}-${lastDay} 23:59:59`;

    return {
      limit: 5000,
      fechaInicio,
      fechaFin
    };
  }

  /**
   * Genera filtro para obtener datos del año anterior
   * @returns Objeto con filtros para el año anterior
   */
  getPreviousYearFilter(): ParquetFilterRequest {
    const today = new Date();
    const year = today.getFullYear() - 1;
    
    const fechaInicio = `${year}-01-01`;
    const fechaFin = `${year}-12-31 23:59:59`;

    return {
      limit: 5000,
      fechaInicio,
      fechaFin
    };
  }
}