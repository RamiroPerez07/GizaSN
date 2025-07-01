import { TestBed } from '@angular/core/testing';

import { PointOfSaleService } from './point-of-sale.service';

describe('PointOfSaleService', () => {
  let service: PointOfSaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PointOfSaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
