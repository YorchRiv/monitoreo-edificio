import { Injectable } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, ChartType, PluginOptionsByType, ScaleOptions, TooltipLabelStyle } from 'chart.js';
import { DeepPartial } from './utils';
import { getStyle } from '@coreui/utils';
import { ProcessedChartData } from '../../services/data-processing.service';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  // Datos manuales para Día (24 horas)
  private dayData1 = [9000,8000,7000,5000,4000,3000,2000,1000,1000,1200,1400,1600, 1800,2500, 2600, 2800, 2550, 2900, 3000, 3800, 2400, 3560];
  private dayData3 = Array(24).fill(3000);

  // Datos manuales para Mes (31 días)
  private monthData1 = [400, 450, 430, 440, 460, 435, 422, 468, 420, 600];  
  private monthData3Value = 500; // Valor fijo para BEP

  // Datos para Año (12 meses)
  private yearData1 = [3000, 4800, 5600, 3200, 4560, 5100, 3900, 3800, 2400, 3560, 5000, 4000];  
  private yearData3 = Array(12).fill(5000);
  constructor() {
    this.initMainChart('Month'); // Pasar explícitamente el período por defecto
  }

  public mainChart: IChartProps = { type: 'line' };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Calcula los días del mes actual
   * @returns Número de días del mes actual
   */
  private getDaysInCurrentMonth(): number {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // getMonth() es 0-indexado
    return new Date(year, month, 0).getDate();
  }

  /**
   * Calcula la regresión lineal usando el método de mínimos cuadrados
   * @param xValues Array de valores X (índices)
   * @param yValues Array de valores Y (datos reales)
   * @returns Objeto con pendiente (slope) e intercepto (intercept)
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
   * Genera datos de proyección usando regresión lineal
   * @param originalData Datos originales para calcular la regresión
   * @param totalLength Longitud total del array resultado
   * @param period Período actual para determinar cuántos datos están completos
   * @returns Array con los datos proyectados
   */
  private generateRegressionProjection(originalData: number[], totalLength: number, period: string = 'Month'): number[] {
    // Determinar cuántos datos están "completos" basados en el período actual
    let dataPointsToUse = originalData.length;
    
    // Para simulación realista, asumimos que no todos los datos están completos
    if (period === 'Day') {
      // Simular que estamos a media jornada (12 horas de datos)
      dataPointsToUse = Math.min(12, originalData.length);
    } else if (period === 'Month') {
      // Simular que estamos a mediados del mes (15 días de datos)
      dataPointsToUse = Math.min(15, originalData.length);
    } else if (period === 'Year') {
      // Simular que estamos en octubre (10 meses de datos)
      dataPointsToUse = Math.min(10, originalData.length);
    }
    
    // Usar solo los datos "disponibles" para calcular la regresión
    const availableData = originalData.slice(0, dataPointsToUse);
    const xValues = availableData.map((_, index) => index);
    
    // Calcular regresión lineal con los datos disponibles
    const { slope, intercept } = this.calculateLinearRegression(xValues, availableData);
    
    // Generar datos proyectados para toda la longitud
    const projectedData: number[] = [];
    for (let i = 0; i < totalLength; i++) {
      const projectedValue = slope * i + intercept;
      
      // Si estamos dentro del rango de datos reales, usar una mezcla
      // Si estamos proyectando hacia el futuro, usar solo la regresión
      if (i < dataPointsToUse) {
        // Para los datos existentes, mostrar la tendencia calculada
        projectedData.push(Math.max(0, projectedValue));
      } else {
        // Para datos futuros, mostrar la proyección
        projectedData.push(Math.max(0, projectedValue));
      }
    }
    
    return projectedData;
  }

  initMainChart(period: string = 'Month') {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = `rgba(${getStyle('--cui-info-rgb')}, .1)`
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    // Selección de datos según el periodo
    let datosManual1: number[];
    let datosManual3: number[];
    let totalLength: number;
    
    if (period === 'Day') {
      datosManual1 = this.dayData1;
      datosManual3 = this.dayData3;
      totalLength = 24;
    } else if (period === 'Month') {
      datosManual1 = this.monthData1;
      totalLength = this.getDaysInCurrentMonth(); // Usar días reales del mes actual
      datosManual3 = Array(totalLength).fill(this.monthData3Value); // Generar array dinámicamente
    } else if (period === 'Year') {
      datosManual1 = this.yearData1;
      datosManual3 = this.yearData3;
      totalLength = 12;
    } else {
      // Por defecto, año
      datosManual1 = this.yearData1;
      datosManual3 = this.yearData3;
      totalLength = 12;
    }

    // Para el período de mes, extender los datos actuales con nulls para mostrar días sin datos
    let extendedData1 = datosManual1;
    if (period === 'Month' && datosManual1.length < totalLength) {
      extendedData1 = [...datosManual1, ...Array(totalLength - datosManual1.length).fill(null)];
    }

    // Calcular la proyección usando regresión lineal basada en los datos actuales
    const datosManual2 = this.generateRegressionProjection(datosManual1, totalLength, period);

    this.mainChart['Data1'] = extendedData1;
    this.mainChart['Data2'] = datosManual2;
    this.mainChart['Data3'] = datosManual3;

    let labels: string[] = [];
    if (period === 'Day') {
      labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    } else if (period === 'Month') {
      const today = new Date();
      const month = today.getMonth() + 1;
      const daysInMonth = this.getDaysInCurrentMonth();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${(i+1).toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`);
    } else if (period === 'Year') {
      labels = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ];
    } else {
      const week = [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo'
      ];
      labels = week.concat(week, week, week);
    }

    const colors = [
      {
        // brandInfo
        backgroundColor: brandInfoBg,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        fill: true
      },
      {
        // Projection line - Yellow and dashed
        backgroundColor: 'transparent',
        borderColor: '#ffc107', // Color amarillo
        pointHoverBackgroundColor: '#ffc107',
        borderWidth: 2,
        borderDash: [20, 5] // Línea punteada igual que la roja
      },
      {
        // brandDanger
        backgroundColor: 'transparent',
        borderColor: brandDanger || '#f86c6b',
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5]
      }
    ];

    const datasets: ChartDataset[] = [
      {
        data: this.mainChart['Data1'],
        label: 'Current',
        ...colors[0]
      },
      {
        data: this.mainChart['Data2'],
        label: 'Projection',
        ...colors[1]
      },
      {
        data: this.mainChart['Data3'],
        label: 'BEP',
        ...colors[2]
      }
    ];

    const plugins: DeepPartial<PluginOptionsByType<any>> = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };

    // Calcular el máximo de todos los datos (filtrar nulls y valores no numéricos)
    const allData = [
      ...this.mainChart['Data1'].filter((val: any) => val !== null && !isNaN(val)),
      ...this.mainChart['Data2'].filter((val: any) => val !== null && !isNaN(val)),
      ...this.mainChart['Data3'].filter((val: any) => val !== null && !isNaN(val))
    ];
    const maxValue = Math.max(...allData);
    // Agregar un margen del 10% al valor máximo para mejor visualización
    const scaledMaxValue = maxValue * 1.1;
    const scales = this.getScales(scaledMaxValue);

    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
        }
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
  }

  /**
   * Calcula el valor máximo actual de todos los datos del gráfico
   */
  getCurrentMaxValue(): number {
    const allData = [
      ...this.mainChart['Data1'].filter((val: any) => val !== null && !isNaN(val)),
      ...this.mainChart['Data2'].filter((val: any) => val !== null && !isNaN(val)),
      ...this.mainChart['Data3'].filter((val: any) => val !== null && !isNaN(val))
    ];
    const maxValue = Math.max(...allData);
    return maxValue > 0 ? maxValue * 1.1 : 250; // Agregar margen del 10% o usar 250 por defecto
  }

  /**
   * Actualiza el gráfico con datos de la API
   * @param processedData Datos procesados de la API
   */
  updateChartWithApiData(processedData: ProcessedChartData): void {
    this.mainChart['Data1'] = processedData.currentData;
    this.mainChart['Data2'] = processedData.projectionData;
    this.mainChart['Data3'] = processedData.bepData;

    // Actualizar la configuración del gráfico
    this.updateChartConfig(processedData.labels, processedData.currentData, processedData.projectionData, processedData.bepData);
  }

  /**
   * Actualiza la configuración del gráfico con nuevos datos
   */
  private updateChartConfig(labels: string[], data1: number[], data2: number[], data3: number[]): void {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = `rgba(${getStyle('--cui-info-rgb')}, .1)`;
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    const colors = [
      {
        // brandInfo
        backgroundColor: brandInfoBg,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        fill: true
      },
      {
        // Projection line - Yellow and dashed
        backgroundColor: 'transparent',
        borderColor: '#ffc107', // Color amarillo
        pointHoverBackgroundColor: '#ffc107',
        borderWidth: 2,
        borderDash: [20, 5] // Línea punteada igual que la roja
      },
      {
        // brandDanger
        backgroundColor: 'transparent',
        borderColor: brandDanger || '#f86c6b',
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5]
      }
    ];

    const datasets: ChartDataset[] = [
      {
        data: data1,
        label: 'Consumo',
        ...colors[0]
      },
      {
        data: data2,
        label: 'Proyeccion',
        ...colors[1]
      },
      {
        data: data3,
        label: 'Limite Establecido',
        ...colors[2]
      }
    ];

    const plugins: DeepPartial<PluginOptionsByType<any>> = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };

    // Calcular el máximo de todos los datos
    const allData = [...data1, ...data2, ...data3].filter(val => val !== null && !isNaN(val));
    const maxValue = Math.max(...allData);
    const scaledMaxValue = maxValue * 1.1;
    const scales = this.getScales(scaledMaxValue);

    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
        }
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
  }

  /**
   * Calcula la suma del consumo según el período seleccionado
   * @param period Período actual ('Day', 'Month', 'Year')
   * @returns Suma total del array correspondiente
   */
  getCurrentConsumption(period: string = 'Month'): number {
    // Si hay datos de la API, usar esos
    if (this.mainChart['Data1']) {
      return this.mainChart['Data1'].reduce((sum: number, value: number) => sum + (value || 0), 0);
    }

    // Fallback a datos estáticos
    let data: number[];
    
    if (period === 'Day') {
      data = this.dayData1;
    } else if (period === 'Month') {
      data = this.monthData1;
    } else if (period === 'Year') {
      data = this.yearData1;
    } else {
      data = this.monthData1; // Por defecto
    }
    
    return data.reduce((sum, value) => sum + (value || 0), 0);
  }

  getScales(maxY?: number) {
    // Si no se proporciona maxY, calcular dinámicamente
    const actualMaxY = maxY ?? this.getCurrentMaxValue();
    
    const colorBorderTranslucent = getStyle('--cui-border-color-translucent');
    const colorBody = getStyle('--cui-body-color');

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        max: actualMaxY,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(actualMaxY / 5)
        }
      }
    };
    return scales;
  }
}
