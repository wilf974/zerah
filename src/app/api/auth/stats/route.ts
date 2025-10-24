import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route: GET /api/auth/stats
 * Retourne les statistiques d'utilisation de l'application
 * - Nombre d'utilisateurs inscrits
 * - Nombre d'utilisateurs en ligne (utilisateurs avec au moins une habitude validée aujourd'hui)
 */
export async function GET(request: NextRequest) {
  try {
    // Compter tous les utilisateurs inscrits (non supprimés)
    const totalUsers = await prisma.user.count({
      where: {
        isDeleted: false,
      },
    });

    // Compter les utilisateurs "en ligne" = utilisateurs actifs aujourd'hui
    // (ceux qui ont complété une habitude aujourd'hui ou créé une habitude aujourd'hui)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeUsers = await prisma.user.count({
      where: {
        isDeleted: false,
        OR: [
          {
            habits: {
              some: {
                entries: {
                  some: {
                    date: {
                      gte: today,
                    },
                  },
                },
              },
            },
          },
          {
            habits: {
              some: {
                createdAt: {
                  gte: today,
                },
              },
            },
          },
        ],
      },
    });

    return NextResponse.json(
      {
        totalUsers,
        onlineUsers: activeUsers,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in auth/stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
