import { Injectable } from '@angular/core';
import { MedicionData } from './parquet-data.service';

export interface TableRowData {
  edificio: string;
  zona: string;
  nivel: string;
  voltaje: number;  // Promedio
  corriente: number; // Suma
  potencia: number;  // Suma
  registros: number; // Cantidad de registros para esta agrupación
}

@Injectable({
  providedIn: 'root'
})
export class TableDataService {

  constructor() { }

  /**
   * Procesa los datos de la API para mostrarlos en la tabla
   * Agrupa por edificio, zona y nivel, calculando promedios y sumas según corresponda
   * @param data Array de datos de mediciones de la API
   * @returns Array de datos procesados para la tabla
   */
  processDataForTable(data: MedicionData[]): TableRowData[] {
    if (!data || data.length === 0) {
      return [];
    }

    // Crear un mapa para agrupar los datos por edificio-zona-nivel
    const groupedData = new Map<string, {
      edificio: string;
      zona: string;
      nivel: string;
      voltajes: number[];
      corrientes: number[];
      potencias: number[];
    }>();

    // Agrupar datos
    data.forEach(item => {
      const key = `${item.edificio_nombre}-${item.zona_nombre}-${item.nivel_nombre}`;
      
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          edificio: item.edificio_nombre,
          zona: item.zona_nombre,
          nivel: item.nivel_nombre,
          voltajes: [],
          corrientes: [],
          potencias: []
        });
      }

      const group = groupedData.get(key)!;
      group.voltajes.push(item.voltaje);
      group.corrientes.push(item.corriente);
      group.potencias.push(item.potencia_calc);
    });

    // Procesar los grupos y calcular los valores finales
    const tableData: TableRowData[] = [];
    
    groupedData.forEach((group) => {
      // Calcular promedio de voltaje
      const promedioVoltaje = group.voltajes.length > 0 
        ? group.voltajes.reduce((sum, val) => sum + val, 0) / group.voltajes.length
        : 0;

      // Calcular suma de corriente
      const sumaCorriente = group.corrientes.reduce((sum, val) => sum + val, 0);

      // Calcular suma de potencia
      const sumaPotencia = group.potencias.reduce((sum, val) => sum + val, 0);

      tableData.push({
        edificio: group.edificio,
        zona: group.zona,
        nivel: group.nivel,
        voltaje: Math.round(promedioVoltaje * 100) / 100, // Redondear a 2 decimales
        corriente: Math.round(sumaCorriente * 100) / 100,
        potencia: Math.round(sumaPotencia * 100) / 100,
        registros: group.voltajes.length
      });
    });

    // Ordenar por edificio, luego zona, luego nivel para mejor presentación
    return tableData.sort((a, b) => {
      if (a.edificio !== b.edificio) {
        return a.edificio.localeCompare(b.edificio);
      }
      if (a.zona !== b.zona) {
        return a.zona.localeCompare(b.zona);
      }
      return a.nivel.localeCompare(b.nivel);
    });
  }

  /**
   * Obtiene un resumen estadístico de los datos
   * @param data Array de datos procesados de la tabla
   * @returns Objeto con estadísticas generales
   */
  getTableSummary(data: TableRowData[]): {
    totalRegistros: number;
    promedioVoltaje: number;
    totalCorriente: number;
    totalPotencia: number;
    edificiosUnicos: number;
    zonasUnicas: number;
    nivelesUnicos: number;
  } {
    if (!data || data.length === 0) {
      return {
        totalRegistros: 0,
        promedioVoltaje: 0,
        totalCorriente: 0,
        totalPotencia: 0,
        edificiosUnicos: 0,
        zonasUnicas: 0,
        nivelesUnicos: 0
      };
    }

    const totalRegistros = data.reduce((sum, row) => sum + row.registros, 0);
    const promedioVoltaje = data.reduce((sum, row) => sum + row.voltaje, 0) / data.length;
    const totalCorriente = data.reduce((sum, row) => sum + row.corriente, 0);
    const totalPotencia = data.reduce((sum, row) => sum + row.potencia, 0);
    
    const edificiosUnicos = new Set(data.map(row => row.edificio)).size;
    const zonasUnicas = new Set(data.map(row => row.zona)).size;
    const nivelesUnicos = new Set(data.map(row => row.nivel)).size;

    return {
      totalRegistros,
      promedioVoltaje: Math.round(promedioVoltaje * 100) / 100,
      totalCorriente: Math.round(totalCorriente * 100) / 100,
      totalPotencia: Math.round(totalPotencia * 100) / 100,
      edificiosUnicos,
      zonasUnicas,
      nivelesUnicos
    };
  }
}