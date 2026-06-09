/**
 * Utility functions for common browser and viewport operations.
 * This module provides helper functions to detect browser environments, get viewport dimensions,
 * check if the device is mobile, and watch viewport width changes.
 *
 * @see MOBILE_WIDTH_THRESHOLD
 * @see isBrowser
 * @see getViewportWidth
 * @see isMobileDevice
 * @see watchViewportWidth
 */

import { Observable, distinctUntilChanged, fromEvent, map, of, startWith } from 'rxjs';

export const MOBILE_WIDTH_THRESHOLD = 768; // Or any device with same width

/**
 * Checks if the code is running in a browser environment.
 * This function ensures that window-related operations are only executed in the browser.
 *
 * @returns `true` if running in a browser, `false` otherwise.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Gets the current viewport width.
 * If not in a browser environment, returns the provided default width.
 *
 * @param defaultWidth - The default width to return if not in a browser (default: `0`).
 * @returns The current viewport width or the default width if not in a browser.
 */
export function getViewportWidth(defaultWidth = 0): number {
  return isBrowser() ? window.innerWidth : defaultWidth;
}

/**
 * Determines if the device is considered mobile based on the viewport width.
 * A device is considered mobile if its width is less than or equal to {@link MOBILE_WIDTH_THRESHOLD}.
 *
 * @param width - The viewport width to check.
 * @returns `true` if the device is mobile, `false` otherwise.
 */
export function isMobileDevice(width: number): boolean {
  // Base the decision on the mobile width threshold
  return width > 0 && width <= MOBILE_WIDTH_THRESHOLD;
}

/**
 * Creates an Observable that emits the current viewport width and updates when the window is resized.
 * If not in a browser environment, emits `0`.
 *
 * @returns An {@link Observable} of type `number` that emits the viewport width.
 */
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