import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16;

  constructor() {
    // Use a chave do .env ou gere uma chave fixa para o ambiente
    const secretKey = process.env.ENCRYPTION_KEY || 'your-secret-key-min-32-chars-long!!!';
    
    // Garantir que a chave tenha 32 bytes (256 bits)
    this.key = crypto.createHash('sha256').update(secretKey).digest();
  }

  /**
   * Criptografa um texto usando AES-256-CBC
   */
  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retorna IV + texto criptografado (IV é necessário para descriptografar)
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Descriptografa um texto criptografado com AES-256-CBC
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    try {
      const parts = encryptedText.split(':');
      
      if (parts.length !== 2) {
        throw new Error('Formato de texto criptografado inválido');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Erro ao descriptografar: ${error.message}`);
    }
  }

  /**
   * Verifica se um texto está criptografado (formato IV:encrypted)
   */
  isEncrypted(text: string): boolean {
    if (!text) return false;
    
    const parts = text.split(':');
    if (parts.length !== 2) return false;

    // Verifica se o IV tem o tamanho correto (32 caracteres hex = 16 bytes)
    return parts[0].length === this.ivLength * 2;
  }
}
