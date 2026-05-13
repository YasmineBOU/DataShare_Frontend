import { Observable, distinctUntilChanged, fromEvent, map, of, startWith } from 'rxjs';

export const MOBILE_WIDTH_THRESHOLD = 768; // Or any device with same width

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getViewportWidth(defaultWidth = 0): number {
  return isBrowser() ? window.innerWidth : defaultWidth;
}

export function isMobileDevice(width: number): boolean {
  // Base the decision on the mobile width threshold
  return width > 0 && width <= MOBILE_WIDTH_THRESHOLD;
}

export function watchViewportWidth(): Observable<number> {
  if (!isBrowser()) {
    return of(0);
  }

  return fromEvent(window, 'resize').pipe(
    startWith(null),
    map(() => window.innerWidth),
    distinctUntilChanged(),
  );
}