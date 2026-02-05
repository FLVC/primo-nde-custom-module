import { TestBed } from '@angular/core/testing';

import { HathiAvailabilityService } from './hathi-availability.service';

describe('HathiAvailabilityService', () => {
  let service: HathiAvailabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HathiAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
