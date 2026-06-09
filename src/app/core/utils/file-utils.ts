/**
 * Utility functions for file operations, including icon mapping, file size formatting,
 * checksum computation, and expiration date messaging.
 * This module provides helper functions to interact with file metadata, such as getting icons based on file extensions or status,
 * formatting file sizes, computing file checksums, and generating expiration messages.
 *
 * @see EXTENSION_ICON_MAP
 * @see STATUS_ICON_MAP
 * @see createBLAKE3
 */

import { createBLAKE3 } from 'hash-wasm';
import { EXTENSION_ICON_MAP, STATUS_ICON_MAP } from './file-icon-map';

/**
 * Gets the icon associated with a file extension.
 * If the extension is not found in the map, the default icon is returned.
 *
 * @param filename - The name of the file.
 * @returns The icon path associated with the file extension or the default icon.
 */
export function getIconByExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_ICON_MAP[ext] || EXTENSION_ICON_MAP['default'];
}

/**
 * Gets the icon associated with a file status.
 * If the status is not found in the map, the default icon is returned.
 *
 * @param status - The status of the file (e.g., 'uploaded', 'expired', 'protected').
 * @returns The icon path associated with the file status or the default icon.
 */
export function getIconByStatus(status: string): string {
  return STATUS_ICON_MAP[status] || STATUS_ICON_MAP['default'];
}

/**
 * Formats a file size in bytes into a human-readable string.
 *
 * @param bytes - The file size in bytes.
 * @param decimals - The number of decimal places to include in the formatted size (default: `2`).
 * @returns A string representing the file size with the appropriate unit (e.g., "1.5 Mo").
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 octets';

  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Computes the BLAKE3 checksum of a file.
 * The file is read in chunks to avoid loading large files entirely into memory.
 *
 * @param file - The file to compute the checksum for.
 * @param chunkSize - The size of each chunk in bytes (default: `64 * 1024 * 1024` bytes, i.e., 64 MB).
 * @returns A Promise that resolves to the hexadecimal checksum of the file.
 * @throws Error if no file is provided or if an error occurs while reading the file.
 */
export async function computeFileChecksum(
  file: File,
  chunkSize: number = 64 * 1024 * 1024
): Promise<string> {


  if (!file) {
    throw new Error('No file provided.');
  }

  const hash = await createBLAKE3();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let offset = 0;

    const readChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(chunk);
    };

    reader.onload = (event) => {
      const chunk = event.target?.result as ArrayBuffer;
      if (!chunk) {
        reject(new Error('Error occurred while reading the chunk.'));
        return;
      }

      hash.update(new Uint8Array(chunk));
      offset += chunkSize;

      if (offset >= file.size) {
        resolve(hash.digest('hex'));
      } else {
        readChunk();
      }
    };

    reader.onerror = () => {
      reject(new Error('Error occurred while reading the file.'));
    };

    readChunk();
  });
}

/**
 * Generates a message describing the time remaining until a file expires.
 *
 * @param expirationDate - The expiration date of the file as a string.
 * @returns A tuple containing:
 *          - A message describing the time remaining (e.g., "dans 3 jours").
 *          - The number of days remaining until expiration.
 */
export function getExpirationDaysMessage(expirationDate: string): [string, number] {
  let expMsg = '';
  const now = new Date(); 
  const timeDiff = new Date(expirationDate).getTime() - now.getTime();
  const daysLeft = Math.round(timeDiff / (1000 * 3600 * 24));
  switch (daysLeft) {
    case 0:
      expMsg = 'aujourd\'hui';
      break;
    case 1:
      expMsg = 'demain';
      break;
    default:
      expMsg = `dans ${daysLeft} ${daysLeft > 1 ? 'jours' : 'jour'}`;
      break;
  }
  return [expMsg, daysLeft];
}
