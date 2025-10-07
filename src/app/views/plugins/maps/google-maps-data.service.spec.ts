/// <reference types="@types/google.maps" />

import { TestBed, waitForAsync } from '@angular/core/testing';
import { GoogleMapsModule } from '@angular/google-maps';

import { CustomMarker, GoogleMapsDataService } from './google-maps-data.service';

describe('GoogleMapsDataService', () => {
  let service: GoogleMapsDataService;
  let markers: CustomMarker[];

  beforeAll(() => {
    // Mock Google Maps API
    (window as any).google = {
      maps: {
        importLibrary: jasmine.createSpy('importLibrary').and.returnValue(
          Promise.resolve({
            PinElement: class {
              element: HTMLElement;

              constructor(options: any) {
                this.element = document.createElement('div');
              }
            }
          })
        )
      }
    };

  });

  beforeEach(waitForAsync(async () => {

    TestBed.configureTestingModule({
      providers: [GoogleMapsDataService],
      imports: [GoogleMapsModule]
    });

    service = TestBed.inject(GoogleMapsDataService);
    markers = await service.initPins();

  }));

  it('should be created', () => {
    expect(markers).toBeTruthy();
  });

  it('should initialize markers with custom pins', () => {
    expect(markers.length).toBeGreaterThan(0);
    markers.forEach(marker => {
      expect(marker.position).toBeDefined();
      expect(marker.position.lat).toBeDefined();
      expect(marker.position.lng).toBeDefined();
      expect(marker.www).toBeDefined();
      expect(marker.www).toContain('https://');
      expect(marker.content).toBeDefined();
      expect(marker.content instanceof HTMLElement).toBeTrue();
    });
  });
});
