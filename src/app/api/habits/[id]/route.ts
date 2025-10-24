import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/dal';

/**
 * API Route: PATCH /api/habits/[id]
 * Met à jour une habitude (archivage, catégorie, tags, objectifs)
 */
export async function PATCH(
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

    // Mettre à jour les champs autorisés
    const updateData: any = {};
    if (body.hasOwnProperty('isArchived')) {
      updateData.isArchived = body.isArchived;
    }
    if (body.hasOwnProperty('category')) {
      updateData.category = body.category;
    }
    if (body.hasOwnProperty('tags')) {
      updateData.tags = body.tags;
    }
    if (body.hasOwnProperty('frequency')) {
      updateData.frequency = body.frequency;
    }
    if (body.hasOwnProperty('targetDays')) {
      updateData.targetDays = body.targetDays;
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: updateData,
    });

    console.log(`[habits] Habitude ${habitId} mise à jour:`, updateData);

    return NextResponse.json(updatedHabit, { status: 200 });
  } catch (error) {
    console.error('[habits] Error updating habit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'habitude' },
      { status: 500 }
    );
  }
}

/**
 * API Route: DELETE /api/habits/[id]
 * Supprime une habitude
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

    // Supprimer l'habitude (les entrées seront supprimées en cascade)
    await prisma.habit.delete({
      where: {
        id: habitId,
      },
    });

    return NextResponse.json(
      { message: 'Habitude supprimée' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}







