import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, RowComponent } from '@coreui/angular-pro';
import { SmartTablesBasicExampleComponent } from '../../smart-tables/smart-tables-basic-example/smart-tables-basic-example.component';
import { DatePickerComponent } from '../../forms/date-picker/date-picker.component';
import { HistorialDatePickerComponent } from './historial-date-picker.component';
import { ParquetDataService, MedicionData } from '../../../services/parquet-data.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  imports: [CommonModule, RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, ChartjsComponent, SmartTablesBasicExampleComponent, DatePickerComponent, HistorialDatePickerComponent],
})
export class ChartsComponent implements OnInit {

  // Datos para la tabla
  public currentApiData: MedicionData[] = [];
  public isLoadingData: boolean = false;
  public selectedDateRange = {
    startDate: '',
    endDate: ''
  };

  constructor(private parquetDataService: ParquetDataService) {}

  options = {
    maintainAspectRatio: false
  };

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  chartBarData: ChartData = {
    labels: [...this.months].slice(0, 7),
    datasets: [
      {
        label: 'GitHub Commits',
        backgroundColor: '#f87979',
        data: [40, 20, 12, 39, 17, 42, 1000]
      }
    ]
  };

  // chartBarOptions = {
  //   maintainAspectRatio: false,
  // };

  chartLineData: ChartData = {
    labels: [...this.months].slice(0, 7),
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
        pointBorderColor: '#fff',
        data: [this.randomData, this.randomData, this.randomData, this.randomData, this.randomData, this.randomData, this.randomData]
      },
      {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151, 187, 205, 0.2)',
        borderColor: 'rgba(151, 187, 205, 1)',
        pointBackgroundColor: 'rgba(151, 187, 205, 1)',
        pointBorderColor: '#fff',
        data: [this.randomData, this.randomData, this.randomData, this.randomData, this.randomData, this.randomData, this.randomData]
      }
    ]
  };

  chartLineOptions = {
    maintainAspectRatio: false
  };

  chartDoughnutData: ChartData = {
    labels: ['VueJs', 'EmberJs', 'ReactJs', 'Angular'],
    datasets: [
      {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
        data: [40, 20, 80, 10]
      }
    ]
  };

  // chartDoughnutOptions = {
  //   aspectRatio: 1,
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   radius: '100%'
  // };

  chartPieData: ChartData = {
    labels: ['Red', 'Green', 'Yellow'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  // chartPieOptions = {
  //   aspectRatio: 1,
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   radius: '100%'
  // };

  chartPolarAreaData: ChartData = {
    labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
    datasets: [
      {
        data: [11, 16, 7, 3, 14],
        backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB']
      }
    ]
  };

  chartRadarData: ChartData = {
    labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
    datasets: [
      {
        label: '2020',
        backgroundColor: 'rgba(179,181,198,0.2)',
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)',
        data: [65, 59, 90, 81, 56, 55, 40]
      },
      {
        label: '2021',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        pointBackgroundColor: 'rgba(255,99,132,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255,99,132,1)',
        data: [this.randomData, this.randomData, this.randomData, this.randomData, this.randomData, this.randomData, this.randomData]
      }
    ]
  };

  // chartRadarOptions = {
  //   aspectRatio: 1.5,
  //   responsive: true,
  //   maintainAspectRatio: false,
  // };

  get randomData() {
    return Math.round(Math.random() * 100);
  }

  ngOnInit(): void {
    this.initializeDefaultDateRange();
    this.loadDataForDateRange();
  }

  /**
   * Inicializa el rango de fechas por defecto (mes actual)
   */
  private initializeDefaultDateRange(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    // Primer día del mes
    this.selectedDateRange.startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    
    // Último día del mes
    const lastDay = new Date(year, month, 0).getDate();
    this.selectedDateRange.endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay} 23:59:59`;
  }

  /**
   * Carga datos para el rango de fechas seleccionado
   */
  private loadDataForDateRange(): void {
    this.isLoadingData = true;
    
    const filter = {
      limit: 5000,
      fechaInicio: this.selectedDateRange.startDate,
      fechaFin: this.selectedDateRange.endDate
    };

    this.parquetDataService.getFilteredData(filter)
      .pipe(
        catchError(error => {
          console.error('Error al cargar datos de la API en historial:', error);
          this.isLoadingData = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.currentApiData = response.data;
        } else {
          this.currentApiData = [];
        }
        this.isLoadingData = false;
      });
  }

  /**
   * Actualiza el rango de fechas y recarga los datos
   * @param dateRange Objeto con startDate y endDate
   */
  public updateDateRange(dateRange: {startDate: string, endDate: string}): void {
    this.selectedDateRange.startDate = dateRange.startDate;
    this.selectedDateRange.endDate = dateRange.endDate + ' 23:59:59';
    this.loadDataForDateRange();
  }

  /**
   * Formatea una fecha para mostrar en la interfaz
   * @param dateString Fecha en formato YYYY-MM-DD
   * @returns Fecha formateada en español
   */
  public formatDisplayDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  }

}
