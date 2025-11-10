import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/friends
 * Récupère tous les amis et demandes d'amis de l'utilisateur
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

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;

    // Récupérer toutes les relations d'amitié
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Organiser les résultats
    const friends = friendships
      .filter(f => f.status === 'accepted')
      .map(f => {
        const friend = f.senderId === userId ? f.receiver : f.sender;
        return {
          friendshipId: f.id,
          user: friend,
          since: f.updatedAt
        };
      });

    const sentRequests = friendships
      .filter(f => f.status === 'pending' && f.senderId === userId)
      .map(f => ({
        friendshipId: f.id,
        user: f.receiver,
        sentAt: f.createdAt
      }));

    const receivedRequests = friendships
      .filter(f => f.status === 'pending' && f.receiverId === userId)
      .map(f => ({
        friendshipId: f.id,
        user: f.sender,
        receivedAt: f.createdAt
      }));

    return NextResponse.json({
      friends,
      sentRequests,
      receivedRequests
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des amis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends
 * Envoie une demande d'ami
 * Body: { targetUserId: number }
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
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== 'number') {
      return NextResponse.json(
        { error: 'ID utilisateur cible invalide' },
        { status: 400 }
      );
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous ajouter vous-même' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser || targetUser.isDeleted) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'existe pas déjà une relation
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId }
        ]
      }
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json(
          { error: 'Vous êtes déjà amis avec cet utilisateur' },
          { status: 400 }
        );
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json(
          { error: 'Une demande d\'ami est déjà en attente' },
          { status: 400 }
        );
      }
    }

    // Créer la demande d'ami
    const friendship = await prisma.friendship.create({
      data: {
        senderId: userId,
        receiverId: targetUserId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Demande d\'ami envoyée',
      friendship
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande d\'ami:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/friends
 * Accepte ou refuse une demande d'ami
 * Body: { friendshipId: number, action: 'accept' | 'reject' }
 */
export async function PATCH(request: NextRequest) {
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
    const { friendshipId, action } = body;

    if (!friendshipId || typeof friendshipId !== 'number') {
      return NextResponse.json(
        { error: 'ID de demande invalide' },
        { status: 400 }
      );
    }

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide (accept ou reject)' },
        { status: 400 }
      );
    }

    // Vérifier que la demande existe et est en attente
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Demande d\'ami introuvable' },
        { status: 404 }
      );
    }

    if (friendship.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette demande' },
        { status: 403 }
      );
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cette demande n\'est plus en attente' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === 'accept' ? 'accepted' : 'rejected'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: action === 'accept' ? 'Demande acceptée' : 'Demande refusée',
      friendship: updatedFriendship
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande d\'ami:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/friends?friendshipId=<id>
 * Supprime un ami ou annule une demande d'ami
 */
export async function DELETE(request: NextRequest) {
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
    const friendshipIdStr = searchParams.get('friendshipId');

    if (!friendshipIdStr) {
      return NextResponse.json(
        { error: 'ID de relation requis' },
        { status: 400 }
      );
    }

    const friendshipId = parseInt(friendshipIdStr, 10);

    if (isNaN(friendshipId)) {
      return NextResponse.json(
        { error: 'ID de relation invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la relation existe
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Relation introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est impliqué dans cette relation
    if (friendship.senderId !== userId && friendship.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette relation' },
        { status: 403 }
      );
    }

    // Supprimer la relation
    await prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return NextResponse.json({
      message: 'Relation supprimée'
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la relation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
