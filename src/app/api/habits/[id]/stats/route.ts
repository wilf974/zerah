import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/dal';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

/**
 * API Route: GET /api/habits/[id]/stats
 * Récupère les statistiques d'une habitude
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const habitId = parseInt(id);

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: session.userId,
      },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habitude non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer toutes les entrées de l'habitude
    const entries = await prisma.habitEntry.findMany({
      where: {
        habitId,
        completed: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculer le streak (jours consécutifs)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entriesMap = new Map(
      entries.map((e) => [format(new Date(e.date), 'yyyy-MM-dd'), e])
    );

    let checkDate = new Date(today);
    while (entriesMap.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculer les stats du mois en cours
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const completedThisMonth = entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    }).length;

    const completionRate = daysInMonth.length > 0 
      ? Math.round((completedThisMonth / daysInMonth.length) * 100)
      : 0;

    // Données pour le graphique (30 derniers jours)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      last30Days.push({
        date: dateStr,
        completed: entriesMap.has(dateStr) ? 1 : 0,
      });
    }

    return NextResponse.json(
      {
        stats: {
          currentStreak,
          totalCompletions: entries.length,
          completionRate,
          completedThisMonth,
          daysInMonth: daysInMonth.length,
          last30Days,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}





