import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.SESSION_SECRET || '';
const secret = new TextEncoder().encode(secretKey);

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
        email: true, 
        name: true,
        height: true,
        weight: true,
        age: true,
        gender: true,
        activityLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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
    const { name, email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'L&apos;email est requis' }, { status: 400 });
    }

    // Vérifier si l'email est déjà utilisé
    if (email !== (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ? name.trim() : null,
        email: email.trim(),
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
