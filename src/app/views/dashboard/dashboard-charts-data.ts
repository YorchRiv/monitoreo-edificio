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

    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['Data1'] = [];
    this.mainChart['Data2'] = [];
    this.mainChart['Data3'] = [];

    // Inserción manual de datos en arrays
    const datosManual1 = [120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230,];
    const datosManual2 = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
    const datosManual3 = Array(datosManual1.length).fill(115); // Limite constante

    this.mainChart['Data1'] = datosManual1;
    this.mainChart['Data2'] = datosManual2;
    this.mainChart['Data3'] = datosManual3;

    let labels: string[] = [];
    if (period === 'Day') {
      // Etiquetas de 00 a 23 horas
      labels = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00');
      // Ejemplo de datos manuales para cada hora
      this.mainChart['Data1'] = Array.from({ length: 24 }, (_, i) => 100 + i * 2); // Puedes ajustar los valores
      this.mainChart['Data2'] = Array.from({ length: 24 }, (_, i) => 80 + i * 2);
      this.mainChart['Data3'] = Array(24).fill(115);
    } else if (period === 'Month') {
      // Etiquetas de días del mes actual en formato dd/mm
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        const mes = String(month + 1).padStart(2, '0');
        return `${day}/${mes}`;
      });
      // Ejemplo de datos manuales para cada día
      this.mainChart['Data1'] = Array.from({ length: daysInMonth }, (_, i) => 100 + i * 3);
      this.mainChart['Data2'] = Array.from({ length: daysInMonth }, (_, i) => 80 + i * 2);
      this.mainChart['Data3'] = Array(daysInMonth).fill(115);
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
      /* tslint:disable:max-line-length */
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

    const scales = this.getScales();

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

  getScales() {
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
        max: 250,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5)
        }
      }
    };
    return scales;
  }
}
