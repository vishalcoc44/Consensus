
/**
 * Encryption utility - provides methods for encrypting and decrypting data
 * using AES-256 encryption standards
 */

// For demonstration, we're using Web Crypto API which is available in modern browsers
// In a production environment, you might use a more comprehensive library
// and manage keys more securely

// Generate an encryption key from a password
async function getKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Derive a key using PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use the key material to derive the actual encryption key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('consensus-ai-secure-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Get the encryption key (in a real app, you'd manage this more securely)
async function getEncryptionKey(): Promise<CryptoKey> {
  // In production, you would use a more secure method to generate/store this key
  // This is a simplified example
  const appSecret = 'consensus-ai-encryption-key';
  return getKey(appSecret);
}

// Encrypt data
export async function encrypt(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encoder.encode(data)
    );
    
    // Combine the IV and encrypted data for storage
    const result = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...new Uint8Array(result)));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    
    // Convert from base64
    const buffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract the IV and encrypted data
    const iv = buffer.slice(0, 12);
    const data = buffer.slice(12);
    
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Function to hash data for audit trail purposes (e.g., for blockchain storage)
export async function hashData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    // Create a SHA-256 hash
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedData);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
}
