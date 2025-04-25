import { TestBed } from '@angular/core/testing';

import { CategoryTreeService } from './category-tree.service';

describe('CategoryTreeService', () => {
  let service: CategoryTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
