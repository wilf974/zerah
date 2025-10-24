import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route: GET /api/auth/stats
 * Retourne les statistiques d'utilisation de l'application
 * - Nombre d'utilisateurs inscrits
 * - Nombre d'utilisateurs en ligne (sessions actives des 5 dernières minutes)
 */
export async function GET(request: NextRequest) {
  try {
    // Compter tous les utilisateurs inscrits
    const totalUsers = await prisma.user.count();

    // Compter les utilisateurs en ligne (sessions valides des 5 dernières minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineUsers = await prisma.session.count({
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    return NextResponse.json(
      {
        totalUsers,
        onlineUsers,
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
