import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

interface RouteParams {
  id: string;
}

// POST /api/habits/[id]/entries/values - Sauvegarder les valeurs des détails pour une entrée
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
    const { date, values } = body; // values: { detailId: value, ... }

    if (!date || !values) {
      return NextResponse.json(
        { error: 'Date et valeurs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier ou créer l'entrée pour cette date
    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId,
          date: new Date(date),
        },
      },
      create: {
        habitId,
        date: new Date(date),
        completed: true,
      },
      update: {
        completed: true,
      },
    });

    // Sauvegarder les valeurs des détails
    const savedValues = await Promise.all(
      Object.entries(values).map(([detailId, value]) =>
        prisma.habitEntryValue.upsert({
          where: {
            entryId_detailId: {
              entryId: entry.id,
              detailId: parseInt(detailId),
            },
          },
          create: {
            entryId: entry.id,
            detailId: parseInt(detailId),
            value: parseFloat(value as string),
          },
          update: {
            value: parseFloat(value as string),
          },
        })
      )
    );

    return NextResponse.json(
      { entry, values: savedValues },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des valeurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/habits/[id]/entries/values - Récupérer les valeurs des détails pour une date
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

    const date = request.nextUrl.searchParams.get('date');
    if (!date) {
      return NextResponse.json(
        { error: 'Date est requis' },
        { status: 400 }
      );
    }

    // Récupérer l'entrée et ses valeurs
    const entry = await prisma.habitEntry.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: new Date(date),
        },
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Erreur lors de la récupération des valeurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
