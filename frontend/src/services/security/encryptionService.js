// Client-side Encryption Service

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  // Generate encryption key
  async generateKey() {
    return await crypto.subtle.generateKey(
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password
  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt || crypto.getRandomValues(new Uint8Array(16)),
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv },
      key,
      encoder.encode(JSON.stringify(data))
    );

    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  // Decrypt data
  async decrypt(encryptedData, key) {
    const decoder = new TextDecoder();
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: this.base64ToArrayBuffer(encryptedData.iv),
      },
      key,
      this.base64ToArrayBuffer(encryptedData.encrypted)
    );

    return JSON.parse(decoder.decode(decrypted));
  }

  // Export key
  async exportKey(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  // Import key
  async importKey(keyData) {
    return await crypto.subtle.importKey(
      'raw',
      this.base64ToArrayBuffer(keyData),
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Generate random bytes
  generateRandomBytes(length = 32) {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  // Hash data
  async hash(data) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(data)
    );
    return this.arrayBufferToBase64(hashBuffer);
  }

  // Helper: ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper: Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Encrypt sensitive field
  async encryptField(value, key) {
    if (!value) return null;
    return await this.encrypt(value, key);
  }

  // Decrypt sensitive field
  async decryptField(encryptedValue, key) {
    if (!encryptedValue) return null;
    return await this.decrypt(encryptedValue, key);
  }

  // Check if Web Crypto is supported
  isSupported() {
    return typeof crypto !== 'undefined' && crypto.subtle;
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;

