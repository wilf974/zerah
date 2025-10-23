import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

interface RouteParams {
  id: string;
}

// GET /api/habits/[id]/details - Récupérer tous les détails d'une habitude
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

    // Récupérer les détails
    const details = await prisma.habitDetail.findMany({
      where: { habitId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ details });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/habits/[id]/details - Créer un nouveau détail pour une habitude
export async function POST(
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

    const body = await request.json();
    const { name, type, unit } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nom et type sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le détail n'existe pas déjà
    const existing = await prisma.habitDetail.findUnique({
      where: {
        habitId_name: { habitId, name },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce détail existe déjà' },
        { status: 400 }
      );
    }

    // Créer le détail
    const detail = await prisma.habitDetail.create({
      data: {
        habitId,
        name,
        type,
        unit: unit || null,
      },
    });

    return NextResponse.json({ detail }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du détail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
