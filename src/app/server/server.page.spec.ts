import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerPage } from './server.page';

describe('ServerPage', () => {
  let component: ServerPage;
  let fixture: ComponentFixture<ServerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
