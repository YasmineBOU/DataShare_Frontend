import { createBLAKE3 } from 'hash-wasm';


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
