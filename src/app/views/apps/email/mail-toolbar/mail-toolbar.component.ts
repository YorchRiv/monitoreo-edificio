import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  BadgeComponent,
  ButtonDirective,
  ButtonGroupComponent,
  ButtonToolbarComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective
} from '@coreui/angular-pro';

@Component({
  selector: 'app-mail-toolbar',
  templateUrl: './mail-toolbar.component.html',
  styleUrls: ['./mail-toolbar.component.scss'],
  imports: [ButtonToolbarComponent, ButtonGroupComponent, ButtonDirective, IconDirective, DropdownComponent, DropdownToggleDirective, RouterLink, DropdownMenuDirective, DropdownItemDirective, BadgeComponent],
  host: {
    'class': 'btn-toolbar mb-4'
  }
})
export class MailToolbarComponent {}
