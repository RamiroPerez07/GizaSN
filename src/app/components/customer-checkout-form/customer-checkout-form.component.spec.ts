import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCheckoutFormComponent } from './customer-checkout-form.component';

describe('CustomerCheckoutFormComponent', () => {
  let component: CustomerCheckoutFormComponent;
  let fixture: ComponentFixture<CustomerCheckoutFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCheckoutFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCheckoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
