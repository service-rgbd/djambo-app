import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="Confidentialite"
      title="Politique de confidentialite et traitement des donnees"
      intro="Cette politique decrit les donnees traitees par Djambo, leur finalite operationnelle et les cas dans lesquels elles transitent vers les API ou services necessaires au fonctionnement de la plateforme."
      updatedAt="10 avril 2026"
      asideTitle="Donnees traitees"
      asideItems={[
        'Identite et contact: nom, prenom, email, telephone.',
        'Donnees de compte: role utilisateur, session locale, statut d authentification.',
        'Donnees operationnelles: vehicules, demandes de reservation, contrats, medias et profils proprietaires.',
        'Donnees de localisation: latitude, longitude et adresse uniquement apres action volontaire.',
      ]}
      sections={[
        {
          title: '1. Donnees collecteess lors de l inscription et de la connexion',
          body: [
            'Djambo traite les informations necessaires a la creation de compte et a la connexion, notamment le nom, l email, le mot de passe, le role, le numero de telephone et certains champs complementaires selon le type de profil. Ces elements servent a ouvrir un espace conforme au profil utilisateur et a securiser les acces.',
            'Une fois l utilisateur authentifie, un resume de session est conserve localement afin de construire les en-tetes applicatifs x-user-id et x-user-role lors des appels API. Cette mecanique permet au frontend de dialoguer avec le backend sans recharger la totalite des informations a chaque interaction.',
          ],
        },
        {
          title: '2. Donnees traitees pour les reservations, demandes et contrats',
          body: [
            'Lorsque vous effectuez une demande de location, d achat ou de reservation, Djambo peut traiter le nom, l email, le telephone, la preference de contact, les dates, le message, ainsi que des donnees d identite ou de permis si elles sont requises pour la validation de la demande.',
            'Pour les utilisateurs professionnels, la plateforme traite egalement les donnees de parc, vehicules, parkings, places disponibles, tarifs et contenus medias afin d alimenter le tableau de bord, la vitrine publique et les flux de gestion quotidienne.',
          ],
        },
        {
          title: '3. Localisation et services externes',
          body: [
            'La geolocalisation n est jamais lancee automatiquement au chargement de l application. Elle est declenchee uniquement lorsqu un utilisateur choisit de detecter sa position pour confirmer ou renseigner une adresse de parking.',
            'Lorsque cette action est demandee, le navigateur fournit les coordonnees et Djambo interroge le service Nominatim OpenStreetMap pour transformer ces coordonnees en adresse lisible. Cette etape sert exclusivement a la qualite de la donnee d adresse et non a un pistage permanent de l utilisateur.',
          ],
        },
        {
          title: '4. Medias, hebergement et diffusion',
          body: [
            'Les images de vehicules et medias de parametrage peuvent etre envoyes vers l API de Djambo pour etre stockes et rediffuses dans les vitrines publiques, fiches vehicules et espaces proprietaires. Les assets frontend construits par Vite sont distribues via Cloudflare, ce qui ameliore la rapidite d acces selon la zone geographique.',
            'Djambo ne declare pas dans cette version de mecanisme de profilage publicitaire, de revente de donnees ou de reciblage marketing tiers base sur le comportement de navigation.',
          ],
        },
      ]}
    />
  );
};