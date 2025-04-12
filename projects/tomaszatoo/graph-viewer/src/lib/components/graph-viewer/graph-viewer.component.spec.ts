import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphViewerComponent } from './graph-viewer.component';

describe('GraphViewerComponent', () => {
  let component: GraphViewerComponent;
  let fixture: ComponentFixture<GraphViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
