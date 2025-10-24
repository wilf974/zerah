import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

/**
 * API Route: POST /api/auth/logout
 * Supprime la session utilisateur
 */
export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}





