import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const TermsOfUsePage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="Conditions"
      title="Conditions d utilisation de Djambo"
      intro="Ces conditions encadrent l acces a la plateforme Djambo, l usage des espaces publics et prives, ainsi que les responsabilites liees a la publication de vehicules, aux reservations et aux echanges entre utilisateurs."
      updatedAt="10 avril 2026"
      asideTitle="Principes directeurs"
      asideItems={[
        'Le compte utilisateur doit contenir des informations exactes et mises a jour.',
        'Les vehicules, prix et disponibilites publies doivent etre sinceres et exploitables.',
        'Les demandes et contacts transmis via la plateforme doivent rester licites et professionnels.',
        'Djambo peut suspendre un acces en cas d usage abusif, frauduleux ou contraire au service.',
      ]}
      sections={[
        {
          title: '1. Acces a la plateforme',
          body: [
            'Djambo fournit une interface de presentation, de recherche, de gestion de flotte et de relation entre proprietaires, parcs autos et clients. L acces a certaines fonctions exige une authentification valide et un role compatible avec le niveau de service demande.',
            'L utilisateur est responsable de la confidentialite de ses identifiants et de toute action effectuee depuis son compte, sauf preuve d un incident exterieur qu il ne pouvait raisonnablement eviter.',
          ],
        },
        {
          title: '2. Publication de vehicules et contenus',
          body: [
            'Tout contenu publie sur Djambo, y compris les photos, descriptions, tarifs, disponibilites, conditions de location et coordonnees commerciales, doit etre exact, lawful et librement exploitable par l utilisateur qui le soumet.',
            'Djambo peut retirer un contenu manifestement trompeur, incomplet, contrefaisant, illegitime ou susceptible de nuire a la confiance dans la place de marche.',
          ],
        },
        {
          title: '3. Reservations, demandes et relation commerciale',
          body: [
            'La plateforme facilite la transmission de demandes de location ou d achat, mais certaines modalites finales peuvent encore dependre du proprietaire, de la verification des documents et de l accord sur les conditions financieres et logistiques.',
            'Chaque partie reste responsable de la conformite de ses engagements, de la disponibilite reelle du vehicule, de la validite des pieces justificatives et du respect des regles locales applicables a la circulation, a l assurance et a la location.',
          ],
        },
        {
          title: '4. Disponibilite, performance et limites',
          body: [
            'Djambo cherche a maintenir un service accessible, rapide et stable, notamment via le cache frontend et l optimisation des assets. Toutefois, une interruption temporaire, une erreur de reseau, un probleme de navigateur ou une indisponibilite de service tiers peut toujours survenir.',
            'La plateforme peut faire evoluer ses interfaces, ses pages publiques, son architecture technique et ses mecanismes de performance sans notification individuelle systematique, sous reserve de ne pas denaturer les droits essentiels deja accordes aux utilisateurs.',
          ],
        },
      ]}
    />
  );
};