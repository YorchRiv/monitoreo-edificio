import { Component, OnInit } from '@angular/core';
import {
  AlertComponent,
  BadgeComponent,
  SmartTableComponent,
  TemplateIdDirective,
  TextColorDirective
} from '@coreui/angular-pro';
import usersData from '../_data';

@Component({
    selector: 'app-smart-tables-selectable-example',
    templateUrl: './smart-tables-selectable-example.component.html',
    styleUrls: ['./smart-tables-selectable-example.component.scss'],
    imports: [AlertComponent, BadgeComponent, SmartTableComponent, TemplateIdDirective, TextColorDirective]
})
export class SmartTablesSelectableExampleComponent implements OnInit {

  constructor() { }

  usersData = usersData;
  selectedItems = [2, 3];
  columns = [
    { key: 'name', _style: { width: '15vw', minWidth: '10vw', maxWidth: '20vw' }, label: 'Nombre' },
    { key: 'voltage', label: 'Voltaje (V)' },
    { key: 'current', label: 'Amperaje (A)' },
    { key: 'consumption', label: 'Consumo (KWH)' },
    { key: 'status', label: 'Estado' }
  ];

  ngOnInit(): void {
    this.usersData = this.usersData.map((item, id) => {
      const _selected = this.selectedItems.includes(id);
      return {
        ...item,
        _selected
      };
    });
  }

  checkSelected = (selectedItems: any) => {
    this.selectedItems = selectedItems.map((item: { id: any; }) => item.id);
  };

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
}
