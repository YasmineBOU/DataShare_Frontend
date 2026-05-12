import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListing } from './file-listing';

describe('FileListing', () => {
  let component: FileListing;
  let fixture: ComponentFixture<FileListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListing],
    }).compileComponents();

    fixture = TestBed.createComponent(FileListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
