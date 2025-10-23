import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/habits/[id]/calendar
 * Récupère les statistiques de complétion pour une habitude spécifique sur une période
 * Query params: startDate, endDate (format: YYYY-MM-DD)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const habitId = parseInt((await params).id);
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Récupérer l'habitude
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
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

    if (!habit || habit.userId !== session.userId) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

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
        totalHabits: 1,
        completionRate: 0,
        habits: [
          {
            id: habit.id,
            name: habit.name,
            completed: false,
          },
        ],
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Marquer les entrées complétées
    habit.entries.forEach((entry) => {
      const dateStr = entry.date.toISOString().split('T')[0];
      if (daysMap[dateStr]) {
        daysMap[dateStr].completedCount = entry.completed ? 1 : 0;
        daysMap[dateStr].completionRate = entry.completed ? 1 : 0;
        daysMap[dateStr].habits[0].completed = entry.completed;
      }
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

