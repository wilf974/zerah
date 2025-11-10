import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/challenges/[id]
 * Récupère les détails d'un défi spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;

    const { id } = await params;
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json(
        { error: 'ID de défi invalide' },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        habit: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            currentProgress: 'desc'
          }
        }
      }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Défi introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est impliqué dans ce défi
    const isParticipant = challenge.participants.some(p => p.userId === userId);
    const isCreator = challenge.creatorId === userId;

    if (!isParticipant && !isCreator) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à voir ce défi' },
        { status: 403 }
      );
    }

    return NextResponse.json(challenge, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du défi:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/challenges/[id]
 * Met à jour un défi ou l'invitation d'un participant
 * Body: { action: 'accept' | 'decline' | 'cancel' | 'update_progress' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;

    const { id } = await params;
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json(
        { error: 'ID de défi invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !['accept', 'decline', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide (accept, decline, ou cancel)' },
        { status: 400 }
      );
    }

    // Récupérer le défi
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: true
      }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Défi introuvable' },
        { status: 404 }
      );
    }

    // Gérer les différentes actions
    if (action === 'cancel') {
      // Seul le créateur peut annuler un défi
      if (challenge.creatorId !== userId) {
        return NextResponse.json(
          { error: 'Seul le créateur peut annuler ce défi' },
          { status: 403 }
        );
      }

      // Annuler le défi
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { status: 'cancelled' }
      });

      return NextResponse.json({
        message: 'Défi annulé',
        challenge: await prisma.challenge.findUnique({
          where: { id: challengeId },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        })
      }, { status: 200 });
    }

    if (action === 'accept' || action === 'decline') {
      // Trouver la participation de l'utilisateur
      const participation = challenge.participants.find(p => p.userId === userId);

      if (!participation) {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas invité à ce défi' },
          { status: 404 }
        );
      }

      if (participation.status !== 'invited') {
        return NextResponse.json(
          { error: 'Vous avez déjà répondu à cette invitation' },
          { status: 400 }
        );
      }

      // Mettre à jour la participation
      const updatedParticipation = await prisma.challengeParticipant.update({
        where: { id: participation.id },
        data: {
          status: action === 'accept' ? 'accepted' : 'declined',
          joinedAt: action === 'accept' ? new Date() : null
        }
      });

      // Si c'est la première acceptation et que le défi est en pending, le passer en active
      if (action === 'accept' && challenge.status === 'pending') {
        const acceptedCount = challenge.participants.filter(
          p => p.status === 'accepted' || (p.id === participation.id)
        ).length;

        if (acceptedCount >= 1) {
          await prisma.challenge.update({
            where: { id: challengeId },
            data: { status: 'active' }
          });
        }
      }

      return NextResponse.json({
        message: action === 'accept' ? 'Invitation acceptée' : 'Invitation refusée',
        participation: updatedParticipation
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du défi:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/challenges/[id]
 * Supprime un défi (seulement le créateur)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;

    const { id } = await params;
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json(
        { error: 'ID de défi invalide' },
        { status: 400 }
      );
    }

    // Récupérer le défi
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Défi introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le créateur
    if (challenge.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Seul le créateur peut supprimer ce défi' },
        { status: 403 }
      );
    }

    // Supprimer le défi (les participants seront supprimés en cascade)
    await prisma.challenge.delete({
      where: { id: challengeId }
    });

    return NextResponse.json({
      message: 'Défi supprimé'
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du défi:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
