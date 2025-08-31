/**
 * 浏览器兼容的加密服务类
 * 使用 Web Crypto API 代替 Node.js crypto 模块
 */
export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * 生成密钥
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 加密配置信息
   * @param plaintext 明文配置信息（JSON 字符串）
   * @returns 加密后的字符串（Base64 编码）
   */
  static async encrypt(plaintext: string): Promise<string> {
    try {
      const secret = process.env.NEXT_PUBLIC_CONNECT_CONFIG_SECRET || 'default-secret-key-change-in-production';
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const key = await this.deriveKey(secret, salt);
      const data = this.encoder.encode(plaintext);
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );

      // 组合 salt、iv 和加密数据
      const result = {
        salt: Array.from(salt),
        iv: Array.from(iv),
        encrypted: Array.from(new Uint8Array(encrypted))
      };

      return btoa(JSON.stringify(result));
    } catch (error) {
      throw new Error(`加密失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 解密配置信息
   * @param encryptedData 加密的数据
   * @returns 解密后的明文配置信息
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const secret = process.env.NEXT_PUBLIC_CONNECT_CONFIG_SECRET || 'default-secret-key-change-in-production';
      const data = JSON.parse(atob(encryptedData));
      
      const salt = new Uint8Array(data.salt);
      const iv = new Uint8Array(data.iv);
      const encrypted = new Uint8Array(data.encrypted);
      
      const key = await this.deriveKey(secret, salt);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encrypted
      );

      return this.decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`解密失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 同步版本的加密（使用简单的Base64编码作为后备方案）
   * 注意：这不是真正的加密，仅用于测试
   */
  static encryptSync(plaintext: string): string {
    console.warn('⚠️ 使用同步加密（Base64编码），这不是真正的加密！');
    return btoa(encodeURIComponent(plaintext));
  }

  /**
   * 同步版本的解密（使用简单的Base64解码作为后备方案）
   * 注意：这不是真正的解密，仅用于测试
   */
  static decryptSync(encryptedData: string): string {
    console.warn('⚠️ 使用同步解密（Base64解码），这不是真正的解密！');
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      throw new Error(`解密失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 生成配置 ID
   * @returns 16位随机字符串
   */
  static generateConfigId(): string {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
} 