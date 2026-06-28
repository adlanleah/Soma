import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cohort } from './cohort';

describe('Cohort', () => {
  let component: Cohort;
  let fixture: ComponentFixture<Cohort>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cohort],
    }).compileComponents();

    fixture = TestBed.createComponent(Cohort);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
