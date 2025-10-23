import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/export-data
 * Exporter toutes les données personnelles de l'utilisateur connecté
 * Art. 20 RGPD - Droit à la portabilité des données
 * IMPORTANT : Seules les données de l'utilisateur authentifié sont retournées
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer UNIQUEMENT les données de l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        habits: {
          include: {
            entries: {
              include: {
                values: {
                  include: {
                    detail: true,
                  },
                },
              },
            },
            details: true,
          },
        },
        sessions: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Construire l'export complet UNIQUEMENT pour cet utilisateur
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        
        // Profil de santé
        healthProfile: {
          height: user.height,
          weight: user.weight,
          age: user.age,
          gender: user.gender,
          activityLevel: user.activityLevel,
          profileUpdatedAt: user.profileUpdated,
        },
        
        // Consentements RGPD
        consent: {
          analytics: user.consentAnalytics,
          marketing: user.consentMarketing,
          cookies: user.consentCookies,
          updatedAt: user.consentUpdatedAt,
        },
        
        // Dates RGPD
        dataManagement: {
          dataExportedAt: user.dataExportedAt,
          deletionRequestedAt: user.deletionRequestedAt,
          deletionScheduledFor: user.deletionScheduledFor,
          isDeleted: user.isDeleted,
        },
      },
      
      // Habitudes et entrées
      habits: user.habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        description: habit.description,
        icon: habit.icon,
        color: habit.color,
        createdAt: habit.createdAt,
        
        details: habit.details.map((detail) => ({
          id: detail.id,
          name: detail.name,
          type: detail.type,
          unit: detail.unit,
          createdAt: detail.createdAt,
        })),
        
        entries: habit.entries.map((entry) => ({
          id: entry.id,
          date: entry.date,
          completed: entry.completed,
          note: entry.note,
          createdAt: entry.createdAt,
          values: entry.values.map((value) => ({
            id: value.id,
            detailId: value.detailId,
            detailName: value.detail.name,
            value: value.value,
            createdAt: value.createdAt,
          })),
        })),
      })),
      
      // Sessions actives
      sessions: user.sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })),
      
      // Métadonnées de l'export
      metadata: {
        format: 'application/json',
        version: '1.0',
        rgpdCompliant: true,
        dataSubject: user.email,
        exportedFor: user.email,
      },
    };

    // Mettre à jour la date du dernier export
    await prisma.user.update({
      where: { id: session.userId },
      data: { dataExportedAt: new Date() },
    });

    // Retourner en JSON avec header de téléchargement
    const response = new NextResponse(JSON.stringify(exportData, null, 2));
    response.headers.set('Content-Type', 'application/json');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="zerah-export-${new Date().toISOString().split('T')[0]}.json"`
    );

    return response;
  } catch (error) {
    console.error('Erreur lors de l\'export de données :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
