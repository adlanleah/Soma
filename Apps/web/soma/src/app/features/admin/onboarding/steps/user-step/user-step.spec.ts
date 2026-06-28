import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStep } from './user-step';

describe('UserStep', () => {
  let component: UserStep;
  let fixture: ComponentFixture<UserStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStep],
    }).compileComponents();

    fixture = TestBed.createComponent(UserStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
