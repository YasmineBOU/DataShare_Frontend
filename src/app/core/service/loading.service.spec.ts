import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;
  let DELAY: number;
  
  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    DELAY = service.LOADING_DELAY_MS;
  });

  afterEach(() => {
    jest.useRealTimers();
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

  describe('show() / hide() — single request', () => {

    it('should not emit true immediately after show() (delay not elapsed)', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      jest.advanceTimersByTime(DELAY - 1); // Less than the delay

      expect(lastValue).toBe(false);
    });

    it('should emit true after the 300ms delay has elapsed', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      jest.advanceTimersByTime(DELAY);

      expect(lastValue).toBe(true);
    });

    it('should not emit true if hide() is called before the delay elapses', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      jest.advanceTimersByTime(50);
      service.hide();
      jest.advanceTimersByTime(DELAY);

      expect(lastValue).toBe(false);
    });

    it('should emit false after hide() once spinner was shown', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      jest.advanceTimersByTime(DELAY);
      expect(lastValue).toBe(true);

      service.hide();
      expect(lastValue).toBe(false);
    });
  });

  describe('show() / hide() — concurrent requests', () => {

    it('should keep loading true while at least one request is still active', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show(); // Request A
      service.show(); // Request B
      jest.advanceTimersByTime(DELAY);
      expect(lastValue).toBe(true);

      service.hide(); // Request A completes
      expect(lastValue).toBe(true); // Request B is still active

      service.hide(); // Request B completes
      expect(lastValue).toBe(false);
    });

    it('should not emit true if all requests finish before the delay elapses', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      service.show();
      jest.advanceTimersByTime(50);
      service.hide();
      service.hide();
      jest.advanceTimersByTime(DELAY);

      expect(lastValue).toBe(false);
    });

    it('should not start a second timer when a second request starts while first is pending', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      jest.advanceTimersByTime(DELAY - 50); 
      service.show(); // Should not reset the timer
      jest.advanceTimersByTime(50); // total DELAY(ms) from first show() call

      expect(lastValue).toBe(true);
    });

    it('should not go below zero when hide() is called without show()', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.hide(); // appel orphelin
      jest.advanceTimersByTime(DELAY);
      expect(lastValue).toBe(false);

      service.show();
      jest.advanceTimersByTime(DELAY);
      expect(lastValue).toBe(true);

      service.hide();
      expect(lastValue).toBe(false);
    });
  });

  describe('cleanup', () => {

    it('should not emit true if hide() clears the pending timeout before it fires', () => {
      let lastValue: boolean | undefined;
      service.isLoading$.subscribe(value => lastValue = value);

      service.show();
      jest.advanceTimersByTime(DELAY - 50); // Less than the delay
      service.hide();
      jest.advanceTimersByTime(DELAY + 300);

      expect(lastValue).toBe(false); 
    });
  });
  
});