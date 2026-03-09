import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimescaleDropdown } from './timescale-dropdown';

describe('TimescaleDropdown', () => {
  let component: TimescaleDropdown;
  let fixture: ComponentFixture<TimescaleDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimescaleDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimescaleDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
