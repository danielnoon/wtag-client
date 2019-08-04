import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTagComponent } from './add-tag.component';

describe('AddTagComponent', () => {
  let component: AddTagComponent;
  let fixture: ComponentFixture<AddTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTagComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
