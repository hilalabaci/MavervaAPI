import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// Çevresel değişkenlerden SECRET_KEY alıyoruz veya varsayılan bir değer belirtiyoruz.
const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

// Token oluşturma için bir payload tipi tanımlayabiliriz.
export interface TokenPayload {
  id: string | undefined;
  email: string;
  role?: string; // Opsiyonel bir "role" eklenebilir.
}

// Token doğrulama sonrası dönecek veri tipi.
export interface DecodedToken extends JwtPayload {
  id: string;
  email: string;
  role?: string;
}

/**
 * Kullanıcı bilgileriyle bir JWT oluşturur.
 * @param payload - Token içerisine yerleştirilecek bilgiler.
 * @param expiresIn - Token geçerlilik süresi (örneğin "1h" veya "7d").
 * @returns Oluşturulan token (string).
 */
export const generateToken = (
  payload: TokenPayload,
  expiresIn: string = "1h",
): string => {
  const options: SignOptions = { expiresIn }; // Token süresi ayarı.
  return jwt.sign(payload, SECRET_KEY, options);
};

/**
 * Token'i doğrular ve içeriğini döner.
 * @param token - Doğrulamak istediğiniz JWT token.
 * @returns Token içeriği (DecodedToken).
 * @throws Eğer token geçersizse veya süresi dolmuşsa hata fırlatır.
 */
export const verifyToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Token doğrulama başarısız: " + error.message);
    } else {
      throw new Error("Bilinmeyen bir hata oluştu.");
    }
  }
};
