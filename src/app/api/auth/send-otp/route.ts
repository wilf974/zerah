import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendOTPEmail } from '@/lib/email';

/**
 * API Route: POST /api/auth/send-otp
 * Génère et envoie un code OTP à l'email fourni
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Générer un code OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalider les anciens codes non utilisés pour cet email
    await prisma.oTPCode.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Créer le nouveau code OTP
    await prisma.oTPCode.create({
      data: {
        code,
        email,
        expiresAt,
      },
    });

    // Envoyer l'email
    await sendOTPEmail(email, code);

    return NextResponse.json(
      { message: 'Code OTP envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    );
  }
}





