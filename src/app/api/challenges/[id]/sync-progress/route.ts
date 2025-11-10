import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * POST /api/challenges/[id]/sync-progress
 * Synchronise les progrès de tous les participants en comptant leurs HabitEntry
 * pour la période du défi
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const challengeId = parseInt(params.id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json(
        { error: 'ID de défi invalide' },
        { status: 400 }
      );
    }

    // Récupérer le défi
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: true,
        habit: true
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
    if (!isParticipant && challenge.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à synchroniser ce défi' },
        { status: 403 }
      );
    }

    // Pour chaque participant accepté, compter les completions
    const updates = [];
    for (const participant of challenge.participants) {
      if (participant.status !== 'accepted') {
        continue;
      }

      // Compter les entrées complétées pour cet utilisateur sur l'habitude du créateur
      // On doit chercher l'habitude équivalente pour chaque participant
      const userHabits = await prisma.habit.findMany({
        where: {
          userId: participant.userId,
          name: challenge.habit.name // On assume que les participants ont une habitude avec le même nom
        }
      });

      let totalCompletions = 0;
      for (const habit of userHabits) {
        const completions = await prisma.habitEntry.count({
          where: {
            habitId: habit.id,
            completed: true,
            date: {
              gte: challenge.startDate,
              lte: challenge.endDate
            }
          }
        });
        totalCompletions += completions;
      }

      // Mettre à jour le progrès
      await prisma.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          currentProgress: totalCompletions,
          // Marquer comme complété si l'objectif est atteint
          status: totalCompletions >= challenge.targetCompletions ? 'completed' : participant.status,
          completedAt: totalCompletions >= challenge.targetCompletions && !participant.completedAt
            ? new Date()
            : participant.completedAt
        }
      });

      updates.push({
        userId: participant.userId,
        progress: totalCompletions,
        target: challenge.targetCompletions
      });
    }

    // Vérifier si tous les participants ont terminé
    const allCompleted = challenge.participants
      .filter(p => p.status === 'accepted')
      .every(p => updates.find(u => u.userId === p.userId)?.progress >= challenge.targetCompletions);

    // Mettre à jour le statut du défi si tout le monde a terminé
    if (allCompleted && challenge.status === 'active') {
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { status: 'completed' }
      });
    }

    return NextResponse.json({
      message: 'Progrès synchronisés',
      updates,
      challengeCompleted: allCompleted
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la synchronisation des progrès:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
