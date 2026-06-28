import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurriculumOutline } from './curriculum-outline';

describe('CurriculumOutline', () => {
  let component: CurriculumOutline;
  let fixture: ComponentFixture<CurriculumOutline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurriculumOutline],
    }).compileComponents();

    fixture = TestBed.createComponent(CurriculumOutline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
