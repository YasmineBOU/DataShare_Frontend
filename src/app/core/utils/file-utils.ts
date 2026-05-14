import { createBLAKE3 } from 'hash-wasm';
import { EXTENSION_ICON_MAP, STATUS_ICON_MAP } from './file-icon-map';

export function getIconByExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_ICON_MAP[ext] || EXTENSION_ICON_MAP['default'];
}

export function getIconByStatus(status: string): string {
  return STATUS_ICON_MAP[status] || STATUS_ICON_MAP['default'];
}

export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 octets';

  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

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
