import { TestBed } from '@angular/core/testing';

import { GraphEngineService } from './graph-engine.service';

describe('GraphEngineService', () => {
  let service: GraphEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
