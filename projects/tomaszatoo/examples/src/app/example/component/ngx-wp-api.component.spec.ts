import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxWpApiComponent } from './ngx-wp-api.component';

describe('NgxWpApiComponent', () => {
  let component: NgxWpApiComponent;
  let fixture: ComponentFixture<NgxWpApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxWpApiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxWpApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
