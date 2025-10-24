import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Type représentant les données de session utilisateur
 */
export type SessionPayload = {
  userId: number;
  email: string;
  expiresAt: Date;
};

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Chiffre et signe les données de session dans un JWT
 * @param payload - Données de session à chiffrer
 * @returns Token JWT signé
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

/**
 * Déchiffre et vérifie un token JWT de session
 * @param session - Token JWT à déchiffrer
 * @returns Données de session ou null si invalide
 */
export async function decrypt(session: string | undefined): Promise<SessionPayload | null> {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    
    // S'assurer que userId est un nombre
    const data = payload as any;
    return {
      userId: typeof data.userId === 'number' ? data.userId : parseInt(data.userId, 10),
      email: data.email,
      expiresAt: new Date(data.expiresAt),
    };
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

/**
 * Crée une session utilisateur et stocke le cookie
 * @param userId - ID de l'utilisateur
 * @param email - Email de l'utilisateur
 */
export async function createSession(userId: number, email: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
  const session = await encrypt({ userId, email, expiresAt });

  const cookieStore = await cookies();
  
  // En développement local, être plus lenient avec les cookies pour mobile
  // En production, utiliser secure: true
  const isProduction = process.env.NODE_ENV === 'production';
  
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: isProduction,  // false en dev (localhost + 192.168.x.x)
    expires: expiresAt,
    sameSite: isProduction ? 'strict' : 'lax',  // 'strict' en prod, 'lax' en dev
    path: '/',
  });
}

/**
 * Supprime la session utilisateur
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

/**
 * Récupère la session actuelle depuis les cookies
 * @returns Données de session ou null
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  return decrypt(session);
}

