import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewDialogComponent } from './map-view-dialog.component';

describe('MapViewDialogComponent', () => {
  let component: MapViewDialogComponent;
  let fixture: ComponentFixture<MapViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapViewDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
