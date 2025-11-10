import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/friends/search?q=<search_query>
 * Recherche des utilisateurs par email ou nom (exclut l'utilisateur connecté et ses amis actuels)
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'La requête de recherche doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Récupérer les IDs des amis existants et demandes en attente
    const existingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      select: {
        senderId: true,
        receiverId: true
      }
    });

    const excludedUserIds = new Set(
      existingFriendships.flatMap(f => [f.senderId, f.receiverId])
    );
    excludedUserIds.add(userId); // Exclure l'utilisateur connecté

    // Rechercher les utilisateurs
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              notIn: Array.from(excludedUserIds)
            }
          },
          {
            isDeleted: false // Exclure les comptes supprimés
          },
          {
            OR: [
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      take: 10, // Limiter les résultats
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
