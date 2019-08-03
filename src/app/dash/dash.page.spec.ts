import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashPage } from './dash.page';

describe('DashPage', () => {
  let component: DashPage;
  let fixture: ComponentFixture<DashPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
