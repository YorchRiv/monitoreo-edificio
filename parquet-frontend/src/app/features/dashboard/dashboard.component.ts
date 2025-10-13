import { Component, OnInit, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ParquetService } from '../../core/services/parquet.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { Medicion, ParquetStats, ParquetDataResponse } from '../../core/models/parquet.model';

// 🔥 REGISTRAR TODOS LOS COMPONENTES DE CHART.JS
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private parquetService = inject(ParquetService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Datos
  mediciones: Medicion[] = [];
  displayedMediciones: Medicion[] = []; // 🔥 DATOS QUE SE MUESTRAN EN STREAMING
  stats: ParquetStats | null = null;
  
  // Estado
  isLoading = false;
  isUploading = false;
  isStreaming = false; // 🔥 NUEVO ESTADO PARA STREAMING
  errorMessage = '';
  autoUpload = true;

  // Streaming
  private streamingInterval: any;
  private currentStreamIndex = 0;
  private chartUpdateThrottle: any;
  private recentRowIds = new Set<number>(); // 🔥 PARA DETECTAR FILAS RECIENTES

  // 🔥 VALORES ALEATORIOS ENTRE 1000-5000 REGISTROS Y 500-2500MS
  private getRandomBatchSize(): number {
    return Math.floor(Math.random() * 4000) + 1000; // 1000-5000 registros
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * 2000) + 500; // 500-2500ms (0.5-2.5 segundos)
  }

  // Filtros
  selectedEdificio = '';
  selectedZona = '';
  limit = 10000;

  // Archivos
  selectedFile: File | null = null;
  currentFilePath: string | null = null;

  // 🔥 CONFIGURACIONES SEPARADAS PARA CADA GRÁFICA

  // Gráfica de Voltaje
  voltajeChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  voltajeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: { 
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Voltaje (V)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Muestras'
        }
      }
    },
    animation: {
      duration: 300 // 🔥 ANIMACIÓN MÁS RÁPIDA
    }
  };

  // Gráfica de Corriente
  corrienteChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  corrienteChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: { 
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Corriente (A)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Muestras'
        }
      }
    },
    animation: {
      duration: 300
    }
  };

  // Gráfica de Potencia
  potenciaChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  potenciaChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: { 
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Potencia (W)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Muestras'
        }
      }
    },
    animation: {
      duration: 300
    }
  };

  // Gráfica de Barras (Energía por Edificio)
  barChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energía (kWh)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Edificios'
        }
      }
    },
    animation: {
      duration: 300
    }
  };

  // Tipos de gráficas
  lineChartType: ChartType = 'line';
  barChartType: ChartType = 'bar';

  ngOnInit(): void {
    console.log('🚀 Dashboard iniciado - Upload automático activado');
  }

  ngOnDestroy(): void {
    // 🔥 LIMPIAR STREAMING AL DESTRUIR COMPONENTE
    this.stopStreaming();
    if (this.chartUpdateThrottle) {
      clearTimeout(this.chartUpdateThrottle);
    }
  }

  onAutoUploadChange(): void {
    if (this.autoUpload) {
      console.log('✅ Upload automático activado');
    } else {
      console.log('⏸️ Upload automático desactivado');
    }
  }

  // ----------------- Selección de archivo -----------------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('📁 Archivo seleccionado:', this.selectedFile.name);
      
      if (this.autoUpload && this.selectedFile) {
        console.log('🚀 Iniciando upload automático...');
        this.uploadParquet();
      }
    }
  }

  // ----------------- Subir archivo -----------------
  uploadParquet(): void {
    if (!this.selectedFile) {
      alert('❌ No has seleccionado un archivo');
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';

    console.log('📤 Subiendo archivo:', this.selectedFile.name);

    this.parquetService.uploadFile(this.selectedFile).subscribe({
      next: (response: any) => {
        console.log('✅ Archivo subido:', response);
        this.currentFilePath = response.ruta_archivo;
        this.isUploading = false;
        
        this.showSuccessMessage(`✅ Archivo subido correctamente: ${response.total_registros} registros`);
        this.processCurrentFile();
      },
      error: (err) => {
        console.error('❌ Error al subir archivo:', err);
        this.isUploading = false;
        this.showErrorMessage(err.error?.message || 'Error al subir archivo');
      }
    });
  }

  processCurrentFile(): void {
    if (!this.currentFilePath) {
      alert('❌ No hay archivo actual para procesar');
      return;
    }

    console.log('🔄 Procesando archivo actual:', this.currentFilePath);
    this.loadStats();
    this.loadData();
  }

  // ==================== CARGA DE DATOS CON STREAMING ====================

  loadData(): void {
    if (!this.currentFilePath) return;

    this.isLoading = true;
    this.isStreaming = false; // 🔥 DETENER STREAMING ANTERIOR
    this.errorMessage = '';
    this.displayedMediciones = []; // 🔥 LIMPIAR DATOS MOSTRADOS
    this.recentRowIds.clear(); // 🔥 LIMPIAR FILAS RECIENTES

    const query = {
      filePath: this.currentFilePath,
      limit: this.limit,
      edificio: this.selectedEdificio || undefined,
      zona: this.selectedZona || undefined
    };

    console.log('📊 Cargando datos con query:', query);

    this.parquetService.getData(query).subscribe({
      next: (response: any) => {
        this.mediciones = response.data || response.datos || [];
        console.log('✅ Datos cargados para streaming:', this.mediciones.length);
        
        // 🔥 INICIAR STREAMING
        this.startStreaming();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar datos:', err);
        this.errorMessage = err.error?.message || 'Error al cargar datos';
        this.isLoading = false;
        this.showErrorMessage(this.errorMessage);
      }
    });
  }

  // 🔥 MÉTODO PARA INICIAR STREAMING
  private startStreaming(): void {
    this.stopStreaming(); // 🔥 DETENER STREAMING ANTERIOR
    
    this.isStreaming = true;
    this.currentStreamIndex = 0;
    this.displayedMediciones = [];
    this.recentRowIds.clear();

    console.log('🎬 Iniciando streaming de datos...');

    this.streamingInterval = setInterval(() => {
      if (this.currentStreamIndex >= this.mediciones.length) {
        // 🔥 STREAMING COMPLETADO
        this.stopStreaming();
        this.showSuccessMessage(`✅ Streaming completado: ${this.mediciones.length} registros procesados`);
        return;
      }

      // 🔥 AGREGAR NUEVO LOTE DE DATOS
      const endIndex = Math.min(
        this.currentStreamIndex + this.getRandomBatchSize(),
        this.mediciones.length
      );
      
      const newBatch = this.mediciones.slice(this.currentStreamIndex, endIndex);
      
      // 🔥 MARCAR FILAS RECIENTES PARA ANIMACIONES
      newBatch.forEach(medicion => {
        this.recentRowIds.add(medicion.id_medicion);
      });

      this.displayedMediciones = [...this.displayedMediciones, ...newBatch];
      this.currentStreamIndex = endIndex;

      // 🔥 ACTUALIZAR GRÁFICAS INMEDIATAMENTE CON CADA NUEVO DATO
      this.throttledChartUpdate();

      // 🔥 ACTUALIZAR CONTADOR EN TIEMPO REAL
      this.updateStreamingProgress();

    }, this.getRandomDelay());
  }

  // 🔥 THROTTLE PARA ACTUALIZAR GRÁFICAS (EVITA SOBRECARGA)
  private throttledChartUpdate(): void {
    if (this.chartUpdateThrottle) {
      clearTimeout(this.chartUpdateThrottle);
    }

    this.chartUpdateThrottle = setTimeout(() => {
      this.updateCharts();
    }, 50); // 🔥 ACTUALIZAR CADA 50ms MÁXIMO
  }

  // 🔥 MÉTODO PARA DETENER STREAMING
  private stopStreaming(): void {
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
    this.isStreaming = false;
    
    // 🔥 LIMPIAR FILAS RECIENTES AL DETENER STREAMING
    setTimeout(() => {
      this.recentRowIds.clear();
    }, 1000);
    
    // 🔥 ACTUALIZAR GRÁFICAS FINALES
    if (this.displayedMediciones.length > 0) {
      this.updateCharts();
    }
  }

  // 🔥 ACTUALIZAR PROGRESO DEL STREAMING
  private updateStreamingProgress(): void {
    const progress = ((this.currentStreamIndex / this.mediciones.length) * 100).toFixed(1);
    console.log(`📊 Streaming: ${this.currentStreamIndex}/${this.mediciones.length} (${progress}%)`);
  }

  // 🔥 MÉTODO PARA FORZAR DETENCIÓN DEL STREAMING
  stopStreamingManually(): void {
    this.stopStreaming();
    this.showSuccessMessage('⏹️ Streaming detenido manualmente');
  }

  // 🔥 MÉTODO PARA REINICIAR STREAMING
  restartStreaming(): void {
    if (this.mediciones.length > 0) {
      this.startStreaming();
    }
  }

  loadStats(): void {
    if (!this.currentFilePath) return;

    this.parquetService.getStats(this.currentFilePath).subscribe({
      next: (stats: ParquetStats) => {
        this.stats = stats;
        console.log('📊 Estadísticas cargadas:', stats);
      },
      error: (err) => {
        console.error('❌ Error al cargar estadísticas:', err);
        this.showErrorMessage('Error al cargar estadísticas');
      }
    });
  }

  // ==================== FILTROS ====================

  applyFilters(): void {
    console.log('🔍 Aplicando filtros...');
    this.stopStreaming(); // 🔥 DETENER STREAMING AL APLICAR FILTROS
    this.loadData();
  }

  clearFilters(): void {
    this.selectedEdificio = '';
    this.selectedZona = '';
    this.limit = 1000;
    console.log('🗑️ Filtros limpiados');
    this.stopStreaming(); // 🔥 DETENER STREAMING AL LIMPIAR FILTROS
    this.loadData();
  }

  // ==================== GRÁFICAS SEPARADAS ====================

  updateCharts(): void {
    if (!this.displayedMediciones.length) {
      console.log('⚠️ No hay datos para actualizar gráficas');
      return;
    }

    // 🔥 ACTUALIZAR TODAS LAS GRÁFICAS SEPARADAS
    this.updateVoltajeChart();
    this.updateCorrienteChart();
    this.updatePotenciaChart();
    this.updateBarChart();

    // 🔥 FORZAR ACTUALIZACIÓN INMEDIATA DEL CHART
    setTimeout(() => {
      this.chart?.update();
    }, 0);
  }

  // 🔥 GRÁFICA DE VOLTAJE INDIVIDUAL
  updateVoltajeChart(): void {
    const maxPoints = 200;
    const dataForChart = this.displayedMediciones.length > maxPoints 
      ? this.displayedMediciones.slice(-maxPoints)
      : this.displayedMediciones;

    this.voltajeChartData = {
      labels: dataForChart.map((_, i) => {
        const totalPoints = this.displayedMediciones.length;
        if (totalPoints <= maxPoints) return `Muestra ${i + 1}`;
        return `Muestra ${totalPoints - maxPoints + i + 1}`;
      }),
      datasets: [
        {
          data: dataForChart.map(m => m.voltaje),
          label: 'Voltaje (V)',
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          fill: true
        }
      ]
    };
  }

  // 🔥 GRÁFICA DE CORRIENTE INDIVIDUAL
  updateCorrienteChart(): void {
    const maxPoints = 200;
    const dataForChart = this.displayedMediciones.length > maxPoints 
      ? this.displayedMediciones.slice(-maxPoints)
      : this.displayedMediciones;

    this.corrienteChartData = {
      labels: dataForChart.map((_, i) => {
        const totalPoints = this.displayedMediciones.length;
        if (totalPoints <= maxPoints) return `Muestra ${i + 1}`;
        return `Muestra ${totalPoints - maxPoints + i + 1}`;
      }),
      datasets: [
        {
          data: dataForChart.map(m => m.corriente),
          label: 'Corriente (A)',
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          fill: true
        }
      ]
    };
  }

  // 🔥 GRÁFICA DE POTENCIA INDIVIDUAL
  updatePotenciaChart(): void {
    const maxPoints = 200;
    const dataForChart = this.displayedMediciones.length > maxPoints 
      ? this.displayedMediciones.slice(-maxPoints)
      : this.displayedMediciones;

    this.potenciaChartData = {
      labels: dataForChart.map((_, i) => {
        const totalPoints = this.displayedMediciones.length;
        if (totalPoints <= maxPoints) return `Muestra ${i + 1}`;
        return `Muestra ${totalPoints - maxPoints + i + 1}`;
      }),
      datasets: [
        {
          data: dataForChart.map(m => m.potencia_calc),
          label: 'Potencia (W)',
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          fill: true
        }
      ]
    };
  }

  // 🔥 GRÁFICA DE BARRAS (ENERGÍA POR EDIFICIO)
  updateBarChart(): void {
    const energiaPorEdificio = this.displayedMediciones.reduce((acc, m) => {
      if (!acc[m.edificio_nombre]) acc[m.edificio_nombre] = 0;
      acc[m.edificio_nombre] += m.energia_acumulada_calc;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#ed64a6', '#38b2ac'];

    this.barChartData = {
      labels: Object.keys(energiaPorEdificio),
      datasets: [
        {
          data: Object.values(energiaPorEdificio),
          label: 'Energía Acumulada (kWh)',
          backgroundColor: Object.keys(energiaPorEdificio).map((_, i) => 
            colors[i % colors.length]
          ),
          borderColor: '#2d3748',
          borderWidth: 1
        }
      ]
    };
  }

  // ==================== MENSAJES DE USUARIO ====================

  private showSuccessMessage(message: string): void {
    console.log('✅', message);
    // Aquí puedes agregar un toast service si lo tienes
  }

  private showErrorMessage(message: string): void {
    console.error('❌', message);
  }

  // ==================== UTILIDADES ====================

  clearFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.selectedFile = null;
  }

  // ==================== MÉTODOS PARA STREAMING OPTIMIZADO ====================

  // 🔥 GETTER PARA MOSTRAR PROGRESO EN TEMPLATE
  get streamingProgress(): string {
    if (this.mediciones.length === 0) return '0%';
    return ((this.currentStreamIndex / this.mediciones.length) * 100).toFixed(1) + '%';
  }

  // 🔥 GETTER PARA BARRA DE PROGRESO (NUMÉRICO)
  get streamingProgressValue(): number {
    if (this.mediciones.length === 0) return 0;
    return (this.currentStreamIndex / this.mediciones.length) * 100;
  }

  get isStreamingActive(): boolean {
    return this.isStreaming && this.currentStreamIndex < this.mediciones.length;
  }

  // 🔥 GETTER PARA DATOS VISIBLES EN TABLA (MÁS EFICIENTE)
  get visibleMediciones(): Medicion[] {
    return this.displayedMediciones.slice(-50);
  }

  // 🔥 MÉTODO PARA DETECTAR FILAS RECIENTES (PARA ANIMACIONES)
  isRecentRow(medicion: Medicion): boolean {
    return this.recentRowIds.has(medicion.id_medicion);
  }

  // 🔥 MÉTODO PARA VERIFICAR SI ESTÁ EN MODO PERFORMANCE
  get isPerformanceMode(): boolean {
    return this.displayedMediciones.length > 1000;
  }
}