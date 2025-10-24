import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

interface RouteParams {
  id: string;
}

/**
 * GET /api/habits/[id]/details-stats
 * Récupère les statistiques détaillées pour une habitude (derniers 30 jours)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;
    const habitId = parseInt(resolvedParams.id);

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true },
    });

    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les détails personnalisés
    const details = await prisma.habitDetail.findMany({
      where: { habitId },
    });

    // Récupérer les 30 derniers jours avec leurs valeurs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await prisma.habitEntry.findMany({
      where: {
        habitId,
        date: { gte: thirtyDaysAgo },
      },
      include: {
        values: true,
      },
      orderBy: { date: 'asc' },
    });

    // Construire les statistiques pour chaque détail
    const detailsStats = details.map((detail) => {
      const values = entries
        .map((entry) => {
          const value = entry.values.find((v) => v.detailId === detail.id);
          return value ? { date: entry.date, value: value.value } : null;
        })
        .filter((v) => v !== null) as Array<{ date: Date; value: number }>;

      const numericValues = values.map((v) => v.value);

      return {
        id: detail.id,
        name: detail.name,
        type: detail.type,
        unit: detail.unit,
        data: values.map((v) => ({
          date: v.date.toISOString().split('T')[0],
          value: v.value,
        })),
        stats: {
          average: numericValues.length > 0
            ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2)
            : 0,
          total: numericValues.reduce((a, b) => a + b, 0).toFixed(2),
          min: numericValues.length > 0 ? Math.min(...numericValues).toFixed(2) : 0,
          max: numericValues.length > 0 ? Math.max(...numericValues).toFixed(2) : 0,
          count: numericValues.length,
        },
      };
    });

    return NextResponse.json({ details: detailsStats });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}






