import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadOrdersExcelModalComponent } from './download-orders-excel-modal.component';

describe('DownloadOrdersExcelModalComponent', () => {
  let component: DownloadOrdersExcelModalComponent;
  let fixture: ComponentFixture<DownloadOrdersExcelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadOrdersExcelModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadOrdersExcelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
