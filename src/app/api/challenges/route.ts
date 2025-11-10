import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/challenges
 * Récupère tous les défis de l'utilisateur (créés + participations)
 */
export async function GET(request: NextRequest) {
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

    // Récupérer les défis créés par l'utilisateur
    const createdChallenges = await prisma.challenge.findMany({
      where: { creatorId: userId },
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
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les défis auxquels l'utilisateur participe
    const participatingChallenges = await prisma.challengeParticipant.findMany({
      where: { userId },
      include: {
        challenge: {
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
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      createdChallenges,
      participatingChallenges: participatingChallenges.map(p => ({
        ...p.challenge,
        myParticipation: {
          status: p.status,
          currentProgress: p.currentProgress,
          joinedAt: p.joinedAt,
          completedAt: p.completedAt
        }
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des défis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges
 * Crée un nouveau défi et invite des amis
 * Body: {
 *   habitId: number,
 *   name: string,
 *   description?: string,
 *   startDate: string (ISO),
 *   endDate: string (ISO),
 *   targetCompletions: number,
 *   invitedFriendIds: number[]
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      habitId,
      name,
      description,
      startDate,
      endDate,
      targetCompletions,
      invitedFriendIds = []
    } = body;

    // Validation des champs
    if (!habitId || typeof habitId !== 'number') {
      return NextResponse.json(
        { error: 'ID d\'habitude invalide' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom du défi est requis' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    if (!targetCompletions || targetCompletions < 1) {
      return NextResponse.json(
        { error: 'Le nombre de completions requis doit être au moins 1' },
        { status: 400 }
      );
    }

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: userId
      }
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habitude introuvable ou non autorisée' },
        { status: 404 }
      );
    }

    // Vérifier que les dates sont valides
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return NextResponse.json(
        { error: 'La date de début doit être avant la date de fin' },
        { status: 400 }
      );
    }

    if (end < now) {
      return NextResponse.json(
        { error: 'La date de fin ne peut pas être dans le passé' },
        { status: 400 }
      );
    }

    // Vérifier que tous les invités sont des amis
    if (invitedFriendIds.length > 0) {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: { in: invitedFriendIds },
              status: 'accepted'
            },
            {
              receiverId: userId,
              senderId: { in: invitedFriendIds },
              status: 'accepted'
            }
          ]
        }
      });

      const friendIds = new Set(
        friendships.map(f => f.senderId === userId ? f.receiverId : f.senderId)
      );

      const invalidIds = invitedFriendIds.filter((id: number) => !friendIds.has(id));
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: 'Certains utilisateurs invités ne sont pas vos amis' },
          { status: 400 }
        );
      }
    }

    // Créer le défi avec les participants
    const challenge = await prisma.challenge.create({
      data: {
        creatorId: userId,
        habitId,
        name: name.trim(),
        description: description?.trim() || null,
        startDate: start,
        endDate: end,
        targetCompletions,
        status: 'pending',
        participants: {
          create: [
            // Le créateur participe automatiquement avec status "accepted"
            {
              userId: userId,
              status: 'accepted',
              joinedAt: new Date()
            },
            // Les invités ont status "invited"
            ...invitedFriendIds.map((friendId: number) => ({
              userId: friendId,
              status: 'invited'
            }))
          ]
        }
      },
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
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Défi créé avec succès',
      challenge
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du défi:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
