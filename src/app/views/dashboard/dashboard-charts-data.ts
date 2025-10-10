import { Injectable } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, ChartType, PluginOptionsByType, ScaleOptions, TooltipLabelStyle } from 'chart.js';
import { DeepPartial } from './utils';
import { getStyle } from '@coreui/utils';

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
  private dayData1 = [10, 20, 30, 50, 70,100,150,250,310,460, 310,250,150,100, 300, 500, 600, 400, 300, 450 ];
  private dayData3 = Array(24).fill(150);

  // Datos manuales para Mes (31 días)
  private monthData1 = [22, 25, 28, 30, 32, 35, 38, 100, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98];  
  private monthData3 = Array(31).fill(60);

  // Datos para Año (12 meses)
  private yearData1 = [25, 13, 25, 15, 16, 17, 18, 19, 20, 21, 22, 23];  
  private yearData3 = Array(12).fill(15);
  constructor() {
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
      datosManual3 = this.monthData3;
      totalLength = 31;
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

    // Calcular la proyección usando regresión lineal basada en los datos actuales
    const datosManual2 = this.generateRegressionProjection(datosManual1, totalLength, period);

    this.mainChart['Data1'] = datosManual1;
    this.mainChart['Data2'] = datosManual2;
    this.mainChart['Data3'] = datosManual3;

    let labels: string[] = [];
    if (period === 'Day') {
      labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    } else if (period === 'Month') {
      const today = new Date();
      const month = today.getMonth() + 1;
      labels = Array.from({ length: this.monthData1.length }, (_, i) => `${(i+1).toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`);
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
        // brandSuccess
        backgroundColor: 'transparent',
        borderColor: brandSuccess || '#4dbd74',
        pointHoverBackgroundColor: '#fff'
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

  // Calcular el máximo de todos los datos
  const allData = [...this.mainChart['Data1'], ...this.mainChart['Data2'], ...this.mainChart['Data3']];
  const maxValue = Math.max(...allData);
  const scales = this.getScales(maxValue);

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

  getScales(maxY: number = 250) {
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
        max: maxY,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(maxY / 5)
        }
      }
    };
    return scales;
  }
}
