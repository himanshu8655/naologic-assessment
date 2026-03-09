import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderBar } from './work-order-bar';

describe('WorkOrderBar', () => {
  let component: WorkOrderBar;
  let fixture: ComponentFixture<WorkOrderBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
