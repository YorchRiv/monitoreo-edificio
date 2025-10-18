import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { 
  CardBodyComponent, 
  CardComponent, 
  CardHeaderComponent, 
  ColComponent, 
  RowComponent, 
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  WidgetStatBComponent,
  ProgressComponent
} from '@coreui/angular-pro';
import { SmartTablesBasicExampleComponent } from '../../smart-tables/smart-tables-basic-example/smart-tables-basic-example.component';
import { HistorialDatePickerComponent } from './historial-date-picker.component';
import { ParquetDataService, MedicionData } from '../../../services/parquet-data.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RowComponent, 
    ColComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardBodyComponent, 
    ChartjsComponent, 
    SmartTablesBasicExampleComponent, 
    HistorialDatePickerComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    WidgetStatBComponent,
    ProgressComponent
  ],
})
export class ChartsComponent implements OnInit {

  // Precio por kWh obtenido de la configuración
  private get PRECIO_KWH(): number {
    const parametros = localStorage.getItem('parametrosMonitoreo');
    if (parametros) {
      const valores = JSON.parse(parametros);
      return valores.valorKwh;
    }
    return 1.51; // Valor por defecto si no hay configuración
  }

  // Datos para la tabla
  public currentApiData: MedicionData[] = [];
  public filteredApiData: MedicionData[] = [];
  public isLoadingData: boolean = false;
  public selectedDateRange = {
    startDate: '',
    endDate: ''
  };

  // Filtros avanzados
  public filtersForm: FormGroup;
  public availableBuildings: string[] = [];
  public availableZones: string[] = [];
  public availableLevels: string[] = [];
  public allApiData: MedicionData[] = []; // Datos sin filtrar para mantener referencia

  // Títulos dinámicos para los gráficos
  public barChartTitle: string = 'Consumo (GTQ)';
  public doughnutChartTitle: string = 'Distribución de Consumo por Edificio (kWh)';

  // Estadísticas agregadas
  public voltajePromedio: number = 0;
  public amperajeSuma: number = 0;
  public consumoKwhSuma: number = 0;
  public consumoGtqSuma: number = 0;

