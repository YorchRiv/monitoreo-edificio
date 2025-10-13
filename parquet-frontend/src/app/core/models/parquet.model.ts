export interface Medicion {
  id_medicion: number;
  voltaje: number;
  corriente: number;
  potencia_calc: number;
  energia_acumulada_calc: number;
  factor_potencia: number;
  frecuencia: number;
  sensor_modelo: string;
  sensor_tipo_medicion: string;
  sensor_estado: string;
  circuito_capacidad_nominal: number;
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

export interface ParquetDataResponse {
  total_registros: number;
  datos: Medicion[];
  data: Medicion[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ParquetStats {
  totalRegistros: number;
  promedioVoltaje: number;
  promedioCorriente: number;
  promedioPotencia: number;
  energiaTotal: number;
  edificios: string[];
  zonas: string[];
  sensores: string[];
}

export interface ParquetQuery {
  limit?: number;
  offset?: number;
  edificio?: string;
  zona?: string;
  filePath?: string;
}

// 🔥 AGREGAR ESTA INTERFAZ PARA LA RESPUESTA DE UPLOAD
// En parquet.model.ts - CORREGIR LA INTERFAZ
export interface UploadResponse {
  message: string;        // 🔥 Cambiar de 'mensaje' a 'message'
  ruta_archivo: string;
  total_registros: number;
  // Estas propiedades probablemente no vienen en la respuesta real
  // registros_procesados?: number;
  // estado?: string;
}