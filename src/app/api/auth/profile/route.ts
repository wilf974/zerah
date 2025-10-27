import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

/**
 * GET /api/auth/profile - Récupère le profil utilisateur avec les champs étendus
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        activityLevel: true,
        height: true,
        weight: true,
        gender: true,
        age: true,
        profileUpdated: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PUT /api/auth/profile - Met à jour le profil utilisateur
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, secret);
    const userId = (verified.payload as { userId: number }).userId;

    const body = await request.json();
    const { name, activityLevel, height, weight, gender, age } = body;

    // Validation basique
    if (height !== undefined && (height < 100 || height > 250)) {
      return NextResponse.json({ error: 'Taille invalide (100-250 cm)' }, { status: 400 });
    }
    if (weight !== undefined && (weight < 30 || weight > 300)) {
      return NextResponse.json({ error: 'Poids invalide (30-300 kg)' }, { status: 400 });
    }
    if (age !== undefined && (age < 10 || age > 120)) {
      return NextResponse.json({ error: 'Âge invalide (10-120 ans)' }, { status: 400 });
    }

    const validActivityLevels = ['sedentaire', 'modere', 'actif', 'tres_actif'];
    if (activityLevel && !validActivityLevels.includes(activityLevel)) {
      return NextResponse.json({ error: 'Niveau d\'activité invalide' }, { status: 400 });
    }

    const validGenders = ['homme', 'femme', 'autre'];
    if (gender && !validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Genre invalide' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        activityLevel: activityLevel !== undefined ? activityLevel : undefined,
        height: height !== undefined ? height : undefined,
        weight: weight !== undefined ? weight : undefined,
        gender: gender !== undefined ? gender : undefined,
        age: age !== undefined ? age : undefined,
        profileUpdated: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        activityLevel: true,
        height: true,
        weight: true,
        gender: true,
        age: true,
        profileUpdated: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}









