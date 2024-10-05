import { TestBed } from '@angular/core/testing';

import { NgxWpApiService } from './ngx-wp-api.service';

describe('NgxWpApiService', () => {
  let service: NgxWpApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxWpApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
