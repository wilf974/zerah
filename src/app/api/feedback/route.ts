import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

/**
 * Fonction pour envoyer un email personnalisé
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du feedback email:', error);
  }
}

/**
 * GET /api/feedback
 * Récupère les feedbacks soumis par l'utilisateur authentifié
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer les feedbacks de l'utilisateur
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des feedbacks:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feedback
 * Soumet un nouveau feedback/suggestion
 * Body: { title, description, category }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category } = body;

    // Validation des champs
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'La description est requise' },
        { status: 400 }
      );
    }

    if (!category || !['bug', 'feature', 'ux', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'La catégorie est invalide' },
        { status: 400 }
      );
    }

    // Créer le feedback dans la base de données
    const feedback = await prisma.feedback.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        description: description.trim(),
        category,
        status: 'open',
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    // Récupérer l'email de l'utilisateur pour la notification
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, name: true },
    });

    // Envoyer une notification email au propriétaire
    const feedbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://zerah.woutils.com'}/admin/feedback/${feedback.id}`;
    
    await sendEmail(
      process.env.FEEDBACK_EMAIL || 'jean.maillot14@gmail.com',
      `🎯 Nouveau Feedback: ${feedback.category.toUpperCase()} - ${feedback.title}`,
      `
        <h2>Nouveau feedback reçu</h2>
        <p><strong>De:</strong> ${user?.name || user?.email}</p>
        <p><strong>Catégorie:</strong> ${feedback.category}</p>
        <p><strong>Titre:</strong> ${feedback.title}</p>
        <p><strong>Description:</strong></p>
        <p>${feedback.description.replace(/\n/g, '<br>')}</p>
        <p><strong>Date:</strong> ${new Date(feedback.createdAt).toLocaleString('fr-FR')}</p>
        <a href="${feedbackUrl}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Voir le feedback</a>
      `
    );

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du feedback:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
