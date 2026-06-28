import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolProfile } from './school-profile';

describe('SchoolProfile', () => {
  let component: SchoolProfile;
  let fixture: ComponentFixture<SchoolProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
