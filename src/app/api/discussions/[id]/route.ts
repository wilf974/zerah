import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/discussions/[id]
 * Récupère les détails d'une discussion spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const discussionId = parseInt(id, 10);
    if (isNaN(discussionId)) {
      return NextResponse.json(
        { error: 'ID de discussion invalide' },
        { status: 400 }
      );
    }

    // Récupérer la discussion
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
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
        comments: {
          where: {
            parentId: null // Seulement les commentaires de premier niveau
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion introuvable' },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues
    await prisma.discussion.update({
      where: { id: discussionId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ discussion }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération de la discussion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/discussions/[id]
 * Met à jour une discussion (statut, épinglage)
 * Body: { status?: string, isPinned?: boolean, title?: string, content?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const discussionId = parseInt(id, 10);
    if (isNaN(discussionId)) {
      return NextResponse.json(
        { error: 'ID de discussion invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, isPinned, title, content } = body;

    // Récupérer la discussion
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'auteur
    if (discussion.userId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette discussion' },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    // Mettre à jour la discussion
    const updatedDiscussion = await prisma.discussion.update({
      where: { id: discussionId },
      data: updateData,
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
      message: 'Discussion mise à jour',
      discussion: updatedDiscussion
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la discussion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussions/[id]
 * Supprime une discussion (seulement l'auteur)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const discussionId = parseInt(id, 10);
    if (isNaN(discussionId)) {
      return NextResponse.json(
        { error: 'ID de discussion invalide' },
        { status: 400 }
      );
    }

    // Récupérer la discussion
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'auteur
    if (discussion.userId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette discussion' },
        { status: 403 }
      );
    }

    // Supprimer la discussion (les commentaires seront supprimés en cascade)
    await prisma.discussion.delete({
      where: { id: discussionId }
    });

    return NextResponse.json({
      message: 'Discussion supprimée'
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la discussion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
