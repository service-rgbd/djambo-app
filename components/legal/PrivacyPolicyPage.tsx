import React from 'react';
import { LegalPageShell } from './LegalPageShell';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPageShell
      eyebrow="Confidentialite"
      title="Politique de confidentialite et traitement des donnees"
      intro="Cette politique decrit de maniere detaillee les donnees personnelles et operationnelles traitees par Djambo, les finalites de ces traitements, les flux techniques qui les concernent, les durées de conservation raisonnablement applicables selon le contexte et les droits que les utilisateurs peuvent exercer concernant leurs informations."
      updatedAt="15 avril 2026"
      asideTitle="Donnees traitees"
      asideItems={[
        'Identite et contact: nom, prenom, email, telephone.',
        'Donnees de compte: role utilisateur, session locale, statut d authentification.',
        'Donnees operationnelles: vehicules, demandes de reservation, contrats, medias et profils proprietaires.',
        'Donnees de localisation: latitude, longitude et adresse uniquement apres action volontaire.',
        'Donnees techniques: journaux applicatifs, erreurs, metadata de requetes et informations necessaires a la securite du service.',
      ]}
      sections={[
        {
          title: '1. Donnees collectees lors de l inscription et de la connexion',
          body: [
            'Djambo traite les informations necessaires a la creation de compte et a la connexion, notamment le nom, l email, le mot de passe, le role, le numero de telephone et certains champs complementaires selon le type de profil. Ces elements servent a ouvrir un espace conforme au profil utilisateur et a securiser les acces.',
            'Une fois l utilisateur authentifie, un resume de session est conserve localement afin de construire les en-tetes applicatifs x-user-id et x-user-role lors des appels API. Cette mecanique permet au frontend de dialoguer avec le backend sans recharger la totalite des informations a chaque interaction.',
            'Le traitement de ces informations poursuit principalement des finalites de creation de compte, de gestion de session, de securisation des acces, de personnalisation de l espace utilisateur et de journalisation minimale necessaire au support et au diagnostic des incidents.',
          ],
        },
        {
          title: '2. Donnees traitees pour les reservations, demandes et contrats',
          body: [
            'Lorsque vous effectuez une demande de location, d achat ou de reservation, Djambo peut traiter le nom, l email, le telephone, la preference de contact, les dates, le message, ainsi que des donnees d identite ou de permis si elles sont requises pour la validation de la demande.',
            'Pour les utilisateurs professionnels, la plateforme traite egalement les donnees de parc, vehicules, parkings, places disponibles, tarifs et contenus medias afin d alimenter le tableau de bord, la vitrine publique et les flux de gestion quotidienne.',
            'Dans le cadre de la preparation ou du suivi d un contrat, certaines informations peuvent aussi etre organisees dans un dossier de travail afin de produire un recapitulatif exploitable, un document PDF ou un support de verification interne. Ces traitements ont pour finalite la structuration d une relation commerciale et non la collecte excessive d informations sans utilite operationnelle.',
          ],
        },
        {
          title: '3. Localisation et services externes',
          body: [
            'La geolocalisation n est jamais lancee automatiquement au chargement de l application. Elle est declenchee uniquement lorsqu un utilisateur choisit de detecter sa position pour confirmer ou renseigner une adresse de parking.',
            'Lorsque cette action est demandee, le navigateur fournit les coordonnees et Djambo interroge le service Nominatim OpenStreetMap pour transformer ces coordonnees en adresse lisible. Cette etape sert exclusivement a la qualite de la donnee d adresse et non a un pistage permanent de l utilisateur.',
            'De facon generale, Djambo peut s appuyer sur des services techniques tiers strictement necessaires a certaines fonctions, par exemple pour la diffusion d assets, le stockage de medias, certaines resolutions d adresse ou certains services applicatifs relies au fonctionnement du produit. Lorsqu un tel service intervient, son usage reste encadre par sa fonction technique dans l architecture du service.',
          ],
        },
        {
          title: '4. Medias, hebergement et diffusion',
          body: [
            'Les images de vehicules et medias de parametrage peuvent etre envoyes vers l API de Djambo pour etre stockes et rediffuses dans les vitrines publiques, fiches vehicules et espaces proprietaires. Les assets frontend construits par Vite sont distribues via Cloudflare, ce qui ameliore la rapidite d acces selon la zone geographique.',
            'Djambo ne declare pas dans cette version de mecanisme de profilage publicitaire, de revente de donnees ou de reciblage marketing tiers base sur le comportement de navigation.',
          ],
        },
        {
          title: '5. Base d utilisation des donnees et principe de minimisation',
          body: [
            'Djambo cherche a ne traiter que les informations utiles au fonctionnement du service, a la gestion des comptes, a la presentation des offres, au suivi des demandes et a la securisation des acces. Le principe applique est celui d une collecte utile, proportionnee et liee a une finalite identifiable.',
            'Le service n a pas, dans son etat actuel, pour vocation d exploiter les donnees a des fins de publicite comportementale invasive, de profilage commercial massif ou de revente a des tiers sans lien avec la fourniture du service.',
          ],
        },
        {
          title: '6. Conservation des informations',
          body: [
            'Les donnees sont conservees pendant la duree necessaire aux finalites qui justifient leur traitement, sous reserve des obligations legales, contractuelles ou de preuve qui peuvent exiger une retention plus longue dans certains cas. La duree exacte peut varier selon la nature du compte, du dossier, du contrat, du media ou de l historique technique concerne.',
            'Lorsqu une information n est plus necessaire a l exploitation normale du service, au suivi raisonnable de la relation ou a la conformite applicable, elle a vocation a etre supprimee, anonymisee ou archivee dans une forme appropriee au contexte.',
          ],
        },
        {
          title: '7. Securite et controle des acces',
          body: [
            'Djambo met en oeuvre des mesures de securite techniques et organisationnelles raisonnables pour proteger les comptes, limiter les acces non autorises et reduire les risques d alteration, de perte, d exposition ou d usage abusif des informations traitees.',
            'Aucune architecture numerique ne peut garantir un risque nul. Les utilisateurs doivent eux aussi contribuer a la securite du service en protegeant leurs identifiants, en utilisant des equipements fiables et en signalant rapidement toute suspicion d acces non autorise ou de comportement anormal.',
          ],
        },
        {
          title: '8. Droits des utilisateurs',
          body: [
            'Selon le droit applicable et la situation concernee, les utilisateurs peuvent demander l acces a leurs donnees, leur rectification, leur suppression, la limitation de certains traitements ou des explications complementaires sur la maniere dont leurs informations sont utilisees.',
            'Lorsqu une demande est formulee, Djambo peut exiger les elements necessaires pour verifier l identite du demandeur et s assurer que la demande porte bien sur les informations qui le concernent. Certaines limitations peuvent s appliquer lorsqu une conservation reste necessaire a une obligation legale, a la securite du service ou a la preuve d un engagement deja pris.',
          ],
        },
        {
          title: '9. Contact et reclamations',
          body: [
            'Toute question relative a la confidentialite, au traitement des donnees, a la correction d une information ou a l exercice d un droit peut etre adressee via les canaux de contact de Djambo ou du service operateur concerne.',
            'Pour accelerer le traitement, il est utile de decrire clairement la demande, d identifier le compte ou le lien concerne et de joindre les precisions necessaires a la comprehension du sujet. Une demande trop vague ou non verifiable peut necessiter des echanges complementaires avant traitement.',
          ],
        },
      ]}
    />
  );
};