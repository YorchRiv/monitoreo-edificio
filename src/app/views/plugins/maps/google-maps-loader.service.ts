/// <reference types="@types/google.maps" />

import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { GoogleMapsApiService } from './google-maps-api.service';

@Injectable()
export class GoogleMapsLoaderService implements OnDestroy {

  readonly #loader = inject(GoogleMapsApiService).loader;

  readonly apiLoaded = signal(false);

  constructor() {
    this.#loader.importLibrary('maps').then(async (lib) => {
      this.apiLoaded.set(true);
    }).catch(reason => {
      this.apiLoaded.set(false);
      console.log('"@googlemaps/js-api-loader" importLibrary("maps") rejected:', reason);
    });
  }

  ngOnDestroy(): void {
    this.#loader.deleteScript();
  }
}
