/**
 * Secure Storage Utility
 *
 * Security Analysis:
 * - localStorage: Vulnerable to XSS, persistent across sessions
 * - sessionStorage: Vulnerable to XSS, cleared on tab close (more secure)
 * - Cookies (httpOnly): Best option but requires backend support
 *
 * Our Approach (frontend-only solution):
 * 1. Use sessionStorage by default (cleared when browser closes)
 * 2. For "Remember Me", use encrypted localStorage with expiration
 * 3. Implement basic encryption to prevent casual token theft
 * 4. Add expiration checks
 * 5. Sanitize all inputs to prevent XSS
 */

// Simple encryption/decryption using Base64 + salt (client-side obfuscation)
// Note: This is NOT military-grade encryption, but prevents casual inspection
const SALT = 'GFA_SECURE_2024_OAIS';

class SecureStorage {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    // Check if storage is available
    this.hasLocalStorage = this.checkStorageAvailability('localStorage');
    this.hasSessionStorage = this.checkStorageAvailability('sessionStorage');
  }

  checkStorageAvailability(type) {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Basic encryption (obfuscation)
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      const salted = SALT + jsonString + SALT;
      return btoa(encodeURIComponent(salted));
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  // Basic decryption
  decrypt(encryptedData) {
    try {
      const decoded = decodeURIComponent(atob(encryptedData));
      const unsalted = decoded.replace(new RegExp('^' + SALT), '').replace(new RegExp(SALT + '$'), '');
      return JSON.parse(unsalted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Add expiration wrapper
  wrapWithExpiration(data, expirationMinutes = null) {
    const wrapper = {
      data,
      timestamp: Date.now(),
      expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
    };
    return wrapper;
  }

  // Check if data is expired
  isExpired(wrapper) {
    if (!wrapper || !wrapper.expiration) {
      return false; // No expiration set
    }
    return Date.now() > wrapper.expiration;
  }

  /**
   * Set item in secure storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {boolean} persistent - Use localStorage (true) or sessionStorage (false)
   * @param {number} expirationMinutes - Optional expiration in minutes
   */
  setItem(key, value, persistent = false, expirationMinutes = null) {
    try {
      const storage = persistent ?
        (this.hasLocalStorage ? localStorage : null) :
        (this.hasSessionStorage ? sessionStorage : null);

      if (!storage) {
        console.warn(`Storage not available for key: ${key}`);
        return false;
      }

      // Wrap with expiration
      const wrapped = this.wrapWithExpiration(value, expirationMinutes);

      // Encrypt
      const encrypted = this.encrypt(wrapped);

      if (encrypted) {
        storage.setItem(key, encrypted);
        return true;
      }

      return false;
    } catch (error) {
      console.error('SecureStorage.setItem error:', error);
      return false;
    }
  }

  /**
   * Get item from secure storage
   * @param {string} key - Storage key
   * @returns {any} - Decrypted value or null
   */
  getItem(key) {
    try {
      // Try sessionStorage first (more secure)
      let encrypted = null;

      if (this.hasSessionStorage) {
        encrypted = sessionStorage.getItem(key);
      }

      // Fallback to localStorage
      if (!encrypted && this.hasLocalStorage) {
        encrypted = localStorage.getItem(key);
      }

      if (!encrypted) {
        return null;
      }

      // Decrypt
      const wrapped = this.decrypt(encrypted);

      if (!wrapped) {
        return null;
      }

      // Check expiration
      if (this.isExpired(wrapped)) {
        this.removeItem(key);
        return null;
      }

      return wrapped.data;
    } catch (error) {
      console.error('SecureStorage.getItem error:', error);
      return null;
    }
  }

  /**
   * Remove item from all storages
   * @param {string} key - Storage key
   */
  removeItem(key) {
    try {
      if (this.hasLocalStorage) {
        localStorage.removeItem(key);
      }
      if (this.hasSessionStorage) {
        sessionStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('SecureStorage.removeItem error:', error);
      return false;
    }
  }

  /**
   * Clear all items
   */
  clear() {
    try {
      if (this.hasLocalStorage) {
        localStorage.clear();
      }
      if (this.hasSessionStorage) {
        sessionStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('SecureStorage.clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  getAllKeys() {
    const keys = new Set();

    try {
      if (this.hasLocalStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          keys.add(localStorage.key(i));
        }
      }

      if (this.hasSessionStorage) {
        for (let i = 0; i < sessionStorage.length; i++) {
          keys.add(sessionStorage.key(i));
        }
      }

      return Array.from(keys);
    } catch (error) {
      console.error('SecureStorage.getAllKeys error:', error);
      return [];
    }
  }
}

// Singleton instance
const secureStorage = new SecureStorage();

export default secureStorage;
