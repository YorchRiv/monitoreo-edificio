/// <reference types="@types/google.maps" />

import { DOCUMENT, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { GoogleMapsApiService } from './google-maps-api.service';

// Marker interface for type safety
export interface CustomMarker {
  position: google.maps.LatLngLiteral;
  glyph?: string;
  title: string;
  www: string;
  content?: any;
}

@Injectable()
export class GoogleMapsDataService implements OnDestroy {

  readonly #document = inject(DOCUMENT);
  readonly #loader = inject(GoogleMapsApiService).loader;

  readonly markers = signal<CustomMarker[]>([]);

  constructor() {
    this.initPins().then((markers) => this.markers.set(markers));
  }

  ngOnDestroy(): void {
    this.#loader.deleteScript();
  }

  readonly #positions: CustomMarker[] = [
    {
      position: {
        lat: 37.431489,
        lng: -122.163719
      },
      glyph: 'S',
      title: 'Stanford',
      www: 'https://www.stanford.edu/'
    },
    {
      position: {
        lat: 37.394694,
        lng: -122.150333
      },
      glyph: 'T',
      title: 'Tesla',
      www: 'https://www.tesla.com/'
    },
    {
      position: {
        lat: 37.334831,
        lng: -122.008961
      },
      glyph: 'A',
      title: 'Apple',
      www: 'https://www.apple.com/'
    },
    {
      position: {
        lat: 37.484722,
        lng: -122.148333
      },
      glyph: 'F',
      title: 'Facebook',
      www: 'https://www.facebook.com/'
    }
  ];

  async initPins() {
    const markerLib = await this.#loader.importLibrary('marker')
      .catch(reason => {
        console.log('"@googlemaps/js-api-loader" importLibrary("marker") rejected:', reason);
        return null;
      });

    if (!markerLib) {
      return [];
    }

    const { PinElement } = markerLib as google.maps.MarkerLibrary;

    return this.#positions.map((marker) => {
      const pinGlyph = new PinElement({
        glyph: marker.glyph,
        glyphColor: 'white'
      });
      marker.content = pinGlyph.element;
      return marker;
    });
  }

  options: google.maps.MapOptions = {
    center: {
      lat: 37.42000,
      lng: -122.103719
    },
    zoom: 10,
    mapId: 'DEMO_MAP_ID'
  };

  vertices: google.maps.LatLngLiteral[] = [
    { lat: 37.7, lng: -122.5 },
    { lat: 37.708, lng: -122.37 },
    { lat: 37.80, lng: -122.40 },
    { lat: 37.78, lng: -122.51 }
  ];

  circleCenter: google.maps.LatLngLiteral = { lat: 37.523, lng: -122.036 };

  get beachFlag() {
    const imgTag = this.#document.createElement('img');
    imgTag.src = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    return imgTag;
  }

  // Let's cache for markerOptions to avoid multiple creation of markerOptions config objects.
  // Creates the markerOptions object at first time the getter is called, then cached.
  // Subsequent accesses return the cached value without recreating it.
  markerOptionsCache!: google.maps.marker.AdvancedMarkerElement;

  // markerOptions getter defines a property, but does not calculate the property's value until it is accessed.
  // and it will be accessed from ng-template only when apiLoaded === true
  get markerOptions(): google.maps.marker.AdvancedMarkerElementOptions {
    if (!this.markerOptionsCache) {
      this.markerOptionsCache = <google.maps.marker.AdvancedMarkerElement><unknown>{
        gmpDraggable: false
      };
    }
    // return { ...this.markerOptionsCache, content: this.beachFlag };
    return this.markerOptionsCache;
  }
}
