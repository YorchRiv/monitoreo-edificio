export interface MedicionElectrica {
  id_medicion: string;
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

export interface Statistics {
  total_registros: number;
  voltaje: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
  corriente: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
  potencia: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
}

export interface EdificioData {
  edificio: string;
  total_registros: number;
  consumo_total: number;
  potencia_promedio: number;
}

export interface ZonaData {
  zona: string;
  total_registros: number;
  consumo_total: number;
  potencia_promedio: number;
}

export interface TimeSeriesData {
  fecha: string;
  voltaje: number;
  corriente: number;
  potencia: number;
  energia: number;
  edificio: string;
  zona: string;
}