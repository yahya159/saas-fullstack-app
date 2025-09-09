import * as crypto from 'crypto';

export class AuthCryptageHelper {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly SECRET_KEY =
    process.env.ENCRYPTION_SECRET || 'yOUjr4bRjjDrakKrCpO74IWX5DT348Jf';
  private static readonly IV_LENGTH = 16; // For AES, this is always 16

  static encryptWithAES(text: string): string {
    try {
      const iv = crypto.randomBytes(AuthCryptageHelper.IV_LENGTH);
      const cipher = crypto.createCipher(
        AuthCryptageHelper.ALGORITHM,
        AuthCryptageHelper.SECRET_KEY,
      );

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decryptWithAES(encryptedText: string): string {
    try {
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedData = textParts.join(':');

      const decipher = crypto.createDecipher(
        AuthCryptageHelper.ALGORITHM,
        AuthCryptageHelper.SECRET_KEY,
      );

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return hash === hashVerify;
    } catch (error) {
      return false;
    }
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateApiKey(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}
