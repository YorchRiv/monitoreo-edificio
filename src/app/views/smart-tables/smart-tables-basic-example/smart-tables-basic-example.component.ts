import { Component } from '@angular/core';
import {
  BadgeComponent,
  ButtonDirective,
  CollapseDirective,
  IColumn,
  SmartTableComponent,
  TemplateIdDirective,
  TextColorDirective
} from '@coreui/angular-pro';
import usersData from '../_data';

@Component({
    selector: 'app-smart-tables-basic-example',
    templateUrl: './smart-tables-basic-example.component.html',
    styleUrls: ['./smart-tables-basic-example.component.scss'],    
    imports: [BadgeComponent, ButtonDirective, CollapseDirective, SmartTableComponent, TemplateIdDirective, TextColorDirective]
})
export class SmartTablesBasicExampleComponent {

  usersData = usersData;
  columns: IColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'voltage', label: 'Voltaje (V)', _style: { width: '15%' } },
    { key: 'current', label: 'Amperaje (A)', _style: { width: '15%' } },
    { key: 'consumption', label: 'Consumo (KWH)', _style: { width: '15%' } },
    { key: 'status', label: 'Estado', _style: { width: '15%' } },
    { key: 'show', label: '', _style: { width: '5%' }, filter: false, sorter: false }
  ];
  details_visible = Object.create({});

  getBadge(status: string) {
    switch (status) {
      case 'Aceptable':
        return 'success';
      case 'Inactivo':
        return 'secondary';
      case 'Precaucion':
        return 'warning';
      case 'Alerta':
        return 'danger';
      default:
        return 'primary';
    }
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }
}
