import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/dal';

/**
 * API Route: POST /api/habits/[id]/entries
 * Marque une habitude comme complétée pour une date donnée
 */
export async function POST(
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

    const body = await request.json();
    const { date, completed = true, note } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { error: 'La date est requise' },
        { status: 400 }
      );
    }

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

    // Créer ou mettre à jour l'entrée
    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId,
          date: new Date(date),
        },
      },
      update: {
        completed,
        note: note || null,
      },
      create: {
        habitId,
        date: new Date(date),
        completed,
        note: note || null,
      },
    });

    return NextResponse.json({ entry }, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating entry:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
}

/**
 * API Route: DELETE /api/habits/[id]/entries
 * Supprime une entrée d'habitude pour une date donnée
 */
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'La date est requise' },
        { status: 400 }
      );
    }

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

    // Supprimer l'entrée
    await prisma.habitEntry.delete({
      where: {
        habitId_date: {
          habitId,
          date: new Date(date),
        },
      },
    });

    return NextResponse.json(
      { message: 'Entrée supprimée' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}







