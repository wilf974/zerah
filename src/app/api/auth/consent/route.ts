import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/consent
 * Sauvegarder les préférences de consentement de l'utilisateur
 * Chaque utilisateur ne peut modifier que ses propres consentements
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { consentAnalytics, consentMarketing, consentCookies } = await req.json();

    // Valider les données
    if (typeof consentAnalytics !== 'boolean' || typeof consentMarketing !== 'boolean') {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }

    // Mettre à jour le consentement UNIQUEMENT pour l'utilisateur authentifié
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        consentAnalytics,
        consentMarketing,
        consentCookies: consentCookies === true,
        consentUpdatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        consentAnalytics: true,
        consentMarketing: true,
        consentCookies: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Consentements mis à jour avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des consentements :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/consent
 * Récupérer les préférences de consentement de l'utilisateur authentifié
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer UNIQUEMENT les données de l'utilisateur authentifié
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        consentAnalytics: true,
        consentMarketing: true,
        consentCookies: true,
        consentUpdatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      consent: user,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des consentements :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
