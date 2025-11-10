import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

interface UserStats {
  userId: number;
  userName: string | null;
  userEmail: string;
  totalHabits: number;
  completionRate: number;
  currentStreak: number;
  totalCompletions: number;
  score: number;
}

/**
 * Calcule la série actuelle (streak) pour un utilisateur
 */
async function calculateCurrentStreak(userId: number): Promise<number> {
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      isArchived: false
    },
    include: {
      entries: {
        where: {
          completed: true
        },
        orderBy: {
          date: 'desc'
        },
        take: 365 // Limiter à 1 an pour les performances
      }
    }
  });

  if (habits.length === 0) return 0;

  // Pour chaque jour depuis aujourd'hui, vérifier si au moins une habitude a été complétée
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    // Vérifier si au moins une habitude a été complétée ce jour
    const hasCompletion = habits.some(habit =>
      habit.entries.some(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toISOString().split('T')[0] === dateStr;
      })
    );

    if (hasCompletion) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * GET /api/leaderboard?period=week|month|all
 * Récupère le classement des utilisateurs
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
    const currentUserId = (verified.payload as { userId: number }).userId;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'week', 'month', 'all'

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        startDate = new Date('2000-01-01'); // Date très ancienne
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Récupérer tous les utilisateurs avec leurs habitudes
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false
      },
      include: {
        habits: {
          where: {
            isArchived: false
          },
          include: {
            entries: {
              where: {
                completed: true,
                date: {
                  gte: startDate
                }
              }
            }
          }
        }
      }
    });

    // Calculer les statistiques pour chaque utilisateur
    const userStats: UserStats[] = [];

    for (const user of users) {
      const totalHabits = user.habits.length;

      if (totalHabits === 0) continue; // Ignorer les utilisateurs sans habitudes

      // Calculer le nombre total de completions
      const totalCompletions = user.habits.reduce(
        (sum, habit) => sum + habit.entries.length,
        0
      );

      // Calculer le taux de complétion
      // Pour la période, on compte le nombre de jours où au moins une habitude devait être faite
      const daysSincePeriodStart = Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const expectedCompletions = totalHabits * daysSincePeriodStart;
      const completionRate = expectedCompletions > 0
        ? Math.round((totalCompletions / expectedCompletions) * 100)
        : 0;

      // Calculer la série actuelle (uniquement pour période 'all')
      const currentStreak = period === 'all'
        ? await calculateCurrentStreak(user.id)
        : 0;

      // Calculer un score global
      // Score = (completions * 10) + (completionRate * 5) + (streak * 20)
      const score = (totalCompletions * 10) + (completionRate * 5) + (currentStreak * 20);

      userStats.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        totalHabits,
        completionRate,
        currentStreak,
        totalCompletions,
        score
      });
    }

    // Trier par score décroissant
    userStats.sort((a, b) => b.score - a.score);

    // Ajouter le rang
    const leaderboard = userStats.map((stat, index) => ({
      rank: index + 1,
      ...stat,
      isCurrentUser: stat.userId === currentUserId
    }));

    // Trouver la position de l'utilisateur actuel
    const currentUserRank = leaderboard.find(entry => entry.isCurrentUser)?.rank || null;

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      period,
      totalUsers: leaderboard.length
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du classement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