  // Paleta de colores para las zonas
  private readonly zoneColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#C9CBCF', '#41B883', '#E46651', '#00D8FF',
    '#DD1B16', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3'
  ];

  constructor(
    private parquetDataService: ParquetDataService,
    private formBuilder: FormBuilder
  ) {
    // Inicializar el formulario de filtros
    this.filtersForm = this.formBuilder.group({
      edificios: this.formBuilder.group({}),
      zonas: this.formBuilder.group({}),
      niveles: this.formBuilder.group({})
    });
  }

  options = {
    maintainAspectRatio: false
  };

  barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: Q.${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true, // Habilitar barras apiladas
        title: {
          display: true,
          text: 'Costo (GTQ)'
        },
        ticks: {
          callback: function(value: any) {
            return `Q.${value.toFixed(2)}`;
          }
        }
      },
      x: {
        stacked: true, // Habilitar barras apiladas
        title: {
          display: true,
          text: 'Edificios'
        }
      }
    }
  };

  doughnutChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toFixed(2)} kWh (${percentage}%)`;
          }
        }
      }
    }
  };

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  chartBarData: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Consumo Eléctrico (GTQ)',
        backgroundColor: '#f87979',
        data: []
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
    labels: [],
    datasets: [
      {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#E7E9ED'],
        data: []
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
    // Inicializar títulos por defecto
    this.updateChartTitles();
    // No cargar datos inmediatamente, esperar a que el datepicker emita las fechas
    // El datepicker emitirá las fechas por defecto en su ngOnInit
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
          this.allApiData = response.data;
          this.currentApiData = response.data;
          
          // Extraer valores únicos y crear controles de filtro
          this.extractUniqueValues();
          
          // Aplicar filtros iniciales (todos seleccionados por defecto)
          this.applyFilters();
        } else {
          this.allApiData = [];
          this.currentApiData = [];
          this.availableBuildings = [];
          this.availableZones = [];
          this.availableLevels = [];
        }
        this.isLoadingData = false;
        // Actualizar gráficos con los nuevos datos
        this.updateCharts();
      });
  }

  /**
   * Actualiza el rango de fechas y recarga los datos
   * @param dateRange Objeto con startDate y endDate
   */
  public updateDateRange(dateRange: {startDate: string, endDate: string}): void {
    this.selectedDateRange.startDate = dateRange.startDate;
    this.selectedDateRange.endDate = dateRange.endDate + ' 23:59:59';
    // Actualizar títulos inmediatamente con las nuevas fechas
    this.updateChartTitles();
    this.loadDataForDateRange();
  }

  /**
   * Formatea una fecha para mostrar en la interfaz
   * @param dateString Fecha en formato YYYY-MM-DD
   * @returns Fecha formateada en español
   */
  public formatDisplayDate(dateString: string): string {
    if (!dateString) return '';
    
    // Parsear manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }

  /**
   * Procesa los datos de la API para generar información por edificio y zona
   * @returns Objeto con datos agrupados por edificio y zona
   */
  private processDataByBuildingAndZone(): { 
    buildings: string[], 
    zones: string[], 
    data: { [key: string]: { [key: string]: { consumoKwh: number, costoTotal: number } } },
    flatData: { edificio: string, zona: string, consumoKwh: number, costoTotal: number, label: string }[]
  } {
    const buildingZoneData: { [key: string]: { [key: string]: { consumoKwh: number, costoTotal: number } } } = {};
    const buildings = new Set<string>();
    const zones = new Set<string>();

    this.currentApiData.forEach(medicion => {
      const edificio = medicion.edificio_nombre;
      const zona = medicion.zona_nombre;
      const consumoKwh = medicion.energia_acumulada_calc || 0;

      buildings.add(edificio);
      zones.add(zona);

      if (!buildingZoneData[edificio]) {
        buildingZoneData[edificio] = {};
      }

      if (!buildingZoneData[edificio][zona]) {
        buildingZoneData[edificio][zona] = { consumoKwh: 0, costoTotal: 0 };
      }

      buildingZoneData[edificio][zona].consumoKwh += consumoKwh;
      buildingZoneData[edificio][zona].costoTotal = buildingZoneData[edificio][zona].consumoKwh * this.PRECIO_KWH;
    });

    // Crear datos planos para el gráfico de pastel
    const flatData: { edificio: string, zona: string, consumoKwh: number, costoTotal: number, label: string }[] = [];
    Object.keys(buildingZoneData).forEach(edificio => {
      Object.keys(buildingZoneData[edificio]).forEach(zona => {
        const data = buildingZoneData[edificio][zona];
        flatData.push({
          edificio,
          zona,
          consumoKwh: data.consumoKwh,
          costoTotal: data.costoTotal,
          label: `${edificio} - ${zona}`
        });
      });
    });

    return {
      buildings: Array.from(buildings),
      zones: Array.from(zones),
      data: buildingZoneData,
      flatData
    };
  }

  /**
   * Actualiza el gráfico de barras con datos de consumo por edificio y zona
   */
  private updateBarChart(): void {
    const processedData = this.processDataByBuildingAndZone();
    const { buildings, zones, data } = processedData;

    // Crear datasets para cada zona
    const datasets = zones.map((zona, index) => {
      const zoneData = buildings.map(edificio => {
        return data[edificio] && data[edificio][zona] ? data[edificio][zona].costoTotal : 0;
      });

      return {
        label: zona,
        backgroundColor: this.zoneColors[index % this.zoneColors.length],
        data: zoneData,
        stack: 'Stack 0' // Para hacer barras apiladas
      };
    });

    this.chartBarData = {
      labels: buildings,
      datasets: datasets
    };
  }

  /**
   * Actualiza el gráfico de doughnut con distribución del consumo por edificio
   */
  private updateDoughnutChart(): void {
    const processedData = this.processDataByBuildingAndZone();
    const { buildings, data } = processedData;

    // Agregar consumo total por edificio
    const buildingTotals = buildings.map(edificio => {
      let totalConsumo = 0;
      Object.keys(data[edificio] || {}).forEach(zona => {
        totalConsumo += data[edificio][zona].consumoKwh;
      });
      return totalConsumo;
    });

    const colors = buildings.map((_, index) => this.zoneColors[index % this.zoneColors.length]);

    this.chartDoughnutData = {
      labels: buildings,
      datasets: [
        {
          backgroundColor: colors,
          data: buildingTotals
        }
      ]
    };
  }

  /**
   * Genera el texto del período para mostrar en los títulos
   * @returns Texto formateado con el período seleccionado
   */
  private getPeriodText(): string {
    if (this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
      const startFormatted = this.formatDisplayDate(this.selectedDateRange.startDate);
      const endFormatted = this.formatDisplayDate(this.selectedDateRange.endDate.split(' ')[0]);
      return ` (${startFormatted} - ${endFormatted})`;
    }
    return '';
  }

  /**
   * Actualiza los títulos de los gráficos con el período seleccionado
   */
  private updateChartTitles(): void {
    const periodText = this.getPeriodText();
    this.barChartTitle = `Consumo (GTQ)${periodText}`;
    this.doughnutChartTitle = `Distribución de Consumo por Edificio (kWh)${periodText}`;
  }

  /**
   * Actualiza todos los gráficos con los nuevos datos
   */
  private updateCharts(): void {
    if (this.currentApiData && this.currentApiData.length > 0) {
      this.updateBarChart();
      this.updateDoughnutChart();
    } else {
      // Reiniciar gráficos si no hay datos
      this.resetCharts();
    }
  }

  /**
   * Reinicia los gráficos cuando no hay datos
   */
  private resetCharts(): void {
    this.chartBarData = {
      labels: [],
      datasets: []
    };

    this.chartDoughnutData = {
      labels: [],
      datasets: [
        {
          backgroundColor: this.zoneColors,
          data: []
        }
      ]
    };
  }

  /**
   * Extrae los valores únicos de edificios, zonas y niveles de los datos
   */
  private extractUniqueValues(): void {
    if (this.allApiData.length === 0) return;

    const buildings = new Set<string>();
    const zones = new Set<string>();
    const levels = new Set<string>();

    this.allApiData.forEach(medicion => {
      buildings.add(medicion.edificio_nombre);
      zones.add(medicion.zona_nombre);
      levels.add(medicion.nivel_nombre);
    });

    this.availableBuildings = Array.from(buildings).sort();
    this.availableZones = Array.from(zones).sort();
    this.availableLevels = Array.from(levels).sort();

    // Inicializar los controles del formulario
    this.initializeFilterControls();
  }

  /**
   * Inicializa los controles del formulario con los valores únicos
   */
  private initializeFilterControls(): void {
    const edificiosGroup = this.formBuilder.group({});
    const zonasGroup = this.formBuilder.group({});
    const nivelesGroup = this.formBuilder.group({});

    // Crear controles para edificios
    this.availableBuildings.forEach(building => {
      const controlName = this.getFormControlName(building);
      edificiosGroup.addControl(controlName, this.formBuilder.control(true));
    });

    // Crear controles para zonas
    this.availableZones.forEach(zone => {
      const controlName = this.getFormControlName(zone);
      zonasGroup.addControl(controlName, this.formBuilder.control(true));
    });

    // Crear controles para niveles
    this.availableLevels.forEach(level => {
      const controlName = this.getFormControlName(level);
      nivelesGroup.addControl(controlName, this.formBuilder.control(true));
    });

    // Actualizar el formulario
    this.filtersForm.setControl('edificios', edificiosGroup);
    this.filtersForm.setControl('zonas', zonasGroup);
    this.filtersForm.setControl('niveles', nivelesGroup);
  }

  /**
   * Convierte un nombre en un nombre válido para FormControl
   */
  public getFormControlName(name: string): string {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  }

  /**
   * Alterna todos los checkboxes de edificios
   */
  public toggleAllBuildings(): void {
    const edificiosGroup = this.filtersForm.get('edificios') as FormGroup;
    const allSelected = this.availableBuildings.every(building => {
      const controlName = this.getFormControlName(building);
      return edificiosGroup.get(controlName)?.value;
    });

    this.availableBuildings.forEach(building => {
      const controlName = this.getFormControlName(building);
      edificiosGroup.get(controlName)?.setValue(!allSelected);
    });

    this.onFilterChange();
  }

  /**
   * Alterna todos los checkboxes de zonas
   */
  public toggleAllZones(): void {
    const zonasGroup = this.filtersForm.get('zonas') as FormGroup;
    const allSelected = this.availableZones.every(zone => {
      const controlName = this.getFormControlName(zone);
      return zonasGroup.get(controlName)?.value;
    });

    this.availableZones.forEach(zone => {
      const controlName = this.getFormControlName(zone);
      zonasGroup.get(controlName)?.setValue(!allSelected);
    });

    this.onFilterChange();
  }

  /**
   * Alterna todos los checkboxes de niveles
   */
  public toggleAllLevels(): void {
    const nivelesGroup = this.filtersForm.get('niveles') as FormGroup;
    const allSelected = this.availableLevels.every(level => {
      const controlName = this.getFormControlName(level);
      return nivelesGroup.get(controlName)?.value;
    });

    this.availableLevels.forEach(level => {
      const controlName = this.getFormControlName(level);
      nivelesGroup.get(controlName)?.setValue(!allSelected);
    });

    this.onFilterChange();
  }

  /**
   * Resetea todos los filtros a seleccionado
   */
  public resetFilters(): void {
    this.availableBuildings.forEach(building => {
      const controlName = this.getFormControlName(building);
      this.filtersForm.get(['edificios', controlName])?.setValue(true);
    });

    this.availableZones.forEach(zone => {
      const controlName = this.getFormControlName(zone);
      this.filtersForm.get(['zonas', controlName])?.setValue(true);
    });

    this.availableLevels.forEach(level => {
      const controlName = this.getFormControlName(level);
      this.filtersForm.get(['niveles', controlName])?.setValue(true);
    });

    this.applyFilters();
  }

  /**
   * Se ejecuta cuando cambia algún checkbox
   */
  public onFilterChange(): void {
    // Opcional: aplicar filtros automáticamente en cada cambio
    // this.applyFilters();
  }

  /**
   * Aplica los filtros seleccionados a los datos
   */
  public applyFilters(): void {
    // Obtener los valores seleccionados
    const selectedBuildings = this.getSelectedValues('edificios');
    const selectedZones = this.getSelectedValues('zonas');
    const selectedLevels = this.getSelectedValues('niveles');

    // Filtrar los datos
    this.filteredApiData = this.allApiData.filter(medicion => {
      const buildingSelected = selectedBuildings.includes(medicion.edificio_nombre);
      const zoneSelected = selectedZones.includes(medicion.zona_nombre);
      const levelSelected = selectedLevels.includes(medicion.nivel_nombre);

      return buildingSelected && zoneSelected && levelSelected;
    });

    // Actualizar currentApiData que es lo que usan los gráficos
    this.currentApiData = this.filteredApiData;

    // Calcular estadísticas con los datos filtrados
    this.calculateStatistics();

    // Regenerar gráficos con los datos filtrados
    this.updateCharts();
  }

  /**
   * Obtiene los valores seleccionados para un tipo de filtro
   */
  private getSelectedValues(filterType: 'edificios' | 'zonas' | 'niveles'): string[] {
    const group = this.filtersForm.get(filterType) as FormGroup;
    const selectedValues: string[] = [];
    
    let availableItems: string[] = [];
    switch(filterType) {
      case 'edificios':
        availableItems = this.availableBuildings;
        break;
      case 'zonas':
        availableItems = this.availableZones;
        break;
      case 'niveles':
        availableItems = this.availableLevels;
        break;
    }

    availableItems.forEach(item => {
      const controlName = this.getFormControlName(item);
      if (group.get(controlName)?.value) {
        selectedValues.push(item);
      }
    });

    return selectedValues;
  }

  /**
   * Calcula las estadísticas agregadas de los datos actuales
   */
  private calculateStatistics(): void {
    if (this.currentApiData.length === 0) {
      this.voltajePromedio = 0;
      this.amperajeSuma = 0;
      this.consumoKwhSuma = 0;
      this.consumoGtqSuma = 0;
      return;
    }

    // Calcular suma de voltajes para obtener promedio
    const totalVoltaje = this.currentApiData.reduce((sum, medicion) => sum + (medicion.voltaje || 0), 0);
    this.voltajePromedio = totalVoltaje / this.currentApiData.length;

    // Calcular suma de corriente (amperaje)
    this.amperajeSuma = this.currentApiData.reduce((sum, medicion) => sum + (medicion.corriente || 0), 0);

    // Calcular suma de consumo en kWh
    this.consumoKwhSuma = this.currentApiData.reduce((sum, medicion) => sum + (medicion.energia_acumulada_calc || 0), 0);

    // Calcular consumo en GTQ (kWh * precio)
    this.consumoGtqSuma = this.consumoKwhSuma * this.PRECIO_KWH;
  }

  /**
   * Calcula el porcentaje de progreso para las barras de los widgets
   * @param currentValue Valor actual
   * @param maxValue Valor máximo para calcular el porcentaje
   * @returns Porcentaje entre 0 y 100
   */
  public getProgressValue(currentValue: number, maxValue: number): number {
    if (maxValue === 0) return 0;
    const percentage = (currentValue / maxValue) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Limitar entre 0 y 100
  }

}
