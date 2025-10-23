/**
 * Utilitaire pour générer des recommandations d'habitudes intelligentes
 * basées sur le profil utilisateur (taille, poids, niveau d'activité, âge)
 */

export type UserProfile = {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
};

export type HabitRecommendation = {
  name: string;
  icon: string;
  description: string;
  detail?: {
    name: string;
    type: string;
    unit: string;
    recommendedDaily: number;
  };
  reason: string;
};

/**
 * Calcule les besoins journaliers en eau en fonction du poids et de l'activité
 * Formule: 30-35 ml par kg + bonus selon activité
 */
function calculateWaterNeeds(weight?: number, activityLevel?: string): number {
  if (!weight) return 2500; // Par défaut 2.5L
  
  let baseMl = weight * 30; // 30ml par kg minimum
  
  // Bonus selon activité
  const activityBonus: Record<string, number> = {
    sedentaire: 0,
    modere: 500,
    actif: 1000,
    tres_actif: 1500,
  };
  
  const bonus = activityBonus[activityLevel || 'modere'] || 500;
  return Math.round(baseMl + bonus);
}

/**
 * Recommande du sommeil selon l'âge
 */
function calculateSleepNeeds(age?: number): number {
  if (!age) return 8; // Par défaut 8h
  
  if (age < 18) return 9;
  if (age > 65) return 7;
  return 8;
}

/**
 * Calcule les besoins caloriques pour l'exercice selon le poids et l'activité
 */
function calculateActivityDuration(weight?: number, activityLevel?: string): number {
  const currentActivity = activityLevel || 'modere';
  
  const recommendations: Record<string, number> = {
    sedentaire: 30, // Minimum 30 min pour commencer
    modere: 45,
    actif: 60,
    tres_actif: 60, // Au moins maintenir
  };
  
  return recommendations[currentActivity] || 45;
}

/**
 * Génère les recommandations d'habitudes pour un utilisateur
 */
