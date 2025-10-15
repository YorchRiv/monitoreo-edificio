import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  DatePickerComponent as CoreUIDatePickerComponent,
  RowComponent,
  SpinnerComponent
} from '@coreui/angular-pro';

@Component({
  selector: 'app-historial-date-picker',
  template: `
    <c-row>
      <c-col xs="12">
        <c-card class="mb-4">
          <c-card-header>
            <strong>Historial de Consumo Electrico</strong>
          </c-card-header>
          <c-card-body>
            <form [formGroup]="dateForm">
              <c-row>
                <c-col lg="4">
                  <label>Fecha de Inicio:</label>
                  <c-date-picker 
                    formControlName="startDate"
                    locale="es-ES" 
                    closeOnSelect />
                </c-col>
                <c-col lg="4">
                  <label>Fecha de Fin:</label>
                  <c-date-picker 
                    formControlName="endDate"
                    locale="es-ES" 
                    closeOnSelect />
                </c-col>
                <c-col lg="4" class="d-flex align-items-end">
                  <button 
                    cButton 
                    color="primary" 
                    (click)="applyDateRange()"
                    [disabled]="!dateForm.valid || isLoading">
                    <c-spinner 
                      *ngIf="isLoading" 
                      size="sm" 
                      class="me-2">
                    </c-spinner>
                    {{ isLoading ? 'Cargando...' : 'Aplicar Filtro' }}
                  </button>
                </c-col>
              </c-row>
            </form>
          </c-card-body>
        </c-card>
      </c-col>
    </c-row>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RowComponent, 
    ColComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardBodyComponent, 
    CoreUIDatePickerComponent,
    ButtonDirective,
    SpinnerComponent
  ]
})
export class HistorialDatePickerComponent implements OnInit {
  @Output() dateRangeChange = new EventEmitter<{startDate: string, endDate: string}>();
  @Input() isLoading: boolean = false;

  dateForm: FormGroup;
  defaultStartDate: Date;
  defaultEndDate: Date;

  constructor() {
    // Inicializar fechas por defecto (primer día del mes actual hasta hoy)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Crear fechas específicas para evitar problemas de zona horaria
    this.defaultStartDate = new Date(year, month, 1, 12, 0, 0, 0); // Primer día del mes actual
    this.defaultEndDate = new Date(year, month, today.getDate(), 12, 0, 0, 0); // Día actual



    this.dateForm = new FormGroup({
      startDate: new FormControl(this.defaultStartDate),
      endDate: new FormControl(this.defaultEndDate)
    });
  }

  ngOnInit(): void {
    // Forzar los valores en los controles del formulario
    this.dateForm.patchValue({
      startDate: this.defaultStartDate,
      endDate: this.defaultEndDate
    });
    
    // Emitir las fechas por defecto al inicializar
    // Usar setTimeout para asegurar que el componente padre esté listo
    setTimeout(() => {
      this.emitDefaultDateRange();
    }, 100);
  }

  private emitDefaultDateRange(): void {
    const startDate = this.formatDate(this.defaultStartDate);
    const endDate = this.formatDate(this.defaultEndDate);
    this.dateRangeChange.emit({ startDate, endDate });
  }

  applyDateRange(): void {
    const startDate = this.dateForm.get('startDate')?.value;
    const endDate = this.dateForm.get('endDate')?.value;

    if (startDate && endDate) {
      // Validar que la fecha de inicio sea anterior a la fecha de fin
      if (new Date(startDate) > new Date(endDate)) {
        alert('La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }

      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
      
      this.dateRangeChange.emit({ 
        startDate: formattedStartDate, 
        endDate: formattedEndDate 
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}