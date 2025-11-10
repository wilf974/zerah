import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/notifications/preferences
 * Récupère les préférences de notification de l'utilisateur
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

    // Récupérer ou créer les préférences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Si pas de préférences, créer avec valeurs par défaut
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          dailyReminder: false,
          dailyReminderTime: '09:00',
          weeklyDigest: false,
          weeklyDigestDay: 1,
          monthlyDigest: false,
          monthlyDigestDay: 1,
          habitReminders: true,
          friendRequests: true,
          challengeInvites: true,
          challengeUpdates: true,
          discussionReplies: true,
          achievements: true
        }
      });
    }

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/preferences
 * Met à jour les préférences de notification
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
    const {
      emailEnabled,
      dailyReminder,
      dailyReminderTime,
      weeklyDigest,
      weeklyDigestDay,
      monthlyDigest,
      monthlyDigestDay,
      habitReminders,
      friendRequests,
      challengeInvites,
      challengeUpdates,
      discussionReplies,
      achievements
    } = body;

    // Vérifier si les préférences existent
    const existingPreferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    let preferences;

    if (existingPreferences) {
      // Mettre à jour
      preferences = await prisma.notificationPreference.update({
        where: { userId },
        data: {
          ...(emailEnabled !== undefined && { emailEnabled }),
          ...(dailyReminder !== undefined && { dailyReminder }),
          ...(dailyReminderTime !== undefined && { dailyReminderTime }),
          ...(weeklyDigest !== undefined && { weeklyDigest }),
          ...(weeklyDigestDay !== undefined && { weeklyDigestDay }),
          ...(monthlyDigest !== undefined && { monthlyDigest }),
          ...(monthlyDigestDay !== undefined && { monthlyDigestDay }),
          ...(habitReminders !== undefined && { habitReminders }),
          ...(friendRequests !== undefined && { friendRequests }),
          ...(challengeInvites !== undefined && { challengeInvites }),
          ...(challengeUpdates !== undefined && { challengeUpdates }),
          ...(discussionReplies !== undefined && { discussionReplies }),
          ...(achievements !== undefined && { achievements })
        }
      });
    } else {
      // Créer
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          dailyReminder: dailyReminder !== undefined ? dailyReminder : false,
          dailyReminderTime: dailyReminderTime || '09:00',
          weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : false,
          weeklyDigestDay: weeklyDigestDay !== undefined ? weeklyDigestDay : 1,
          monthlyDigest: monthlyDigest !== undefined ? monthlyDigest : false,
          monthlyDigestDay: monthlyDigestDay !== undefined ? monthlyDigestDay : 1,
          habitReminders: habitReminders !== undefined ? habitReminders : true,
          friendRequests: friendRequests !== undefined ? friendRequests : true,
          challengeInvites: challengeInvites !== undefined ? challengeInvites : true,
          challengeUpdates: challengeUpdates !== undefined ? challengeUpdates : true,
          discussionReplies: discussionReplies !== undefined ? discussionReplies : true,
          achievements: achievements !== undefined ? achievements : true
        }
      });
    }

    return NextResponse.json({
      message: 'Préférences mises à jour',
      preferences
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
