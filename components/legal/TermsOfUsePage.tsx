import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const TermsOfUsePage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="Conditions"
      title="Conditions d utilisation de Djambo"
      intro="Ces conditions definissent le cadre contractuel de l utilisation de Djambo. Elles expliquent en detail les regles qui s appliquent a l acces au service, a la publication d annonces et de vitrines, a la gestion des demandes, a la preparation des contrats, a l usage des liens publics et a la responsabilite de chaque partie dans les echanges facilites par la plateforme."
      updatedAt="15 avril 2026"
      asideTitle="Principes directeurs"
      asideItems={[
        'Le compte utilisateur doit contenir des informations exactes et mises a jour.',
        'Les vehicules, prix et disponibilites publies doivent etre sinceres et exploitables.',
        'Les demandes et contacts transmis via la plateforme doivent rester licites et professionnels.',
        'Djambo peut suspendre un acces en cas d usage abusif, frauduleux ou contraire au service.',
        'La plateforme structure la relation commerciale mais ne se substitue pas aux obligations legales des parties.',
      ]}
      sections={[
        {
          title: '1. Acces a la plateforme',
          body: [
            'Djambo fournit une interface de presentation, de recherche, de gestion de flotte et de relation entre proprietaires, parcs autos et clients. L acces a certaines fonctions exige une authentification valide et un role compatible avec le niveau de service demande.',
            'L utilisateur est responsable de la confidentialite de ses identifiants et de toute action effectuee depuis son compte, sauf preuve d un incident exterieur qu il ne pouvait raisonnablement eviter.',
            'L ouverture d un compte n emporte pas automatiquement acceptation de tous les usages imaginables de la plateforme. Certaines fonctionnalites peuvent etre reservees a des profils precis, evoluer dans le temps ou etre limitees pour des raisons techniques, commerciales, juridiques ou de securite.',
          ],
        },
        {
          title: '2. Eligibilite, veracite des informations et bonne foi',
          body: [
            'Toute personne qui utilise Djambo declare disposer de la capacite necessaire pour s engager, publier des informations commerciales exactes et exploiter licitement les contenus mis en ligne. Cela inclut notamment le droit d utiliser les photos, textes, logos, descriptifs, documents et coordonnees affiches sur la plateforme.',
            'L utilisateur s engage a ne pas creer de confusion sur son identite, son role, son droit a proposer un vehicule, son pouvoir de signature ou la realite de ses disponibilites. Toute utilisation de faux profils, de faux vehicules, de faux prix, de faux avis ou d informations trompeuses est interdite.',
          ],
        },
        {
          title: '3. Publication de vehicules, vitrines et contenus',
          body: [
            'Tout contenu publie sur Djambo, y compris les photos, descriptions, tarifs, disponibilites, conditions de location, montants de caution, options chauffeur, informations de contact et coordonnees commerciales, doit etre exact, lawful et librement exploitable par l utilisateur qui le soumet.',
            'L utilisateur doit maintenir une coherence raisonnable entre ce qu il affiche publiquement et ce qu il est effectivement capable de fournir. Une vitrine publique ne doit pas servir a attirer des demandes sur des vehicules inexistants, durablement indisponibles ou annonces a des conditions irrealisables.',
            'Djambo peut retirer, masquer, dereferencer ou suspendre un contenu manifestement trompeur, incomplet, contrefaisant, illegitime, diffamatoire, illicite ou susceptible de nuire a la confiance dans la plateforme et a la securite des utilisateurs.',
          ],
        },
        {
          title: '4. Reservations, demandes et relation commerciale',
          body: [
            'La plateforme facilite la transmission de demandes de location ou d achat, mais certaines modalites finales peuvent encore dependre du proprietaire, de la verification des documents et de l accord sur les conditions financieres et logistiques.',
            'Chaque partie reste responsable de la conformite de ses engagements, de la disponibilite reelle du vehicule, de la validite des pieces justificatives et du respect des regles locales applicables a la circulation, a l assurance et a la location.',
            'Une demande transmise via Djambo ne vaut pas, a elle seule, contrat ferme et definitif, sauf si les parties conviennent expressement du contraire dans un cadre compatible avec leurs obligations legales. Tant que les conditions essentielles ne sont pas arretees, chaque partie doit communiquer avec diligence et bonne foi.',
          ],
        },
        {
          title: '5. Contrats, pieces justificatives et execution',
          body: [
            'Lorsque Djambo permet de preparer un dossier contractuel, de generer un PDF ou d organiser les informations utiles a la formalisation d une location, cette assistance ne constitue pas une consultation juridique individualisee. Les utilisateurs doivent verifier l adequation de leurs clauses, de leurs montants et de leurs obligations aux regles qui leur sont applicables.',
            'Le proprietaire, le parc auto ou toute entite qui exploite la plateforme demeure responsable de la collecte des pieces necessaires, de la verification du permis, de l identite, des garanties, du paiement, des cautions, des assurances et des conditions de remise ou de restitution du vehicule.',
          ],
        },
        {
          title: '6. Tarifs, disponibilites et transparence commerciale',
          body: [
            'Les prix affiches sur la plateforme doivent correspondre a une offre reelle, intelligible et defendable. Lorsqu un tarif depend d options, d une duree minimale, d un chauffeur, d une caution, d une franchise, d une periode specifique ou de conditions additionnelles, ces elements doivent etre presentes de maniere suffisamment claire.',
            'L utilisateur s engage a ne pas utiliser Djambo pour capter des leads au moyen de tarifs artificiellement bas, de remises fictives, de disponibilites inexactes ou de conditions volontairement omises. Une offre commerciale doit rester lisible avant tout echange avance.',
          ],
        },
        {
          title: '7. Usage acceptable et interdictions',
          body: [
            'Il est interdit d utiliser Djambo pour diffuser des contenus illicites, trompeurs, violents, injurieux, discriminatoires, frauduleux ou portant atteinte aux droits de tiers. Il est egalement interdit de perturber le service, contourner les controles techniques, aspirer massivement les donnees, tester la plateforme a des fins malveillantes ou tenter d acceder a des espaces non autorises.',
            'Les utilisateurs ne peuvent pas employer la plateforme pour organiser des activites illicites, des mises a disposition incompatibles avec la reglementation locale, des transactions de couverture ou des montages destines a masquer l origine, l etat ou la disponibilite reelle d un vehicule.',
          ],
        },
        {
          title: '8. Liens publics, store propriétaire et partage externe',
          body: [
            'Djambo peut generer ou afficher des liens publics vers une vitrine, un profil ou un catalogue proprietaire. Ces liens ont pour objet de simplifier le partage commercial, la consultation du stock et l acces a l information essentielle par un tiers.',
            'L utilisateur doit verifier que les informations publiees via ces liens restent exactes, a jour et compatibles avec son activite reelle. Djambo peut faire evoluer la structure technique de ces URLs, sous reserve de maintenir autant que possible leur stabilite et leur intelligibilite.',
          ],
        },
        {
          title: '9. Disponibilite, performance et dependances techniques',
          body: [
            'Djambo cherche a maintenir un service accessible, rapide et stable, notamment via le cache frontend et l optimisation des assets. Toutefois, une interruption temporaire, une erreur de reseau, un probleme de navigateur ou une indisponibilite de service tiers peut toujours survenir.',
            'La plateforme peut faire evoluer ses interfaces, ses pages publiques, son architecture technique et ses mecanismes de performance sans notification individuelle systematique, sous reserve de ne pas denaturer les droits essentiels deja accordes aux utilisateurs.',
            'L utilisateur reconnait que certaines fonctions dependent de services externes, de navigateurs, de solutions d hebergement, de connectivite reseau ou de ressources tierces. Djambo ne peut pas garantir une continuite absolue en toutes circonstances, mais cherche a corriger les defauts significatifs dans un delai raisonnable selon leur gravite.',
          ],
        },
        {
          title: '10. Propriete intellectuelle et signes distinctifs',
          body: [
            'La structure de la plateforme, ses interfaces, son nom, sa presentation, ses composants visuels, ses textes generiques et ses elements distinctifs relevent de la protection applicable a la propriete intellectuelle, sous reserve des droits detenus par des tiers sur certains contenus soumis par les utilisateurs.',
            'La publication d un contenu par un utilisateur n entraine pas un transfert general de ses droits, mais elle implique l autorisation necessaire a son affichage, a son hebergement, a sa mise en forme et a sa diffusion dans les espaces Djambo pertinents pour l execution du service.',
          ],
        },
        {
          title: '11. Suspension, restriction et fermeture de compte',
          body: [
            'Djambo peut suspendre temporairement, restreindre ou fermer un compte en cas de violation des presentes conditions, de fraude presumee, d usage dangereux pour les tiers, de contenu illicite, de tentative d intrusion, d usurpation ou de comportement portant atteinte a la fiabilite du service.',
            'Lorsqu une mesure de restriction est appliquee, Djambo peut prendre en compte la gravite du manquement, son caractere repete, le risque pour les autres utilisateurs et les obligations legales eventuelles. Une suspension de compte ne supprime pas automatiquement les responsabilites deja nees entre les parties.',
          ],
        },
        {
          title: '12. Responsabilite et limitation raisonnable',
          body: [
            'Djambo agit comme plateforme technique de presentation, de structuration et de transmission d informations et de demandes. Sauf engagement expressement formule, elle n est pas partie aux contrats conclus entre utilisateurs et ne garantit ni la solvabilite d un client, ni la qualite effective d un vehicule, ni l execution parfaite de la prestation annoncee.',
            'Dans les limites permises par le droit applicable, Djambo ne pourra etre tenue responsable des pertes indirectes, des manques a gagner, des atteintes a l image ou des consequences d informations erronees fournies par un utilisateur. Cette limitation ne joue pas en cas de faute lourde, fraude ou disposition d ordre public contraire.',
          ],
        },
        {
          title: '13. Evolution des conditions',
          body: [
            'Les presentes conditions peuvent etre mises a jour pour refleter l evolution du service, de ses modules, de son architecture, de ses obligations legales ou de ses flux commerciaux. La date de mise a jour affichee sur cette page permet d identifier la version applicable.',
            'En continuant a utiliser Djambo apres une mise a jour substantielle, l utilisateur reconnait prendre connaissance des nouvelles conditions, sous reserve des droits qui ne peuvent pas etre modifies unilateralement lorsque la loi impose un cadre different.',
          ],
        },
      ]}
    />
  );
};