import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultingSectionComponent } from './consulting-section.component';

describe('ConsultingSectionComponent', () => {
  let component: ConsultingSectionComponent;
  let fixture: ComponentFixture<ConsultingSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultingSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
