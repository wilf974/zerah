import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/dal';

/**
 * API Route: GET /api/habits
 * Récupère les habitudes de l'utilisateur avec filtrage et tri
 * Query params:
 * - showArchived: "true"|"false" (défaut: false)
 * - category: nom de la catégorie (optionnel)
 * - sortBy: "name"|"created"|"completion" (défaut: "created")
 * - sortOrder: "asc"|"desc" (défaut: "desc")
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de filtrage
    const searchParams = request.nextUrl.searchParams;
    const showArchived = searchParams.get('showArchived') === 'true';
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'created';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Construire le filtre
    const where: any = {
      userId: session.userId,
      isArchived: showArchived ? undefined : false, // Ne pas filtrer si showArchived=true
    };

    if (category) {
      where.category = category;
    }

    // Construire le tri
    const orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'completion':
        // Tri par création par défaut (pas de tri par complétion côté DB)
        orderBy.createdAt = sortOrder;
        break;
      case 'created':
      default:
        orderBy.createdAt = sortOrder;
    }

    const habits = await prisma.habit.findMany({
      where,
      orderBy,
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

