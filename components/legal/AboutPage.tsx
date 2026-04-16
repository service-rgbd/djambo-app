import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const AboutPage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="A propos"
      title="A propos de Djambo"
      intro="Djambo est une plateforme de mise en relation, de presentation de flotte et de gestion operationnelle pensee pour les parcs autos, les proprietaires independants et les clients qui veulent reserver un vehicule avec plus de clarte, de rapidite et de fiabilite. Cette page explique en detail ce que fait le service, ce qu il ne fait pas, et la logique qui guide sa conception."
      updatedAt="15 avril 2026"
      asideTitle="Ce que Djambo apporte"
      asideItems={[
        'Une vitrine publique claire pour presenter les vehicules, les conditions et les profils proprietaires.',
        'Un espace prive pour piloter clients, contrats, disponibilites, liens publics et parametres de marque.',
        'Un parcours plus lisible entre intention de reservation, contact commercial et formalisation du dossier.',
        'Une architecture qui se concentre sur la lisibilite des offres, la rapidite d acces et la reduction des frictions de gestion.',
      ]}
      sections={[
        {
          title: '1. Positionnement de la plateforme',
          body: [
            'Djambo a ete concu pour resoudre un probleme concret: beaucoup d activites de location ou de vente de vehicules reposent encore sur des echanges disperses, des informations incomplètes, des catalogues peu lisibles et des liens publics qui manquent de coherence. La plateforme structure ces informations dans un espace unique afin de rendre le catalogue exploitable aussi bien en interne qu en externe.',
            'Le service n est pas limite a une simple vitrine marketing. Il cherche aussi a reduire le temps de traitement cote proprietaire ou parc auto, en centralisant les vehicules, les clients, les demandes, les contrats et certains liens publics utiles a la conversion commerciale.',
          ],
        },
        {
          title: '2. A qui s adresse Djambo',
          body: [
            'Djambo s adresse en priorite a trois profils. D abord, les parcs autos qui gerent plusieurs vehicules, plusieurs points de stationnement ou plusieurs flux de reservation. Ensuite, les proprietaires individuels qui souhaitent disposer d une presence numerique plus credible sans devoir assembler plusieurs outils. Enfin, les clients finaux qui veulent consulter une offre plus claire avant de prendre contact ou de demander une reservation.',
            'Cette orientation implique une interface qui doit rester simple pour un usage quotidien, tout en proposant assez de structure pour soutenir une activite commerciale reelle. Les contenus publics doivent aider a convaincre. Les contenus prives doivent aider a exploiter.',
          ],
        },
        {
          title: '3. Ce que la plateforme permet concretement',
          body: [
            'Cote public, Djambo permet de publier un catalogue de vehicules, une vitrine proprietaire, des fiches detaillees avec medias, prix, disponibilites et conditions, ainsi que des liens partageables vers un store ou un profil public. L objectif est que le visiteur comprenne rapidement ce qui est propose, a quel prix et dans quel cadre.',
            'Cote prive, la plateforme permet de gerer les clients, de suivre les vehicules, de preparer des contrats, de configurer des liens publics, d ajuster l image de marque et de conserver une vision d ensemble de l activite. L interface cherche a maintenir un lien direct entre ce qui est publie au public et ce qui est effectivement exploitable dans les operations quotidiennes.',
          ],
        },
        {
          title: '4. Ce que Djambo ne remplace pas',
          body: [
            'Djambo n annule pas les obligations juridiques, fiscales, assurantielles ou administratives qui s appliquent a la location, a la vente ou a la mise a disposition d un vehicule. La plateforme aide a organiser et transmettre l information, mais elle ne remplace ni la verification des documents, ni la validation contractuelle finale, ni les obligations locales de conformite.',
            'De la meme facon, la plateforme ne garantit pas qu un vehicule publie sera automatiquement reserve, finance ou livre. Elle facilite la presentation et la relation commerciale, mais la conclusion effective d une operation depend encore des parties, des disponibilites reelles, de la qualite des informations fournies et du respect des conditions annoncees.',
          ],
        },
        {
          title: '5. Philosophie produit et qualite attendue',
          body: [
            'La logique produit de Djambo repose sur un principe simple: moins d opacite, moins de friction, moins de perte de temps. Cela se traduit par des pages publiques plus directes, des liens plus stables, des modules prives plus lisibles et une organisation qui evite les doublons inutiles entre vitrine, relation client et dossier contractuel.',
            'La qualite attendue sur la plateforme suppose des donnees sinceres, des photos pertinentes, des prix coherents, des disponibilites maintenues a jour et des conditions suffisamment explicites pour que le client sache a quoi s attendre avant d entrer dans un echange plus avance.',
          ],
        },
        {
          title: '6. Donnees, confiance et responsabilite',
          body: [
            'Djambo traite des informations necessaires au fonctionnement des comptes, des vitrines, des demandes, des contrats et de certains parcours de support. Cette gestion n a de valeur que si la confiance est preservee. C est pourquoi les liens publics, les pages juridiques et les parametres de publication doivent rester alignes avec la realite du service rendu.',
            'Chaque utilisateur reste responsable des informations qu il publie et des engagements qu il prend a travers la plateforme. De son cote, Djambo cherche a fournir un cadre technique plus propre, plus stable et plus comprehensible, afin de reduire les erreurs de presentation, les malentendus commerciaux et les pertes de conversion liees a une mauvaise experience utilisateur.',
          ],
        },
      ]}
    />
  );
};