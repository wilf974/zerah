import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/discussions/[id]/comments
 * Récupère les commentaires d'une discussion
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

    // Vérifier que la discussion existe
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les commentaires (seulement premier niveau)
    const comments = await prisma.comment.findMany({
      where: {
        discussionId,
        parentId: null
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
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions/[id]/comments
 * Ajoute un commentaire à une discussion
 * Body: { content: string, parentId?: number }
 */
export async function POST(
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
    const { content, parentId } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Le contenu du commentaire est requis' },
        { status: 400 }
      );
    }

    // Vérifier que la discussion existe
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le commentaire parent existe si fourni
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.discussionId !== discussionId) {
        return NextResponse.json(
          { error: 'Commentaire parent introuvable' },
          { status: 404 }
        );
      }
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        discussionId,
        userId,
        content,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Commentaire ajouté',
      comment
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussions/[id]/comments/[commentId]
 * Supprime un commentaire (seulement l'auteur)
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID du commentaire requis' },
        { status: 400 }
      );
    }

    const commentIdInt = parseInt(commentId, 10);
    if (isNaN(commentIdInt)) {
      return NextResponse.json(
        { error: 'ID du commentaire invalide' },
        { status: 400 }
      );
    }

    // Récupérer le commentaire
    const comment = await prisma.comment.findUnique({
      where: { id: commentIdInt }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'auteur
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce commentaire' },
        { status: 403 }
      );
    }

    // Supprimer le commentaire (les réponses seront supprimées en cascade)
    await prisma.comment.delete({
      where: { id: commentIdInt }
    });

    return NextResponse.json({
      message: 'Commentaire supprimé'
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
