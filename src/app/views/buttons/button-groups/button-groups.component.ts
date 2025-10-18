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
        }
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
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

  private actualizarGraficos(data: MedicionData[], periodo: string): void {
    // Actualizar gráfico de línea
    const labels = [];
    const values = [];
    const predictedValues = [];

    if (periodo === 'dia') {
      // Agrupar por horas
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
        const horaData = data.filter(d => new Date(d.fecha_creacion).getHours() === i);
        const consumo = horaData.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
        values.push(consumo);
        predictedValues.push(consumo * this.calcularFactorProyeccion('dia'));
      }
    } else if (periodo === 'mes') {
      // Agrupar por días
      const daysInMonth = new Date().getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(`Día ${i}`);
        const diaData = data.filter(d => new Date(d.fecha_creacion).getDate() === i);
        const consumo = diaData.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
        values.push(consumo);
        predictedValues.push(consumo * this.calcularFactorProyeccion('mes'));
      }
    } else {
      // Agrupar por meses
      for (let i = 0; i < 12; i++) {
        labels.push(`Mes ${i + 1}`);
        const mesData = data.filter(d => new Date(d.fecha_creacion).getMonth() === i);
        const consumo = mesData.reduce((sum, d) => sum + d.energia_acumulada_calc, 0);
        values.push(consumo);
        predictedValues.push(consumo * this.calcularFactorProyeccion('año'));
      }
    }

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Consumo Real',
          backgroundColor: 'rgba(151, 187, 205, 0.2)',
          borderColor: 'rgba(151, 187, 205, 1)',
          pointBackgroundColor: 'rgba(151, 187, 205, 1)',
          pointBorderColor: '#fff',
          data: values
        },
        {
          label: 'Consumo Proyectado',
          backgroundColor: 'rgba(220, 220, 220, 0.2)',
          borderColor: 'rgba(220, 220, 220, 1)',
          pointBackgroundColor: 'rgba(220, 220, 220, 1)',
          pointBorderColor: '#fff',
          data: predictedValues
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
