import { Injectable } from '@angular/core';
import { MedicionData } from './parquet-data.service';

export interface ProcessedChartData {
  labels: string[];
  currentData: number[];
  projectionData: number[];
  bepData: number[];
  totalConsumption: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataProcessingService {

  constructor() { }

  /**
   * Procesa los datos de la API para mostrarlos en el gráfico según el período seleccionado
   * @param data Array de datos de mediciones de la API
   * @param period Período seleccionado ('Day', 'Month', 'Year')
   * @returns Datos procesados listos para el gráfico
   */
  processDataForChart(data: MedicionData[], period: string): ProcessedChartData {
    if (!data || data.length === 0) {
      return this.getEmptyChartData(period);
    }

    switch (period) {
      case 'Day':
        return this.processDayData(data);
      case 'Month':
        return this.processMonthData(data);
      case 'Year':
        return this.processYearData(data);
      default:
        return this.processMonthData(data);
    }
  }

  /**
   * Procesa datos para vista diaria (agrupados por hora)
   */
  private processDayData(data: MedicionData[]): ProcessedChartData {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Crear array de 24 horas inicializado en 0
    const hourlyData = new Array(24).fill(0);

    // Filtrar datos futuros primero
    const filteredData = data.filter(item => new Date(item.fecha_creacion) <= now);

    // Agrupar datos por hora
    filteredData.forEach(item => {
      const fecha = new Date(item.fecha_creacion);
      const hour = fecha.getHours();
      
      // Solo procesar datos hasta la hora actual
      if (hour <= currentHour) {
        hourlyData[hour] += item.energia_acumulada_calc;
      }
    });

    // Usar datos acumulados sin promediar
    const currentData = hourlyData.map((sum, index) => 
      index <= currentHour ? sum : 0
    );

    // Generar labels de horas
    const labels = Array.from({ length: 24 }, (_, i) => 
      `${i.toString().padStart(2, '0')}:00`
    );

    // Calcular proyección y BEP solo con datos hasta la hora actual
    const validData = currentData.slice(0, currentHour + 1);
    const projectionData = [...this.calculateProjection(validData, currentHour + 1), 
                          ...new Array(24 - (currentHour + 1)).fill(0)];
    const bepData = this.calculateBEP(validData);

    const totalConsumption = currentData.slice(0, currentHour + 1)
                                     .reduce((sum, val) => sum + val, 0);

    return {
      labels,
      currentData,
      projectionData,
      bepData,
      totalConsumption
    };
  }

  /**
   * Procesa datos para vista mensual (agrupados por día)
   */
  private processMonthData(data: MedicionData[]): ProcessedChartData {
    // Obtener el número de días del mes actual
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    // Crear array de días inicializado en 0
    const dailyData = new Array(daysInMonth).fill(0);
    const dailyCount = new Array(daysInMonth).fill(0);

    // Agrupar datos por día
    data.forEach(item => {
      const fecha = new Date(item.fecha_creacion);
      const day = fecha.getDate() - 1; // Array es 0-indexado
      
      // Solo procesar datos hasta el día actual
      if (day >= 0 && day < currentDay) {
        dailyData[day] += item.energia_acumulada_calc;
        dailyCount[day]++;
      }
    });

    // Usar la suma diaria en lugar del promedio
    const rawData = dailyData.map((sum, index) => 
      index < currentDay ? (dailyCount[index] > 0 ? sum : null) : 0
    );

    // Completar espacios vacíos con interpolación solo hasta el día actual
    const currentDataWithGaps = this.fillGapsWithInterpolation(rawData.slice(0, currentDay));
    const currentData = [...currentDataWithGaps, ...new Array(daysInMonth - currentDay).fill(0)];

    // Generar labels de días
    const month = today.getMonth() + 1;
    const labels = Array.from({ length: daysInMonth }, (_, i) => 
      `${(i + 1).toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`
    );

    // Calcular proyección y BEP
    const projectionData = this.calculateProjection(currentData, daysInMonth);
    const bepData = this.calculateBEP(currentData);

    const totalConsumption = currentData
      .reduce((sum: number, val: number) => sum + val, 0);

    return {
      labels,
      currentData,
      projectionData,
      bepData,
      totalConsumption
    };
  }

  /**
   * Procesa datos para vista anual (agrupados por mes)
   */
  private processYearData(data: MedicionData[]): ProcessedChartData {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexado
    
    // Crear array de 12 meses inicializado en 0
    const monthlyData = new Array(12).fill(0);

    // Filtrar datos futuros primero
    const filteredData = data.filter(item => new Date(item.fecha_creacion) <= today);

    // Agrupar datos por mes
    filteredData.forEach(item => {
      const fecha = new Date(item.fecha_creacion);
      const month = fecha.getMonth(); // 0-indexado
      
      // Solo procesar datos hasta el mes actual
      if (month <= currentMonth) {
        monthlyData[month] += item.energia_acumulada_calc;
      }
    });

    // Usar datos acumulados sin promediar
    const currentData = monthlyData.map((sum, index) => 
      index <= currentMonth ? sum : 0
    );

    // Labels de meses
    const labels = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Calcular proyección y BEP
    const projectionData = this.calculateProjection(currentData, 12);
    const bepData = this.calculateBEP(currentData);

    const totalConsumption = currentData.reduce((sum: number, val: number) => sum + val, 0);

    return {
      labels,
      currentData,
      projectionData,
      bepData,
      totalConsumption
    };
  }

  /**
   * Calcula datos de proyección usando regresión lineal
   */
  private calculateProjection(data: number[], totalLength: number): number[] {
    const validData = data.filter(val => val !== null && val !== undefined && val > 0);
    
    if (validData.length < 2) {
      return new Array(totalLength).fill(0);
    }

    // Calcular regresión lineal
    const xValues = validData.map((_, index) => index);
    const { slope, intercept } = this.calculateLinearRegression(xValues, validData);

    // Generar datos proyectados
    const projectionData: number[] = [];
    for (let i = 0; i < totalLength; i++) {
      const projectedValue = slope * i + intercept;
      projectionData.push(Math.max(0, projectedValue));
    }

    return projectionData;
  }

  /**
   * Calcula la regresión lineal
   */
  private calculateLinearRegression(xValues: number[], yValues: number[]): { slope: number; intercept: number } {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Calcula la línea BEP (Break Even Point)
   */
  private calculateBEP(data: number[]): number[] {
    const validData = data.filter(val => val !== null && val !== undefined && val > 0);
    
    if (validData.length === 0) {
      return new Array(data.length).fill(5000); // Valor por defecto
    }

    // Usar el promedio como línea BEP
    const average = validData.reduce((sum, val) => sum + val, 0) / validData.length;
    return new Array(data.length).fill(Math.round(average * 1.2)); // 20% por encima del promedio
  }

  /**
   * Rellena espacios vacíos en los datos usando interpolación lineal
   * @param data Array con datos que pueden contener valores null
   * @returns Array con espacios vacíos completados
   */
  private fillGapsWithInterpolation(data: (number | null)[]): number[] {
    const result = [...data];
    
    // Si no hay datos válidos, retornar array de ceros
    const validIndices = data.map((val, idx) => val !== null ? idx : -1).filter(idx => idx !== -1);
    if (validIndices.length === 0) {
      return new Array(data.length).fill(0);
    }

    // Si solo hay un dato válido, usar ese valor para todos los espacios vacíos
    if (validIndices.length === 1) {
      const validValue = data[validIndices[0]]!;
      return data.map(val => val !== null ? val : validValue);
    }

    // Interpolación lineal para espacios vacíos
    for (let i = 0; i < result.length; i++) {
      if (result[i] === null) {
        // Encontrar el punto válido anterior más cercano
        let prevIndex = -1;
        for (let j = i - 1; j >= 0; j--) {
          if (result[j] !== null) {
            prevIndex = j;
            break;
          }
        }

        // Encontrar el punto válido posterior más cercano
        let nextIndex = -1;
        for (let j = i + 1; j < result.length; j++) {
          if (result[j] !== null) {
            nextIndex = j;
            break;
          }
        }

        // Realizar interpolación
        if (prevIndex !== -1 && nextIndex !== -1) {
          // Interpolación entre dos puntos
          const prevValue = result[prevIndex]!;
          const nextValue = result[nextIndex]!;
          const ratio = (i - prevIndex) / (nextIndex - prevIndex);
          result[i] = prevValue + (nextValue - prevValue) * ratio;
        } else if (prevIndex !== -1) {
          // Solo hay punto anterior, usar ese valor
          result[i] = result[prevIndex]!;
        } else if (nextIndex !== -1) {
          // Solo hay punto posterior, usar ese valor
          result[i] = result[nextIndex]!;
        } else {
          // No debería llegar aquí, pero por seguridad
          result[i] = 0;
        }
      }
    }

    return result as number[];
  }

  /**
   * Retorna datos vacíos para el gráfico
   */
  private getEmptyChartData(period: string): ProcessedChartData {
    let length: number;
    let labels: string[];

    switch (period) {
      case 'Day':
        length = 24;
        labels = Array.from({ length: 24 }, (_, i) => 
          `${i.toString().padStart(2, '0')}:00`
        );
        break;
      case 'Month':
        const today = new Date();
        length = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const month = today.getMonth() + 1;
        labels = Array.from({ length }, (_, i) => 
          `${(i + 1).toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`
        );
        break;
      case 'Year':
        length = 12;
        labels = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        break;
      default:
        length = 12;
        labels = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
    }

    return {
      labels,
      currentData: new Array(length).fill(0),
      projectionData: new Array(length).fill(0),
      bepData: new Array(length).fill(5000),
      totalConsumption: 0
    };
  }
}