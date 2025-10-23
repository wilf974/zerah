/**
 * Script de nettoyage des comptes programmés pour suppression
 * Supprime définitivement les comptes après 30 jours
 * 
 * À exécuter via cron job ou scheduleur :
 * 0 0 * * * cd /opt/apps/zerah && node scripts/cleanup-deleted-accounts.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDeletedAccounts() {
  try {
    console.log('🗑️ Démarrage du nettoyage des comptes programmés pour suppression...');

    const now = new Date();
    
    // Trouver tous les comptes programmés pour suppression et dont le délai est passé
    const accountsToDelete = await prisma.user.findMany({
      where: {
        deletionScheduledFor: {
          lte: now, // Programmé pour avant maintenant
        },
        isDeleted: false, // Pas encore supprimé
        deletionRequestedAt: {
          not: null, // Une demande de suppression existe
        },
      },
      select: {
        id: true,
        email: true,
        deletionScheduledFor: true,
      },
    });

    if (accountsToDelete.length === 0) {
      console.log('✅ Aucun compte à supprimer pour le moment');
      return;
    }

    console.log(`📊 ${accountsToDelete.length} compte(s) à supprimer définitivement...`);

    // Supprimer chaque compte et ses données associées
    for (const user of accountsToDelete) {
      try {
        console.log(`  🗑️ Suppression du compte : ${user.email}...`);

        // Supprimer toutes les données de l'utilisateur (en cascade via Prisma)
        await prisma.user.delete({
          where: { id: user.id },
        });

        console.log(`  ✅ Compte supprimé : ${user.email}`);
      } catch (error) {
        console.error(`  ❌ Erreur lors de la suppression de ${user.email} :`, error.message);
      }
    }

    console.log(`\n✅ Nettoyage terminé ! ${accountsToDelete.length} compte(s) supprimé(s) définitivement`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le nettoyage
cleanupDeletedAccounts();
