import { TestBed } from '@angular/core/testing';

import { WpApiService } from './wp-api.service';

describe('WpApiService', () => {
  let service: WpApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WpApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
