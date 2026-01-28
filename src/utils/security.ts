import CryptoJS from 'crypto-js';

/**
 * Encrypts a JSON string using AES.
 * @param data The JSON string to encrypt.
 * @param password The user-provided password.
 * @returns { encrypted: true, content: string } JSON string
 */
export const encryptData = (data: string, password: string): string => {
  const encrypted = CryptoJS.AES.encrypt(data, password).toString();
  return JSON.stringify({ encrypted: true, content: encrypted });
};

/**
 * Decrypts a JSON string using AES.
 * @param importedContent The raw import content.
 * @param password The user-provided password.
 * @returns The decrypted JSON string (data).
 * @throws Error if password is wrong or format is invalid.
 */
export const decryptData = (importedContent: string, password: string): string => {
  const parsed = JSON.parse(importedContent);
  if (!parsed.content) throw new Error("Invalid format");

  const bytes = CryptoJS.AES.decrypt(parsed.content, password);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) throw new Error("Wrong password");
  return decrypted;
};
