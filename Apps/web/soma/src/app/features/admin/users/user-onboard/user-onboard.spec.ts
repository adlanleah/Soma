import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOnboard } from './user-onboard';

describe('UserOnboard', () => {
  let component: UserOnboard;
  let fixture: ComponentFixture<UserOnboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOnboard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserOnboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
