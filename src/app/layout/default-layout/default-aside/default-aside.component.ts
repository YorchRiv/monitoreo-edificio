import { AfterViewInit, Component, ElementRef, inject, Renderer2 } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';
import {
  AvatarComponent,
  BorderDirective,
  ButtonCloseDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  ProgressComponent,
  SidebarComponent,
  SidebarHeaderComponent,
  SidebarToggleDirective,
  TabDirective,
  TabPanelComponent,
  TabsComponent,
  TabsContentComponent,
  TabsListComponent
} from '@coreui/angular-pro';

@Component({
    selector: 'app-default-aside',
    templateUrl: './default-aside.component.html',
    styleUrls: ['./default-aside.component.scss'],
  imports: [SidebarComponent, SidebarHeaderComponent, RouterLink, IconDirective, ButtonCloseDirective, SidebarToggleDirective, NgTemplateOutlet, ListGroupDirective, ListGroupItemDirective, BorderDirective, AvatarComponent, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, ProgressComponent, TabsComponent, TabsListComponent, TabDirective, TabsContentComponent, TabPanelComponent]
})
export class DefaultAsideComponent implements AfterViewInit {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  public messages = Array.from({ length: 5 }, (v, i) => i);

  ngAfterViewInit(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
  }
}
