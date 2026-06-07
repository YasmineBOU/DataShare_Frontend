import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit false by default', (done) => {
    service.isLoading$.subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should emit true after show()', (done) => {
    service.show();
    service.isLoading$.subscribe(value => {
      expect(value).toBe(true);
      done();
    });
  });

  it('should emit false after hide()', (done) => {
    service.show();
    service.hide();
    service.isLoading$.subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });
});