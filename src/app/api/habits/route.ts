import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/dal';

/**
 * API Route: GET /api/habits
 * Récupère toutes les habitudes de l'utilisateur connecté
 */
export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        entries: {
          orderBy: {
            date: 'desc',
          },
          take: 30,
        },
      },
    });

    return NextResponse.json({ habits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des habitudes' },
      { status: 500 }
    );
  }
}

/**
 * API Route: POST /api/habits
 * Crée une nouvelle habitude avec détails optionnels
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon, color, details } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || '📝',
        color: color || '#667eea',
        userId: session.userId,
      },
    });

    // Créer les détails si fournis (depuis une recommandation)
    if (details && Array.isArray(details) && details.length > 0) {
      for (const detail of details) {
        await prisma.habitDetail.create({
          data: {
            habitId: habit.id,
            name: detail.name,
            type: detail.type,
            unit: detail.unit || null,
          },
        });
      }
    }

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'habitude' },
      { status: 500 }
    );
  }
}

