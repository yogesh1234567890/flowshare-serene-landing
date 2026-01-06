export class EncryptionService {
    private static ALGORITHM = 'AES-GCM';
    private static KEY_DERIVATION_ALGO = 'PBKDF2';
    private static SALT_LENGTH = 16;
    private static IV_LENGTH = 12; // 96 bits for AES-GCM
    private static ITERATIONS = 100000;
  
    /**
     * Derives a cryptographic key from a password string.
     */
    static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
      const encoder = new TextEncoder();
      const rawKey = encoder.encode(password);
      
      const importedKey = await window.crypto.subtle.importKey(
        'raw', 
        rawKey, 
        { name: this.KEY_DERIVATION_ALGO }, 
        false, 
        ['deriveKey']
      );
  
      return await window.crypto.subtle.deriveKey(
        {
          name: this.KEY_DERIVATION_ALGO,
          salt: salt as any,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        importedKey,
        { name: this.ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }
  
    /**
     * Generates a random salt.
     */
    static generateSalt(): Uint8Array {
      return window.crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    }
  
    /**
     * Generates a random IV.
     */
    static generateIV(): Uint8Array {
      return window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    }
  
    /**
     * Encrypts a chunk of data.
     */
    static async encryptChunk(data: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
      return await window.crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv as any
        },
        key,
        data
      );
    }
  
    /**
     * Decrypts a chunk of data.
     */
    static async decryptChunk(data: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
      return await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv as any
        },
        key,
        data
      );
    }
  }
