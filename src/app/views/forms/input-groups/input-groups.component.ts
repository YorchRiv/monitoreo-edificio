import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormCheckInputDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular-pro';

@Component({
  selector: 'app-input-groups',
  templateUrl: './input-groups.component.html',
  imports: [
    RowComponent, 
    ColComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardBodyComponent, 
    InputGroupComponent, 
    InputGroupTextDirective, 
    FormControlDirective, 
    FormLabelDirective, 
    FormCheckInputDirective, 
    ButtonDirective, 
    DropdownComponent, 
    DropdownToggleDirective, 
    DropdownMenuDirective, 
    DropdownItemDirective, 
    RouterLink, 
    DropdownDividerDirective, 
    FormSelectDirective, 
    ReactiveFormsModule, 
    DecimalPipe
  ],
  standalone: true
})
export class InputGroupsComponent implements OnInit {
  parametrosForm: FormGroup;
  limiteDiario: number = 0;
  limiteMensual: number = 0;
  limiteAnual: number = 0;

  // Valores por defecto
  defaultValues = {
    valorKwh: 1.51,
    limiteMensualKwh: 15000,
    voltajeMinimo: 110,
    voltajeMaximo: 130
  };

  constructor(private fb: FormBuilder) {
    this.parametrosForm = this.fb.group({
      valorKwh: [this.defaultValues.valorKwh, [Validators.required, Validators.min(0)]],
      limiteMensualKwh: [this.defaultValues.limiteMensualKwh, [Validators.required, Validators.min(0)]],
      voltajeMinimo: [this.defaultValues.voltajeMinimo, [Validators.required, Validators.min(0)]],
      voltajeMaximo: [this.defaultValues.voltajeMaximo, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Cargar valores guardados si existen
    const valoresGuardados = localStorage.getItem('parametrosMonitoreo');
    if (valoresGuardados) {
      const valores = JSON.parse(valoresGuardados);
      this.parametrosForm.patchValue(valores);
      this.calcularLimites(valores.limiteMensualKwh);
    } else {
      this.calcularLimites(this.defaultValues.limiteMensualKwh);
    }
    
    // Suscribirse a cambios en el límite mensual
    this.parametrosForm.get('limiteMensualKwh')?.valueChanges.subscribe(valor => {
      if (valor) {
        this.calcularLimites(valor);
      }
    });
  }

  calcularLimites(limiteMensual: number) {
    // Redondear a 2 decimales para mejor precisión
    this.limiteDiario = parseFloat((limiteMensual / 30).toFixed(2)); // Aproximación simple de días por mes
    this.limiteMensual = parseFloat(limiteMensual.toFixed(2));
    this.limiteAnual = parseFloat((limiteMensual * 12).toFixed(2));
  }

  guardarCambios() {
    if (this.parametrosForm.valid) {
      const valores = {
        ...this.parametrosForm.value,
        limiteConsumoDiario: this.limiteDiario,
        limiteConsumoMensual: this.limiteMensual,
        limiteConsumoAnual: this.limiteAnual
      };
      try {
        localStorage.setItem('parametrosMonitoreo', JSON.stringify(valores));
        console.log('Valores guardados:', valores);
        alert('Cambios guardados exitosamente');
      } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar los cambios');
      }
    } else {
      alert('Por favor, verifica que todos los campos estén correctamente llenos');
    }
  }

  restablecerValores() {
    this.parametrosForm.patchValue(this.defaultValues);
    this.calcularLimites(this.defaultValues.limiteMensualKwh);
    // Guardar los valores por defecto en el localStorage
    const valores = {
      ...this.defaultValues,
      limiteConsumoDiario: this.limiteDiario,
      limiteConsumoMensual: this.limiteMensual,
      limiteConsumoAnual: this.limiteAnual
    };
    localStorage.setItem('parametrosMonitoreo', JSON.stringify(valores));
    console.log('Valores restablecidos a los valores por defecto:', valores);
  }
}
