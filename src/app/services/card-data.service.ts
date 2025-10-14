import { Injectable } from '@angular/core';
import { MedicionData } from './parquet-data.service';

export interface CardData {
  voltaje: {
    actual: number;
    cambio: number;
    esPositivo: boolean;
  };
  amperaje: {
    actual: number;
    cambio: number;
    esPositivo: boolean;
  };
  consumoKWH: {
    actual: number;
    cambio: number;
    esPositivo: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CardDataService {

  constructor() { }

  /**
   * Procesa los datos de la API para las cards del dashboard
   * @param currentData Datos del período actual
   * @param previousData Datos del período anterior para comparación
   * @returns Datos procesados para las cards
   */
  processCardData(currentData: MedicionData[], previousData: MedicionData[]): CardData {
    // Procesar datos actuales
    const currentStats = this.calculateStats(currentData);
    
    // Procesar datos anteriores
    const previousStats = this.calculateStats(previousData);

    // Calcular cambios porcentuales
    const voltajeCambio = this.calculatePercentageChange(previousStats.voltajePromedio, currentStats.voltajePromedio);
    const amperajeCambio = this.calculatePercentageChange(previousStats.amperajeTotal, currentStats.amperajeTotal);
    const consumoCambio = this.calculatePercentageChange(previousStats.consumoTotal, currentStats.consumoTotal);

    return {
      voltaje: {
        actual: currentStats.voltajePromedio,
        cambio: Math.abs(voltajeCambio),
        esPositivo: voltajeCambio >= 0
      },
      amperaje: {
        actual: currentStats.amperajeTotal,
        cambio: Math.abs(amperajeCambio),
        esPositivo: amperajeCambio >= 0
      },
      consumoKWH: {
        actual: currentStats.consumoTotal,
        cambio: Math.abs(consumoCambio),
        esPositivo: consumoCambio >= 0
      }
    };
  }

  /**
   * Calcula estadísticas básicas de un conjunto de datos
   */
  private calculateStats(data: MedicionData[]): {
    voltajePromedio: number;
    amperajeTotal: number;
    consumoTotal: number;
  } {
    if (!data || data.length === 0) {
      return {
        voltajePromedio: 0,
        amperajeTotal: 0,
        consumoTotal: 0
      };
    }

    const voltajePromedio = data.reduce((sum, item) => sum + item.voltaje, 0) / data.length;
    const amperajeTotal = data.reduce((sum, item) => sum + item.corriente, 0); // Suma total de corriente
    const consumoTotal = data.reduce((sum, item) => sum + item.potencia_calc, 0);

    return {
      voltajePromedio: Math.round(voltajePromedio * 100) / 100,
      amperajeTotal: Math.round(amperajeTotal * 100) / 100,
      consumoTotal: Math.round(consumoTotal * 100) / 100
    };
  }

  /**
   * Calcula el cambio porcentual entre dos valores
   */
  private calculatePercentageChange(valorAnterior: number, valorActual: number): number {
    if (valorAnterior === 0) {
      return valorActual > 0 ? 100 : 0;
    }
    
    const cambio = ((valorActual - valorAnterior) / valorAnterior) * 100;
    return Math.round(cambio * 100) / 100;
  }

  /**
   * Obtiene datos vacíos cuando no hay información disponible
   */
  getEmptyCardData(): CardData {
    return {
      voltaje: {
        actual: 0,
        cambio: 0,
        esPositivo: true
      },
      amperaje: {
        actual: 0,
        cambio: 0,
        esPositivo: true
      },
      consumoKWH: {
        actual: 0,
        cambio: 0,
        esPositivo: true
      }
    };
  }
}