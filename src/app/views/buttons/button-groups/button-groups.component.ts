import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { getStyle } from '@coreui/utils';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import {
  ButtonDirective,
  ButtonGroupComponent,
  ButtonToolbarComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  WidgetStatBComponent,
  ProgressComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '../../../../components/public-api';
import { InvoiceComponent } from '../../apps/invoice/invoice/invoice.component';
import { ParquetDataService, MedicionData } from '../../../services/parquet-data.service';

@Component({
  selector: 'app-button-groups',
  templateUrl: './button-groups.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent, 
    ColComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardBodyComponent, 
    DocsExampleComponent, 
    ButtonGroupComponent, 
    ButtonDirective, 
    RouterLink, 
    ReactiveFormsModule, 
    FormCheckLabelDirective, 
    ButtonToolbarComponent, 
    InputGroupComponent, 
    InputGroupTextDirective, 
    FormControlDirective, 
    DropdownComponent, 
    DropdownToggleDirective, 
    DropdownMenuDirective, 
    DropdownItemDirective, 
    DropdownDividerDirective, 
    DocsComponentsComponent, 
    WidgetStatBComponent, 
    ProgressComponent, 
    ChartjsComponent, 
    IconModule, 
    TableDirective, 
    TextColorDirective
  ],
  providers: [IconSetService, ParquetDataService]
})
export class ButtonGroupsComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private parquetService = inject(ParquetDataService);

  // Variables para almacenar datos y estadísticas
  voltajePromedio: number = 0;
  corrientePromedio: number = 0;
  consumoEstimadoKWH: number = 0;
  consumoEstimadoGTQ: number = 0;
  tarifaActual: number = 1.51; // Q/kWh
  periodo: string = 'dia';   // Período actual seleccionado

  ngOnInit() {
    this.loadData('dia');
  }

  async loadData(periodo: string) {
    let filter;
    switch(periodo) {
      case 'dia':
        filter = this.parquetService.getDayFilter();
        break;
      case 'mes':
        filter = this.parquetService.getMonthFilter();
        break;
      case 'año':
        filter = this.parquetService.getYearFilter();
        break;
      default:
        filter = this.parquetService.getDayFilter();
    }

    // Reiniciar valores antes de cargar nuevos datos
    this.resetearValores();

    // Obtener datos filtrados
    this.parquetService.getFilteredData(filter).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          // Calcular promedios
          this.voltajePromedio = this.calcularPromedio(response.data, 'voltaje');
          this.corrientePromedio = this.calcularPromedio(response.data, 'corriente');
          
          // Calcular estimaciones
          const consumoActual = response.data.reduce((sum, item) => sum + item.energia_acumulada_calc, 0);
          const factorProyeccion = this.calcularFactorProyeccion(periodo);
          this.consumoEstimadoKWH = consumoActual * factorProyeccion;
          this.consumoEstimadoGTQ = this.consumoEstimadoKWH * this.tarifaActual;

          // Actualizar datos del gráfico
          this.actualizarGraficos(response.data, periodo);
        } else {
          // Si no hay datos, mantenemos los valores reiniciados
          console.log('No hay datos disponibles para el período seleccionado');
          this.resetearGraficos();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        // En caso de error, también reiniciamos los valores
        this.resetearValores();
        this.resetearGraficos();
      }
    });
  }

  print($event: MouseEvent) {
    $event.preventDefault();
    window && window.print();
  }

  // Datos para el gráfico de línea
  lineChartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
    datasets: [
      {
        label: 'Consumo 2024',
        backgroundColor: 'rgba(151, 187, 205, 0.2)',
        borderColor: 'rgba(151, 187, 205, 1)',
        pointBackgroundColor: 'rgba(151, 187, 205, 1)',
        pointBorderColor: '#fff',
        data: [65, 59, 90, 81, 56, 55, 40]
      },
      {
        label: 'Consumo 2025',
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
        pointBorderColor: '#fff',
        data: [28, 48, 40, 19, 96, 27, 100]
      }
    ]
  };

  lineChartOptions = {
    plugins: {
      legend: {
        display: true
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        beginAtZero: true
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  // Datos para el gráfico de radar
  radarChartData = {
    labels: ['Mañana', 'Medio día', 'Tarde', 'Noche', 'Madrugada'],
    datasets: [
      {
        label: 'Promedio de consumo',
        data: [65, 59, 90, 81, 56],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
      }
    ]
  };

  radarChartOptions = {
    plugins: {
      legend: {
        display: true
      }
    },
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true
        }
      }
    }
  };

  formCheck1 = this.formBuilder.group({
    checkbox1: false,
    checkbox2: false,
    checkbox3: false
  });
  formRadio1 = new UntypedFormGroup({
    radio1: new UntypedFormControl('dia')
  });

  setCheckBoxValue(controlName: string) {
    const prevValue = this.formCheck1.get(controlName)?.value;
    const value = this.formCheck1.value;
    value[controlName] = !prevValue;
    this.formCheck1.setValue(value);
  }

  setRadioValue(value: string): void {
    this.formRadio1.setValue({ radio1: value });
    this.periodo = value;
    this.loadData(value);
  }

  private resetearValores(): void {
    this.voltajePromedio = 0;
    this.corrientePromedio = 0;
    this.consumoEstimadoKWH = 0;
    this.consumoEstimadoGTQ = 0;
  }

  private resetearGraficos(): void {
    // Resetear gráfico de línea
    this.lineChartData = {
      labels: [],
      datasets: [
        {
          label: 'Consumo Real',
          backgroundColor: 'rgba(151, 187, 205, 0.2)',
          borderColor: 'rgba(151, 187, 205, 1)',
          pointBackgroundColor: 'rgba(151, 187, 205, 1)',
          pointBorderColor: '#fff',
          data: []
        },
        {
          label: 'Consumo Proyectado',
          backgroundColor: 'rgba(220, 220, 220, 0.2)',
          borderColor: 'rgba(220, 220, 220, 1)',
          pointBackgroundColor: 'rgba(220, 220, 220, 1)',
          pointBorderColor: '#fff',
          data: []
        }
      ]
    };

    // Resetear gráfico de radar
    this.radarChartData = {
      labels: ['Mañana', 'Medio día', 'Tarde', 'Noche', 'Madrugada'],
      datasets: [
        {
          label: 'Patrón de consumo',
          data: [0, 0, 0, 0, 0],
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)'
        }
      ]
    };
  }

  obtenerFechaActual(): string {
    const fecha = new Date();
    return fecha.toLocaleDateString('es-GT');
  }

  obtenerPeriodoAnalisis(): string {
    const fecha = new Date();
    switch(this.periodo) {
      case 'dia':
        return fecha.toLocaleDateString('es-GT');
      case 'mes':
        return `${fecha.toLocaleString('es-GT', { month: 'long' })} ${fecha.getFullYear()}`;
      case 'año':
        return fecha.getFullYear().toString();
      default:
        return fecha.toLocaleDateString('es-GT');
    }
  }

  obtenerTipoAnalisis(): string {
    switch(this.periodo) {
      case 'dia':
        return 'Proyección Diaria';
      case 'mes':
        return 'Proyección Mensual';
      case 'año':
        return 'Proyección Anual';
      default:
        return 'Proyección Diaria';
    }
  }

  obtenerUmbralReferencia(): string {
    switch(this.periodo) {
      case 'dia':
        return this.formatearNumero(333.33) + ' KWH diarios';
      case 'mes':
        return this.formatearNumero(10000) + ' KWH mensuales';
      case 'año':
        return this.formatearNumero(120000) + ' KWH anuales';
      default:
        return this.formatearNumero(10000) + ' KWH mensuales';
    }
  }

  estaEnLimites(): boolean {
    const umbral = {
      dia: 333.33,    // 10,000 KWH / 30 días
      mes: 10000,     // 10,000 KWH
      año: 120000     // 10,000 KWH * 12 meses
    };
    
    return this.consumoEstimadoKWH <= umbral[this.periodo as keyof typeof umbral];
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-GT').format(valor);
  }

  private calcularPromedio(data: MedicionData[], campo: keyof MedicionData): number {
    if (data.length === 0) return 0;
    const suma = data.reduce((sum, item) => {
      const valor = item[campo];
      return sum + (typeof valor === 'number' ? valor : 0);
    }, 0);
    return suma / data.length;
  }

  calcularFactorProyeccion(periodo: string): number {
    const today = new Date();
    const currentHour = today.getHours();
    
    switch(periodo) {
      case 'dia':
        // Si estamos antes de las 12, proyectamos el día completo
        return currentHour < 12 ? 24 / currentHour : 1;
      case 'mes':
        // Proyectamos basado en los días transcurridos del mes
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const currentDay = today.getDate();
        return currentDay < daysInMonth ? daysInMonth / currentDay : 1;
      case 'año':
        // Proyectamos basado en los meses transcurridos
        const currentMonth = today.getMonth() + 1;
        return currentMonth < 12 ? 12 / currentMonth : 1;
      default:
        return 1;
    }
  }

  private calcularRegresionLineal(data: number[]): { pendiente: number, intercepto: number } {
    const n = data.length;
    if (n < 2) return { pendiente: 0, intercepto: data[0] || 0 };

    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + (xi * y[i]), 0);
    const sumXX = x.reduce((sum, xi) => sum + (xi * xi), 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercepto = (sumY - pendiente * sumX) / n;

    return { pendiente, intercepto };
  }

  private actualizarGraficos(data: MedicionData[], periodo: string): void {
    // Actualizar gráfico de línea
    const labels = [];
    const values = [];
    const predictedValues = [];
    const now = new Date();

    if (periodo === 'dia') {
      // Agrupar por horas (00:00 - 23:00)
      const currentHour = now.getHours();
      
      for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
        if (i <= currentHour) {
          const horaData = data.filter(d => new Date(d.fecha_creacion).getHours() === i);
          const consumo = horaData.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
          values.push(consumo);
        } else {
          values.push(null);
        }
      }

      // Calcular proyección usando regresión lineal
      const datosReales = values.filter(v => v !== null);
      const regresion = this.calcularRegresionLineal(datosReales);
      
      for (let i = 0; i < 24; i++) {
        if (i <= currentHour) {
          predictedValues.push(values[i]);
        } else {
          predictedValues.push(regresion.intercepto + regresion.pendiente * i);
        }
      }
    } else if (periodo === 'mes') {
      // Agrupar por días (01-último día del mes)
      const currentDay = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(`${i.toString().padStart(2, '0')}`);
        if (i <= currentDay) {
          const diaData = data.filter(d => new Date(d.fecha_creacion).getDate() === i);
          const consumo = diaData.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
          values.push(consumo);
        } else {
          values.push(null);
        }
      }

      // Calcular proyección usando regresión lineal
      const datosReales = values.filter(v => v !== null);
      const regresion = this.calcularRegresionLineal(datosReales);
      
      for (let i = 0; i < daysInMonth; i++) {
        if (i < currentDay) {
          predictedValues.push(values[i]);
        } else {
          predictedValues.push(regresion.intercepto + regresion.pendiente * i);
        }
      }
    } else {
      // Agrupar por meses (enero-diciembre)
      const currentMonth = now.getMonth();
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      for (let i = 0; i < 12; i++) {
        labels.push(meses[i]);
        if (i <= currentMonth) {
          const mesData = data.filter(d => new Date(d.fecha_creacion).getMonth() === i);
          const consumo = mesData.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
          values.push(consumo);
        } else {
          values.push(null);
        }
      }

      // Calcular proyección usando regresión lineal
      const datosReales = values.filter(v => v !== null);
      const regresion = this.calcularRegresionLineal(datosReales);
      
      for (let i = 0; i < 12; i++) {
        if (i <= currentMonth) {
          predictedValues.push(values[i]);
        } else {
          predictedValues.push(regresion.intercepto + regresion.pendiente * i);
        }
      }
    }

    // Preparar datos para el gráfico
    const valuesForChart = values.map(v => v === null ? 0 : v);
    const predictedValuesForChart = predictedValues.map(v => v === null ? 0 : v);

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Consumo Real',
          backgroundColor: 'rgba(151, 187, 205, 0.2)',
          borderColor: 'rgba(151, 187, 205, 1)',
          pointBackgroundColor: 'rgba(151, 187, 205, 1)',
          pointBorderColor: '#fff',
          data: valuesForChart
        },
        {
          label: 'Consumo Proyectado',
          backgroundColor: 'rgba(255, 206, 86, 0.2)', // Color amarillo más suave
          borderColor: 'rgba(255, 206, 86, 1)', // Color amarillo
          pointBackgroundColor: 'rgba(255, 206, 86, 1)',
          pointBorderColor: '#fff',
          data: predictedValuesForChart
        }
      ]
    };

    // Actualizar gráfico de radar con el patrón de consumo del día
    const patrones: string[] = ['Mañana', 'Medio día', 'Tarde', 'Noche', 'Madrugada'];
    type PatronTiempo = 'Mañana' | 'Medio día' | 'Tarde' | 'Noche' | 'Madrugada';
    
    const horasPatron: Record<PatronTiempo, number[]> = {
      'Mañana': [6, 7, 8, 9, 10, 11],
      'Medio día': [12, 13, 14],
      'Tarde': [15, 16, 17, 18],
      'Noche': [19, 20, 21, 22],
      'Madrugada': [23, 0, 1, 2, 3, 4, 5]
    };

    const consumosPorPatron = patrones.map(patron => {
      const horasDelPatron = horasPatron[patron as PatronTiempo];
      const datosDelPatron = data.filter(d => 
        horasDelPatron.includes(new Date(d.fecha_creacion).getHours())
      );
      return datosDelPatron.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
    });

    this.radarChartData = {
      labels: patrones,
      datasets: [
        {
          label: 'Patrón de consumo',
          data: consumosPorPatron,
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)'
        }
      ]
    };
  }
}