export function generateHabitRecommendations(profile: UserProfile): HabitRecommendation[] {
  const recommendations: HabitRecommendation[] = [];
  
  // 1. Recommandation EAU
  const waterNeeds = calculateWaterNeeds(profile.weight, profile.activityLevel);
  const waterGlasses = Math.round(waterNeeds / 250); // 1 verre = 250ml
  
  recommendations.push({
    name: 'Boire de l\'eau',
    icon: '💧',
    description: `Restez hydraté selon vos besoins`,
    detail: {
      name: 'Verres d\'eau',
      type: 'number',
      unit: 'verres',
      recommendedDaily: waterGlasses,
    },
    reason: `Basé sur votre poids de ${profile.weight}kg + activité ${profile.activityLevel || 'modérée'}`,
  });
  
  // 2. Recommandation SOMMEIL
  const sleepNeeds = calculateSleepNeeds(profile.age);
  recommendations.push({
    name: 'Dormir suffisamment',
    icon: '😴',
    description: `Respectez votre besoin de sommeil`,
    detail: {
      name: 'Heures de sommeil',
      type: 'duration',
      unit: 'h',
      recommendedDaily: sleepNeeds,
    },
    reason: `À votre âge (${profile.age || 'non précisé'}), vous avez besoin de ${sleepNeeds}h de sommeil`,
  });
  
  // 3. Recommandation ACTIVITÉ PHYSIQUE (selon profil)
  if (profile.activityLevel === 'sedentaire' || !profile.activityLevel) {
    const duration = calculateActivityDuration(profile.weight, profile.activityLevel);
    recommendations.push({
      name: 'Marche quotidienne',
      icon: '🚶',
      description: 'Commencez par une marche régulière',
      detail: {
        name: 'Durée',
        type: 'duration',
        unit: 'min',
        recommendedDaily: duration,
      },
      reason: 'Augmentez progressivement votre activité physique',
    });
  } else if (profile.activityLevel === 'modere' || profile.activityLevel === 'actif') {
    recommendations.push({
      name: 'Exercice régulier',
      icon: '🏃',
      description: 'Activité cardio ou renforcement',
      detail: {
        name: 'Durée',
        type: 'duration',
        unit: 'min',
        recommendedDaily: 45,
      },
      reason: 'Maintenez votre rythme de 3-4x par semaine',
    });
  } else if (profile.activityLevel === 'tres_actif') {
    recommendations.push({
      name: 'Entraînement intensif',
      icon: '💪',
      description: 'Continuez vos entraînements réguliers',
      detail: {
        name: 'Durée',
        type: 'duration',
        unit: 'min',
        recommendedDaily: 60,
      },
      reason: 'Maintenez votre niveau de performance',
    });
  }
  
  // 4. Recommandation MÉDITATION/BIEN-ÊTRE
  recommendations.push({
    name: 'Méditation ou relaxation',
    icon: '🧘',
    description: 'Prenez soin de votre santé mentale',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 10,
    },
    reason: 'Aide à réduire le stress quel que soit votre profil',
  });
  
  // 5. Recommandation LECTURE/APPRENDRE
  recommendations.push({
    name: 'Apprentissage quotidien',
    icon: '📚',
    description: 'Développez vos connaissances',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 20,
    },
    reason: 'Bénéfique pour tous les âges et niveaux d\'activité',
  });

  // 6. Recommandation ALIMENTATION ÉQUILIBRÉE
  recommendations.push({
    name: 'Alimentation équilibrée',
    icon: '🥗',
    description: 'Mangez sainement et varié',
    detail: {
      name: 'Portions de fruits/légumes',
      type: 'number',
      unit: 'portions',
      recommendedDaily: 5,
    },
    reason: '5 portions de fruits et légumes recommandées par jour',
  });

  // 7. Recommandation YOGA/ÉTIREMENT
  recommendations.push({
    name: 'Yoga ou étirements',
    icon: '🤸',
    description: 'Améliorez votre flexibilité',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 15,
    },
    reason: 'Améliore la flexibilité et réduit les tensions',
  });

  // 8. Recommandation VITAMINES/SUPPLÉMENTS (selon profil)
  if (!profile.activityLevel || profile.activityLevel === 'sedentaire') {
    recommendations.push({
      name: 'Suppléments vitamines D',
      icon: '💊',
      description: 'Complément de vitamine D',
      detail: {
        name: 'Doses',
        type: 'number',
        unit: 'comprimés',
        recommendedDaily: 1,
      },
      reason: 'Importante surtout en cas de faible exposition au soleil',
    });
  }

  // 9. Recommandation SORTIE/AIR FRAIS
  recommendations.push({
    name: 'Sortie en plein air',
    icon: '🌳',
    description: 'Passez du temps dehors',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 30,
    },
    reason: 'Exposition au soleil et connexion avec la nature',
  });

  // 10. Recommandation MUSCULATION (selon profil)
  if (profile.activityLevel === 'actif' || profile.activityLevel === 'tres_actif') {
    recommendations.push({
      name: 'Renforcement musculaire',
      icon: '🏋️',
      description: 'Travaillez vos muscles',
      detail: {
        name: 'Séances par semaine',
        type: 'number',
        unit: 'séances',
        recommendedDaily: 3,
      },
      reason: 'Recommandé 2-3x par semaine pour vos activités',
    });
  }

  // 11. Recommandation RESPIRATION/PRANAYAMA
  recommendations.push({
    name: 'Exercices de respiration',
    icon: '🌬️',
    description: 'Techniques de respiration pour calmer l\'esprit',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 5,
    },
    reason: 'Améliore la circulation et réduit l\'anxiété',
  });

  // 12. Recommandation CUISINE SAINE
  recommendations.push({
    name: 'Préparer repas sains',
    icon: '👨‍🍳',
    description: 'Cuisinez des repas équilibrés à la maison',
    detail: {
      name: 'Repas cuisinés',
      type: 'number',
      unit: 'repas',
      recommendedDaily: 2,
    },
    reason: 'Meilleur contrôle nutritionnel que les repas extérieurs',
  });

  // 13. Recommandation FLEXIBILITÉ
  recommendations.push({
    name: 'Travail de flexibilité',
    icon: '🤲',
    description: 'Améliorez votre souplesse et mobilité',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 10,
    },
    reason: 'Prévient les blessures et améliore la posture',
  });

  // 14. Recommandation SOMMEIL RÉGULIER
  recommendations.push({
    name: 'Heure de coucher régulière',
    icon: '🌙',
    description: 'Maintenir un horaire de sommeil cohérent',
    detail: {
      name: 'Heure de coucher',
      type: 'duration',
      unit: 'h',
      recommendedDaily: 22,
    },
    reason: 'Régule votre horloge biologique et améliore la santé',
  });

  // 15. Recommandation HYDRATATION OPTIMALE
  recommendations.push({
    name: 'Hydratation tout au long de la journée',
    icon: '💧',
    description: 'Boire régulièrement pour rester hydraté',
    detail: {
      name: 'Portions d\'eau',
      type: 'number',
      unit: 'portions',
      recommendedDaily: 8,
    },
    reason: 'Maintenez un bon équilibre hydrique toute la journée',
  });

  // 16. Recommandation PROTEINES
  recommendations.push({
    name: 'Apport protéiné adéquat',
    icon: '🥚',
    description: 'Consommez suffisamment de protéines',
    detail: {
      name: 'Portions de protéines',
      type: 'number',
      unit: 'portions',
      recommendedDaily: 3,
    },
    reason: 'Essentielles pour la récupération musculaire et la satiété',
  });

  // 17. Recommandation POSTURE
  recommendations.push({
    name: 'Correction de posture',
    icon: '🧎',
    description: 'Surveillez et améliorez votre posture',
    detail: {
      name: 'Vérifications par jour',
      type: 'number',
      unit: 'fois',
      recommendedDaily: 3,
    },
    reason: 'Prévient les douleurs dorsales et améliore la confiance',
  });

  // 18. Recommandation SANTÉ CARDIOVASCULAIRE
  recommendations.push({
    name: 'Exercice cardiovasculaire',
    icon: '❤️',
    description: 'Renforcer votre cœur et vos poumons',
    detail: {
      name: 'Durée totale par semaine',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 150,
    },
    reason: 'L\'OMS recommande 150 min d\'activité modérée par semaine',
  });

  // 19. Recommandation ALIMENTATION ANTIOXYDANTE
  recommendations.push({
    name: 'Aliments antioxydants',
    icon: '🍓',
    description: 'Consommez des baies, noix et superaliments',
    detail: {
      name: 'Portions quotidiennes',
      type: 'number',
      unit: 'portions',
      recommendedDaily: 2,
    },
    reason: 'Combattent le vieillissement cellulaire et l\'inflammation',
  });

  // 20. Recommandation GRATITUDE/MINDFULNESS
  recommendations.push({
    name: 'Pratique de gratitude',
    icon: '🙏',
    description: 'Notez 3 choses pour lesquelles vous êtes reconnaissant',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 5,
    },
    reason: 'Augmente le bien-être mental et la positivité',
  });

  // 21. Recommandation MASSAGE/AUTO-MASSAGE
  recommendations.push({
    name: 'Auto-massage et récupération',
    icon: '💆',
    description: 'Soulagez les tensions musculaires',
    detail: {
      name: 'Durée',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 10,
    },
    reason: 'Améliore la circulation et accélère la récupération',
  });

  // 22. Recommandation SANTÉ DENTAIRE
  recommendations.push({
    name: 'Hygiène dentaire complète',
    icon: '🦷',
    description: 'Brossage et nettoyage dentaire régulier',
    detail: {
      name: 'Sessions de brossage',
      type: 'number',
      unit: 'fois',
      recommendedDaily: 2,
    },
    reason: 'Prévient les caries et les maladies des gencives',
  });

  // 23. Recommandation SANTÉ CUTANÉE
  recommendations.push({
    name: 'Soin de la peau',
    icon: '🧖',
    description: 'Routine de soins cutanés quotidienne',
    detail: {
      name: 'Sessions de soins',
      type: 'number',
      unit: 'fois',
      recommendedDaily: 2,
    },
    reason: 'Maintient une peau saine et prévient les problèmes',
  });

  // 24. Recommandation SOMMEIL EN QUALITÉ
  recommendations.push({
    name: 'Amélioration qualité du sommeil',
    icon: '😴',
    description: 'Créez une routine d\'endormissement',
    detail: {
      name: 'Temps avant lit',
      type: 'duration',
      unit: 'min',
      recommendedDaily: 30,
    },
    reason: 'Permet à votre corps de se préparer au sommeil',
  });

  // 25. Recommandation CONNEXION SOCIALE
  recommendations.push({
    name: 'Temps social et connexion',
    icon: '👥',
    description: 'Interagissez avec famille et amis',
    detail: {
      name: 'Interactions qualitatives',
      type: 'number',
      unit: 'contacts',
      recommendedDaily: 1,
    },
    reason: 'Essentiels pour la santé mentale et le bien-être',
  });
  
  return recommendations;
}
