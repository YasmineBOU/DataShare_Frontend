import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDownload } from './file-download';

describe('FileDownload', () => {
  let component: FileDownload;
  let fixture: ComponentFixture<FileDownload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDownload],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDownload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
