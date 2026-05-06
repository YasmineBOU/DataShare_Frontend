import { createHash } from 'blake3-wasm';


export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 octets';

  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}


// export async function computeFileChecksum(file) {
//   const arrayBuffer = await file.arrayBuffer();
//   return await blake3(arrayBuffer);
// }


/**
 * Calcule le hash BLAKE3 d'un fichier.
 * @param file - Le fichier à hasher.
 * @param chunkSize - Taille des chunks (par défaut 64 Mo).
 * @returns Promise<string> - Hash hexadécimal.
 */
export async function computeFileChecksum(
  file: File,
  chunkSize: number = 64 * 1024 * 1024
): Promise<string> {
  if (!file) {
    throw new Error('Aucun fichier fourni.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const hash = createHash();
    let offset = 0;

    const readChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(chunk);
    };

    reader.onload = (event) => {
      const chunk = event.target?.result as ArrayBuffer;
      if (!chunk) {
        reject(new Error('Erreur lors de la lecture du chunk.'));
        return;
      }

      hash.update(new Uint8Array(chunk));
      offset += chunkSize;

      if (offset >= file.size) {
        // digest() retourne un Uint8Array (buffer binaire)
        const digestBuffer = hash.digest();

        // Conversion en hexadécimal
        const hashHex = Array.from(digestBuffer)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        resolve(hashHex);
      } else {
        readChunk();
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier.'));
    };

    readChunk();
  });
}
