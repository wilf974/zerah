import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/delete-account
 * Demander la suppression de compte de l'utilisateur
 * Art. 17 RGPD - Droit à l'oubli
 * 
 * Processus :
 * 1. Soft delete : marquage pour suppression
 * 2. Période de grâce : 30 jours pour changer d'avis
 * 3. Suppression définitive : après 30 jours
 * 
 * IMPORTANT : Chaque utilisateur ne peut supprimer que son propre compte
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, deletionRequestedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Si une demande de suppression existe déjà, retourner l'info
    if (user.deletionRequestedAt) {
      return NextResponse.json({
        success: true,
        message: 'Une demande de suppression est déjà en cours',
        deletionRequestedAt: user.deletionRequestedAt,
        deletionScheduledFor: new Date(
          new Date(user.deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000
        ),
      });
    }

    // Programmer la suppression pour dans 30 jours
    const deletionScheduledFor = new Date();
    deletionScheduledFor.setDate(deletionScheduledFor.getDate() + 30);

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        deletionRequestedAt: new Date(),
        deletionScheduledFor,
        isDeleted: false, // Pas encore supprimé, juste programmé
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Demande de suppression enregistrée',
      info: {
        email: user.email,
        deletionRequestedAt: new Date(),
        deletionScheduledFor,
        gracePeriodDays: 30,
        note: 'Vous pouvez annuler cette demande dans les 30 prochains jours',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la demande de suppression :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/delete-account
 * Annuler la demande de suppression de compte
 * L'utilisateur peut annuler jusqu'à la suppression définitive
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, deletionRequestedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Si pas de demande de suppression, retourner erreur
    if (!user.deletionRequestedAt) {
      return NextResponse.json(
        { error: 'Aucune demande de suppression en cours' },
        { status: 400 }
      );
    }

    // Annuler la demande de suppression
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        deletionRequestedAt: null,
        deletionScheduledFor: null,
        isDeleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Demande de suppression annulée',
      email: user.email,
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de suppression :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/delete-account
 * Récupérer le statut de suppression de l'utilisateur
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer UNIQUEMENT les données de l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        deletionRequestedAt: true,
        deletionScheduledFor: true,
        isDeleted: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletionStatus: {
        isDeleted: user.isDeleted,
        deletionRequestedAt: user.deletionRequestedAt,
        deletionScheduledFor: user.deletionScheduledFor,
        hasActiveDeletionRequest: !!user.deletionRequestedAt && !user.isDeleted,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de suppression :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
