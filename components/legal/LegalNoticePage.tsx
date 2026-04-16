import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const LegalNoticePage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="Mentions legales"
      title="Mentions legales de Djambo"
      intro="Cette page presente les informations generales d identification du service Djambo, les principes applicables a son exploitation numerique et les points d attention relatifs a l hebergement, a la publication des contenus et au cadre general d utilisation du site et de l application."
      updatedAt="15 avril 2026"
      asideTitle="Informations essentielles"
      asideItems={[
        'Djambo est un service numerique de presentation de flotte, de relation commerciale et de gestion operationnelle.',
        'Les contenus publies par les utilisateurs restent sous leur responsabilite editoriale et commerciale.',
        'Le frontend est diffuse via Cloudflare et certains traitements applicatifs transitent par l API distante du service.',
        'Les demandes juridiques, signalements ou questions de conformite doivent etre adressees via les canaux de contact du service.',
      ]}
      sections={[
        {
          title: '1. Objet des mentions legales',
          body: [
            'Les presentes mentions legales ont pour fonction d identifier le cadre general d exploitation du service Djambo et de rappeler les grands principes applicables a la publication du site, des pages publiques, des vitrines proprietaires et des contenus mis en ligne par les utilisateurs.',
            'Elles completent les conditions d utilisation, la politique de confidentialite et la politique de cookies, sans s y substituer. Lorsqu un point releve d un document plus specifique, ce document plus specifique prevaut sur ce point particulier.',
          ],
        },
        {
          title: '2. Nature du service',
          body: [
            'Djambo est une plateforme numerique permettant notamment de presenter des vehicules, diffuser des vitrines publiques, centraliser des demandes de reservation ou d achat, organiser des informations clients et soutenir certains flux contractuels lies a l exploitation d une activite automobile.',
            'Le service peut evoluer dans sa structure, ses modules, ses integrations, ses pages publiques et ses mecanismes de performance afin d ameliorer l experience utilisateur, la stabilite technique et la qualite des parcours de consultation et de gestion.',
          ],
        },
        {
          title: '3. Hebergement, diffusion et infrastructure',
          body: [
            'Les assets frontend du service peuvent etre diffuses via Cloudflare afin d ameliorer la performance d acces, le cache et la disponibilite des contenus statiques. Certaines images, ressources medias ou donnees applicatives peuvent transiter par des services d hebergement, de stockage ou d API associes a l exploitation de la plateforme.',
            'La disponibilite du service depend en partie de ressources techniques externes, du reseau, du navigateur utilise et d eventuels fournisseurs tiers necessaires au bon fonctionnement de certains modules. Djambo recherche une disponibilite robuste, sans pouvoir garantir une continuite absolue en toutes circonstances.',
          ],
        },
        {
          title: '4. Responsabilite editoriale des contenus utilisateurs',
          body: [
            'Chaque utilisateur qui publie des photos, textes, prix, conditions, disponibilites, coordonnees ou informations commerciales sur Djambo en assume la responsabilite. Il lui appartient de verifier que ces contenus sont licites, exacts, a jour et compatibles avec les droits dont il dispose.',
            'Djambo peut moderer, retirer ou suspendre tout contenu qui apparaitrait illicite, trompeur, contrefaisant, diffamatoire, manifestement erroné ou de nature a compromettre la confiance dans le service, la securite des utilisateurs ou la conformite de la plateforme.',
          ],
        },
        {
          title: '5. Propriete intellectuelle',
          body: [
            'Les elements generiques de l interface, de la structure de navigation, de l identite visuelle, des composants graphiques, des textes institutionnels et des mecanismes applicatifs de Djambo sont proteges par les regles applicables en matiere de propriete intellectuelle, sous reserve des droits de tiers.',
            'Les contenus soumis par les utilisateurs demeurent sous leur responsabilite et dans leur sphere de droits, mais leur mise en ligne sur Djambo emporte l autorisation necessaire a leur hebergement, leur affichage, leur adaptation technique et leur diffusion dans les espaces pertinents au fonctionnement du service.',
          ],
        },
        {
          title: '6. Signalement et contact',
          body: [
            'Toute demande relative a un contenu litigieux, a un droit de tiers, a une difficulte de conformite, a une reclamation d ordre juridique ou a un usage frauduleux du service doit etre transmise via les canaux de contact mis a disposition par Djambo ou par l operateur du compte concerne.',
            'Pour etre exploitable, un signalement doit decrire clairement le contenu ou la situation concernee, indiquer la page ou le lien vise, exposer le motif du signalement et, lorsque cela est pertinent, fournir les elements justificatifs permettant d apprecier la demande.',
          ],
        },
      ]}
    />
  );
};