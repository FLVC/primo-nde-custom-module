import { TestBed } from '@angular/core/testing';

import { PrimoStoreService } from './primo-store.service';

describe('PrimoStoreService', () => {
  let service: PrimoStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimoStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
