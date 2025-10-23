import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

interface RouteParams {
  id: string;
  detailId: string;
}

// DELETE /api/habits/[id]/details/[detailId] - Supprimer un détail
export async function DELETE(
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
    const detailId = parseInt(resolvedParams.detailId);

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true },
    });

    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier que le détail appartient à cette habitude
    const detail = await prisma.habitDetail.findUnique({
      where: { id: detailId },
      select: { habitId: true },
    });

    if (!detail || detail.habitId !== habitId) {
      return NextResponse.json({ error: 'Détail non trouvé' }, { status: 404 });
    }

    // Supprimer le détail (les entrées seront supprimées en cascade)
    await prisma.habitDetail.delete({
      where: { id: detailId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du détail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
