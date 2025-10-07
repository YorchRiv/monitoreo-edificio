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
  private dayData1 = [12, 15, 18, 20, 22, 25, 28, 30, 100, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70];
  private dayData2 = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54];
  private dayData3 = Array(24).fill(50);

  // Datos manuales para Mes (31 días)
  private monthData1 = [22, 25, 28, 30, 32, 35, 38, 100, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98];
  private monthData2 = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70];
  private monthData3 = Array(31).fill(60);

  // Datos para Año (12 meses)
  private yearData1 = [25, 13, 25, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  private yearData2 = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  private yearData3 = Array(12).fill(15);
  constructor() {
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'Month') {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = `rgba(${getStyle('--cui-info-rgb')}, .1)`
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    // Selección de datos según el periodo
    let datosManual1: number[];
    let datosManual2: number[];
    let datosManual3: number[];
    if (period === 'Day') {
      datosManual1 = this.dayData1;
      datosManual2 = this.dayData2;
      datosManual3 = this.dayData3;
    } else if (period === 'Month') {
      datosManual1 = this.monthData1;
      datosManual2 = this.monthData2;
      datosManual3 = this.monthData3;
    } else if (period === 'Year') {
      datosManual1 = this.yearData1;
      datosManual2 = this.yearData2;
      datosManual3 = this.yearData3;
    } else {
      // Por defecto, año
      datosManual1 = this.yearData1;
      datosManual2 = this.yearData2;
      datosManual3 = this.yearData3;
    }

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
        label: 'Previous',
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
