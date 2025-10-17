import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-button-groups',
  templateUrl: './button-groups.component.html',
  imports: [RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, ButtonGroupComponent, ButtonDirective, RouterLink, ReactiveFormsModule, FormCheckLabelDirective, ButtonToolbarComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, DropdownComponent, DropdownToggleDirective, DropdownMenuDirective, DropdownItemDirective, DropdownDividerDirective, DocsComponentsComponent, WidgetStatBComponent, ProgressComponent, ChartjsComponent, IconModule, TableDirective, TextColorDirective],
  providers: [IconSetService]
})
export class ButtonGroupsComponent {
  private formBuilder = inject(UntypedFormBuilder);

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
    radio1: new UntypedFormControl('Radio1')
  });

  setCheckBoxValue(controlName: string) {
    const prevValue = this.formCheck1.get(controlName)?.value;
    const value = this.formCheck1.value;
    value[controlName] = !prevValue;
    this.formCheck1.setValue(value);
  }

  setRadioValue(value: string): void {
    this.formRadio1.setValue({ radio1: value });
  }
}
