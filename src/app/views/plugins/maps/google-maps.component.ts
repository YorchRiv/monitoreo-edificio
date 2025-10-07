/// <reference types="@types/google.maps" />

import { Component, computed, DOCUMENT, inject, viewChild } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapAdvancedMarker, MapInfoWindow, MapMarkerClusterer } from '@angular/google-maps';

import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardImgDirective,
  PlaceholderAnimationDirective,
  PlaceholderDirective
} from '@coreui/angular-pro';

import { DocsLinkComponent } from '@docs-components/docs-link/docs-link.component';
import { GoogleMapsLoaderService } from './google-maps-loader.service';
import { ScriptInjectorService } from './script-injector.service';
import { CustomMarker, GoogleMapsDataService } from './google-maps-data.service';
import { GoogleMapsResizeObserverService } from './google-maps-resize-observer.service';

@Component({
  selector: 'app-google-maps-integration',
  templateUrl: 'google-maps.component.html',
  styleUrls: ['google-maps.component.scss'],
  providers: [GoogleMapsLoaderService, GoogleMapsDataService, GoogleMapsResizeObserverService],
  imports: [MapAdvancedMarker, MapMarkerClusterer, DocsLinkComponent, CardComponent, CardHeaderComponent, CardBodyComponent, GoogleMapsModule, PlaceholderDirective, PlaceholderAnimationDirective, CardImgDirective]
})
export class GoogleMapsComponent {

  title: string = '';

  readonly #markerClustererScriptSrc = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';

  readonly #document = inject(DOCUMENT);
  readonly googleMapsLoaderService = inject(GoogleMapsLoaderService);
  readonly scriptInjectorService = inject(ScriptInjectorService);
  readonly googleMapsResizeObserverService = inject(GoogleMapsResizeObserverService);
  readonly googleMapsDataService = inject(GoogleMapsDataService);

  readonly markers = this.googleMapsDataService.markers;
  readonly options = this.googleMapsDataService.options;
  readonly circleCenter = this.googleMapsDataService.circleCenter;
  readonly vertices = this.googleMapsDataService.vertices;

  get markerOptions() {
    return this.googleMapsDataService.markerOptions;
  }

  constructor() {
    this.scriptInjectorService.loadScript(this.#markerClustererScriptSrc);
    this.googleMapsResizeObserverService.target.set(this.#document.body);
  }

  readonly scriptLoaded = computed(() => {
    return this.scriptInjectorService.loaded() && this.googleMapsLoaderService.apiLoaded();
  });

  readonly mapHeight = computed(() => {
    return this.googleMapsResizeObserverService.mapHeight();
  });

  readonly googleMap = viewChild(GoogleMap);

  readonly infoWindow = viewChild(MapInfoWindow);

  activeInfoWindow!: CustomMarker;

  get infoWindowContent() {
    return this.activeInfoWindow;
  }

  set infoWindowContent(marker) {
    this.title = marker.title;
    this.activeInfoWindow = marker;
    const infoWindow = this.infoWindow();
    if (infoWindow) {
      infoWindow.position = marker.position;
      infoWindow.open();
    }
  }

  openInfoWindow(marker: MapAdvancedMarker, item: CustomMarker) {
    this.infoWindowContent = item;
    this.infoWindow()?.open(marker);
  }

  showPolygonInfoWindow($event: google.maps.PolyMouseEvent) {
    const marker: CustomMarker = {
      position: {
        lat: $event?.latLng?.lat() ?? 0,
        lng: $event?.latLng?.lng() ?? 0
      },
      title: 'San Francisco',
      www: 'https://en.wikipedia.org/wiki/San_Francisco'
    };
    this.infoWindowContent = marker;
  }

  showCircleInfoWindow($event: google.maps.MapMouseEvent) {
    // console.log('showCircleInfoWindow', $event);
    const marker: CustomMarker = {
      position: { ...this.circleCenter },
      title: 'Newark',
      www: 'https://en.wikipedia.org/wiki/Newark,_California'
    };
    this.infoWindowContent = marker;
  }
}
