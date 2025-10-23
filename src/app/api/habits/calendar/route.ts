import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/habits/calendar
 * Récupère les statistiques de complétion pour toutes les habitudes d'un utilisateur sur une période
 * Query params: startDate, endDate (format: YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Récupérer toutes les habitudes de l'utilisateur
    const habits = await prisma.habit.findMany({
      where: { userId: session.userId },
      include: {
        entries: {
          where: {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
      },
    });

    // Créer un map pour chaque jour
    const daysMap: Record<string, any> = {};

    // Itérer sur toutes les dates
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      daysMap[dateStr] = {
        date: dateStr,
        completedCount: 0,
        totalHabits: 0,
        habits: [],
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Compter les habitudes complétées par jour
    habits.forEach((habit) => {
      habit.entries.forEach((entry) => {
        const dateStr = entry.date.toISOString().split('T')[0];
        if (daysMap[dateStr]) {
          if (entry.completed) {
            daysMap[dateStr].completedCount++;
          }
          daysMap[dateStr].habits.push({
            id: habit.id,
            name: habit.name,
            completed: entry.completed,
          });
        }
      });

      // Marquer les habitudes non complétées pour chaque jour
      Object.keys(daysMap).forEach((dateStr) => {
        const foundEntry = habit.entries.find(
          (e) => e.date.toISOString().split('T')[0] === dateStr
        );
        if (!foundEntry) {
          daysMap[dateStr].totalHabits++;
        }
      });
    });

    // Calculer le total d'habitudes et le taux de complétion
    Object.keys(daysMap).forEach((dateStr) => {
      const day = daysMap[dateStr];
      day.totalHabits = habits.length;
      day.completionRate = day.totalHabits > 0 ? day.completedCount / day.totalHabits : 0;
    });

    return NextResponse.json({
      days: Object.values(daysMap),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du calendrier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

