import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Aspects } from './aspects';

describe('Aspects', () => {
  let component: Aspects;
  let fixture: ComponentFixture<Aspects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aspects],
    }).compileComponents();

    fixture = TestBed.createComponent(Aspects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
