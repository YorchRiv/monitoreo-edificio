import { NgStyle, NgIf } from '@angular/common';
import { Component, DestroyRef, DOCUMENT, effect, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import { SmartTablesBasicExampleComponent } from '../smart-tables/smart-tables-basic-example/smart-tables-basic-example.component';
import { SmartTablesSelectableExampleComponent } from '../smart-tables/smart-tables-selectable-example/smart-tables-selectable-example.component';
import { SmartTablesDownloadableExampleComponent } from '../smart-tables/smart-tables-downloadable-example/smart-tables-downloadable-example.component';
import { ParquetDataService, MedicionData } from '../../services/parquet-data.service';
import { DataProcessingService } from '../../services/data-processing.service';
import { catchError, of, forkJoin } from 'rxjs';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular-pro';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';

import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';

interface IUser {
  name: string;
  state: string;
  registered: string;
  country: string;
  usage: number;
  period: string;
  payment: string;
  activity: string;
  avatar: string;
  status: string;
  color: string;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [WidgetsDropdownComponent, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, NgIf, CardFooterComponent, GutterDirective, ProgressComponent, WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent, SmartTablesBasicExampleComponent, SmartTablesSelectableExampleComponent, SmartTablesDownloadableExampleComponent],
})
export class DashboardComponent implements OnInit {
  public trafficPeriodLabel: string = '';
  public isLoadingData: boolean = false;
  public currentApiData: MedicionData[] = [];
  public previousApiData: MedicionData[] = [];

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);
  readonly #parquetDataService: ParquetDataService = inject(ParquetDataService);
  readonly #dataProcessingService: DataProcessingService = inject(DataProcessingService);

  public users: IUser[] = [
    {
      name: 'Yiorgos Avraamu',
      state: 'New',
      registered: 'Jan 1, 2021',
      country: 'Us',
      usage: 50,
      period: 'Jun 11, 2021 - Jul 10, 2021',
      payment: 'Mastercard',
      activity: '10 sec ago',
      avatar: './assets/images/avatars/1.jpg',
      status: 'success',
      color: 'success'
    },
    {
      name: 'Avram Tarasios',
      state: 'Recurring ',
      registered: 'Jan 1, 2021',
      country: 'Br',
      usage: 10,
      period: 'Jun 11, 2021 - Jul 10, 2021',
      payment: 'Visa',
      activity: '5 minutes ago',
      avatar: './assets/images/avatars/2.jpg',
      status: 'danger',
      color: 'info'
    },
    {
      name: 'Quintin Ed',
      state: 'New',
      registered: 'Jan 1, 2021',
      country: 'In',
      usage: 74,
      period: 'Jun 11, 2021 - Jul 10, 2021',
      payment: 'Stripe',
      activity: '1 hour ago',
      avatar: './assets/images/avatars/3.jpg',
      status: 'warning',
      color: 'warning'
    },
    {
      name: 'Enéas Kwadwo',
      state: 'Sleep',
      registered: 'Jan 1, 2021',
      country: 'Fr',
      usage: 98,
      period: 'Jun 11, 2021 - Jul 10, 2021',
      payment: 'Paypal',
      activity: 'Last month',
      avatar: './assets/images/avatars/4.jpg',
      status: 'secondary',
      color: 'danger'
    },
    {
      name: 'Agapetus Tadeáš',
      state: 'New',
      registered: 'Jan 1, 2021',
      country: 'Es',
      usage: 22,
      period: 'Jun 11, 2021 - Jul 10, 2021',
      payment: 'ApplePay',
      activity: 'Last week',
      avatar: './assets/images/avatars/5.jpg',
      status: 'success',
      color: 'primary'
    },
    {
      name: 'Friderik Dávid',
      state: 'New',
      registered: 'Jan 1, 2021',
      country: 'Pl',
      usage: 43,
      period: 'Jun 11, 2021 - Jul 10, 2021',
      payment: 'Amex',
      activity: 'Yesterday',
      avatar: './assets/images/avatars/6.jpg',
      status: 'info',
      color: 'dark'
    }
  ];

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Month')
  });
  public currentPeriod: string = 'Month';
  public currentConsumption: number = 0;

  ngOnInit(): void {
    this.currentPeriod = 'Month';
    this.updateTrafficPeriodLabel('Month');
    this.updateChartOnColorModeChange();
    this.loadDataForPeriod('Month');
  }

  initCharts(): void {
    this.mainChartRef()?.stop();
    this.mainChart = this.#chartsData.mainChart;
  }

  setTrafficPeriod(value: string): void {
    this.currentPeriod = value;
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.updateTrafficPeriodLabel(value);
    this.loadDataForPeriod(value);
  }

  /**
   * Carga datos de la API según el período seleccionado
   */
  loadDataForPeriod(period: string): void {
    this.isLoadingData = true;
    
    let currentFilter, previousFilter;
    switch (period) {
      case 'Day':
        currentFilter = this.#parquetDataService.getDayFilter();
        previousFilter = this.#parquetDataService.getPreviousDayFilter();
        break;
      case 'Month':
        currentFilter = this.#parquetDataService.getMonthFilter();
        previousFilter = this.#parquetDataService.getPreviousMonthFilter();
        break;
      case 'Year':
        currentFilter = this.#parquetDataService.getYearFilter();
        previousFilter = this.#parquetDataService.getPreviousYearFilter();
        break;
      default:
        currentFilter = this.#parquetDataService.getMonthFilter();
        previousFilter = this.#parquetDataService.getPreviousMonthFilter();
    }

    // Cargar datos actuales y anteriores en paralelo
    const currentRequest = this.#parquetDataService.getFilteredData(currentFilter);
    const previousRequest = this.#parquetDataService.getFilteredData(previousFilter);

    // Usar forkJoin para hacer ambas peticiones en paralelo
    forkJoin([currentRequest, previousRequest])
      .pipe(
        catchError(error => {
          console.error('Error al cargar datos de la API:', error);
          // En caso de error, usar datos estáticos como fallback
          this.#chartsData.initMainChart(period);
          this.initCharts();
          this.updateConsumption();
          this.isLoadingData = false;
          return of([null, null]);
        })
      )
      .subscribe(([currentResponse, previousResponse]) => {
        if (currentResponse && currentResponse.success) {
          // Guardar datos de la API
          this.currentApiData = currentResponse.data;
          this.previousApiData = previousResponse && previousResponse.success ? previousResponse.data : [];
          
          // Procesar datos de la API para el gráfico
          const processedData = this.#dataProcessingService.processDataForChart(currentResponse.data, period);
          
          // Actualizar gráfico con datos de la API
          this.#chartsData.updateChartWithApiData(processedData);
          this.initCharts();
          
          // Actualizar consumo con el valor calculado
          this.currentConsumption = processedData.totalConsumption;
        }
        this.isLoadingData = false;
      });
  }

  updateConsumption(): void {
    this.currentConsumption = this.#chartsData.getCurrentConsumption(this.currentPeriod);
  }

  updateTrafficPeriodLabel(period: string): void {
    const today = new Date();
    if (period === 'Day') {
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      this.trafficPeriodLabel = `Hoy ${dd}/${mm}/${yyyy}`;
    } else if (period === 'Month') {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const month = monthNames[today.getMonth()];
      const yyyy = today.getFullYear();
      this.trafficPeriodLabel = `${month} ${yyyy}`;
    } else if (period === 'Year') {
      const yyyy = today.getFullYear();
      this.trafficPeriodLabel = `Enero - Diciembre ${yyyy}`;
    } else {
      this.trafficPeriodLabel = '';
    }
  }

  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  updateChartOnColorModeChange() {
    const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
      this.setChartStyles();
    });

    this.#destroyRef.onDestroy(() => {
      unListen();
    });
  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.mainChart.options };
        const scales = this.#chartsData.getScales();
        this.mainChartRef().options.scales = { ...options.scales, ...scales };
        this.mainChartRef().update();
      });
    }
  }
}
