export class MedicionDto {
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

export class ParquetDataResponseDto {
  data: MedicionDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export class ParquetStatsDto {
  totalRegistros: number;
  promedioVoltaje: number;
  promedioCorriente: number;
  promedioPotencia: number;
  energiaTotal: number;
  edificios: string[];
  zonas: string[];
  sensores: string[];
}

export class ParquetQueryDto {
  limit?: number = 1000;
  offset?: number = 0;
  edificio?: string;
  zona?: string;
  filePath?: string;
}
