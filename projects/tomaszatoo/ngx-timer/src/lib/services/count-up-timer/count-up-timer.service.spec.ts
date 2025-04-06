import { TestBed } from '@angular/core/testing';

import { CountUpTimerService } from './count-up-timer.service';

describe('CountUpTimerService', () => {
  let service: CountUpTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountUpTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
