import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolOnboarding } from './school-onboarding';

describe('SchoolOnboarding', () => {
  let component: SchoolOnboarding;
  let fixture: ComponentFixture<SchoolOnboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolOnboarding],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolOnboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
