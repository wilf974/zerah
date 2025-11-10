import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/discussions?habitId=[habitId]&status=[status]&sort=[recent|popular]
 * Récupère la liste des discussions
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

    await jwtVerify(token, secret);

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');
    const status = searchParams.get('status') || 'open';
    const sort = searchParams.get('sort') || 'recent';

    // Construire les filtres
    const where: any = {
      status
    };

    if (habitId) {
      where.habitId = parseInt(habitId, 10);
    }

    // Trier les résultats
    let orderBy: any = {};
    if (sort === 'popular') {
      orderBy = { viewCount: 'desc' as const };
    } else if (sort === 'recent') {
      orderBy = { createdAt: 'desc' as const };
    }

    const discussions = await prisma.discussion.findMany({
      where,
      orderBy,
      include: {
        user: {
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
        _count: {
          select: {
            comments: true
          }
        }
      },
      take: 50 // Limiter à 50 discussions
    });

    return NextResponse.json({ discussions }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des discussions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions
 * Crée une nouvelle discussion
 * Body: { habitId?: number, title: string, content: string }
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
    const { habitId, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'habitude existe si habitId est fourni
    if (habitId) {
      const habit = await prisma.habit.findUnique({
        where: { id: habitId }
      });

      if (!habit) {
        return NextResponse.json(
          { error: 'Habitude introuvable' },
          { status: 404 }
        );
      }
    }

    // Créer la discussion
    const discussion = await prisma.discussion.create({
      data: {
        habitId: habitId || null,
        userId,
        title,
        content,
        status: 'open'
      },
      include: {
        user: {
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
        }
      }
    });

    return NextResponse.json({
      message: 'Discussion créée',
      discussion
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la discussion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
