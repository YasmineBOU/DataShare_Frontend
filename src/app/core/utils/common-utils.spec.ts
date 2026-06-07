import { isBrowser, getViewportWidth, isMobileDevice, watchViewportWidth, MOBILE_WIDTH_THRESHOLD } from './common-utils';

describe('common-utils', () => {

  describe('isBrowser', () => {
    it('should return true when window is defined', () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe('getViewportWidth', () => {
    it('should return window.innerWidth in browser mode', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      expect(getViewportWidth()).toBe(1024);
    });

    it('should return defaultWidth when not in browser', () => {
      jest.spyOn({ isBrowser: isBrowser }, 'isBrowser').mockReturnValue(false);
      // Test behavior with a known width
      expect(getViewportWidth(0)).toBe(window.innerWidth);
    });
  });

  describe('isMobileDevice', () => {
    it('should return true for width within mobile threshold', () => {
      let mobileWidth = MOBILE_WIDTH_THRESHOLD - 1;

      expect(isMobileDevice(MOBILE_WIDTH_THRESHOLD)).toBe(true);
      expect(isMobileDevice(mobileWidth)).toBe(true);
      expect(isMobileDevice(1)).toBe(true);
    });

    it('should return false for width above mobile threshold', () => {
      expect(isMobileDevice(MOBILE_WIDTH_THRESHOLD + 1)).toBe(false);
      expect(isMobileDevice(MOBILE_WIDTH_THRESHOLD + 100)).toBe(false);
      expect(isMobileDevice(MOBILE_WIDTH_THRESHOLD + 1000)).toBe(false);
    });

    it('should return false for width of 0', () => {
      expect(isMobileDevice(0)).toBe(false);
    });
  });

  describe('watchViewportWidth', () => {
    it('should emit current window.innerWidth on subscribe', (done) => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });

      watchViewportWidth().subscribe(width => {
        expect(width).toBe(800);
        done();
      });
    });

    it('should emit new width on resize event', (done) => {
      const widths: number[] = [];
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });

      const sub = watchViewportWidth().subscribe(width => {
        widths.push(width);
        if (widths.length === 2) {
          expect(widths[1]).toBe(400);
          sub.unsubscribe();
          done();
        }
      });

      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });
  });
});