import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/session';

/**
 * API Route: POST /api/auth/verify-otp
 * Vérifie le code OTP et crée une session utilisateur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    console.log('[verify-otp] Received:', { email, code });

    // Validation des champs
    if (!email || !code) {
      console.log('[verify-otp] Missing email or code');
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    // Rechercher le code OTP valide
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[verify-otp] OTP Record found:', !!otpRecord);

    if (!otpRecord) {
      console.log('[verify-otp] Invalid or expired OTP');
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 401 }
      );
    }

    // Marquer le code comme utilisé
    await prisma.oTPCode.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
      },
    });

    console.log('[verify-otp] OTP marked as used');

    // Trouver ou créer l'utilisateur
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('[verify-otp] Creating new user');
      user = await prisma.user.create({
        data: { email },
      });
    }

    console.log('[verify-otp] User found/created:', { userId: user.id, email: user.email });

    // Créer la session JWT
    console.log('[verify-otp] Creating session...');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    const sessionToken = await encrypt({ userId: user.id, email: user.email, expiresAt });
    console.log('[verify-otp] Session token created');

    const response = NextResponse.json(
      {
        message: 'Authentification réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );

    // Définir le cookie dans la réponse HTTP explicitement
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      expires: expiresAt,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });

    console.log('[verify-otp] Session cookie set in response');
    console.log('[verify-otp] Response headers:', response.headers);
    console.log('[verify-otp] Success - User authenticated');

    return response;
  } catch (error) {
    console.error('[verify-otp] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du code' },
      { status: 500 }
    );
  }
}





