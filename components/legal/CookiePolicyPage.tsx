import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const CookiePolicyPage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="Cookies"
      title="Politique de cookies et centre de consentement"
      intro="Cette page explique ce que Djambo stocke sur votre appareil, pourquoi ces donnees sont utiles au service et comment vos choix de consentement sont respectes sur mobile comme sur desktop."
      updatedAt="10 avril 2026"
      asideTitle="Ce que nous utilisons"
      asideItems={[
        'Stockage essentiel pour maintenir la session de connexion et proteger les acces.',
        'Preferences d interface pour la langue, certains filtres et le confort de navigation.',
        'Cache applicatif pour accelerer le chargement des assets statiques sur Cloudflare et via le service worker.',
        'Geolocalisation uniquement apres action explicite pour detecter une adresse de parking.',
      ]}
      sections={[
        {
          title: '1. Ce que Djambo depose reellement sur votre appareil',
          body: [
            'Djambo utilise principalement le stockage local du navigateur pour memoriser la session utilisateur sous la cle fleet_user, vos choix de consentement et certaines preferences d interface. Nous n utilisons pas de cookies publicitaires ou de tracking tiers agressif dans l etat actuel de l application.',
            'Le frontend s appuie aussi sur un service worker pour conserver en cache des ressources statiques comme le shell applicatif, les feuilles de style, les scripts et les images deja chargees. Cette couche est utile pour rendre l experience plus rapide sur Cloudflare, limiter les telechargements repetitifs et stabiliser les temps d affichage sur mobile.',
          ],
        },
        {
          title: '2. Categories de consentement',
          body: [
            'Les elements essentiels ne peuvent pas etre desactives car ils servent a la connexion, a la securite, au routage et a la coherence fonctionnelle de la plateforme.',
            'Les preferences couvrent des choix de confort, comme certains etats d interface ou selections memorisees localement. Les services de localisation sont traites a part, car ils ne s activent que lorsqu un utilisateur demande explicitement la detection de sa position pour enregistrer ou confirmer une adresse.',
          ],
        },
        {
          title: '3. Comment modifier votre choix',
          body: [
            'Lorsque le bandeau de consentement s affiche, vous pouvez accepter tout, ou refuser les elements optionnels. Le choix est enregistre localement sur votre appareil et peut etre remplace a la prochaine reinitialisation du stockage du navigateur.',
            'Si vous videz le cache, supprimez les donnees du site ou changez de navigateur, la plateforme vous redemandera votre preference. Cela permet de respecter un consentement reelement lie a l appareil et a l environnement de navigation utilise.',
          ],
        },
        {
          title: '4. Images, cache et performance',
          body: [
            'Les assets importes localement par Vite sont publies avec des noms haches, ce qui les rend naturellement compatibles avec un cache long sur Cloudflare. Le service worker complete cette logique en servant preferentiellement les ressources deja telechargees lorsque cela est pertinent.',
            'Les images distantes utilisees dans certaines vitrines sont egalement cachees cote navigateur et peuvent etre conservees par le service worker pour eviter des telechargements repetitifs. L objectif est de ne pas recharger toute la flotte a chaque navigation ou retour sur la page d accueil.',
          ],
        },
      ]}
    />
  );
};