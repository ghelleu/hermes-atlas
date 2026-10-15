# Vérifications — Hermes Atlas (version 2)

Relevé du 15 octobre 2026. Deux contextes de test :
- **Chrome sans interface**, page ouverte en `file://` comme un double-clic, avec un proxy invalide (réseau coupé) ;
- **navigateur intégré de Claude**, servi en local, pour les interactions.

## Chargement et autonomie

- Page ouverte en `file://`, réseau coupé : les 44 composants, les 52 flux et les 9 couches s'affichent. La console ne montre aucune erreur.
- Aucune bibliothèque, aucun CDN, aucune police téléchargée.
- `data.js` relu par Node : JSON valide. Dix composants portent une mesure.
- Fenêtre étroite (800 px de large) : la scène se réduit sans rien couper ni reflux du texte. C'est ce qui corrige le titre coupé de la version 1.

## Espacement (retour du 15 octobre)

- Zone de carte élargie : de 372–1812 à 64–1832 px.
- Couches espacées de 196 px, composants de 144 px : 52 px d'air entre deux colonnes, contre 18 px avant.
- Panneau des couches replié par défaut. Bouton dans la barre d'outils : masqué au chargement, visible après un clic (vérifié).
- Composants très connectés grandis à raison de 13 px par flux : la boucle principale reçoit 7 flux de contexte sur toute sa hauteur.
- Étiquettes placées sans recouvrir un composant ni une autre étiquette. À l'étape 3, il en reste deux visibles (`config/soul.md`, `messages_fts`). Les autres se retirent faute de place et réapparaissent au survol direct du flux (vérifié sur « voix · règles »).

## Design et données

- Palette des flux vérifiée avec le validateur de la compétence de data visualisation (7 teintes, fond blanc), écarts les plus faibles :
  - séparation pour les daltonismes : ΔE 9,1 ;
  - vision normale : ΔE 19,6.
- Trois teintes (vert d'eau, jaune, rose) ont un contraste inférieur à 3:1 sur le fond blanc. C'est compensé par les étiquettes et par un motif de trait propre à chaque sens.
- Rouge réservé aux pannes et aux pauses, toujours doublé d'une croix, d'une pastille rouge et d'un texte (« 1 jeton révoqué », « en pause »).
- Mesures recoupées avec le document :
  - instantanés : 476 sur 500 Mo (§ 2.2) ;
  - volume Railway : 30 sur 46 Go (§ 1) ;
  - jetons sur 30 jours : 1 004,5, 30,6 et 29,7 M (§ 5.3) ;
  - outils MCP : 27, 44 et 40 (§ 7.1) ;
  - skills : 148 et 11 (§ 8) ;
  - tâches : 6 actives, 1 en pause (§ 11) ;
  - jetons Google : 2 rafraîchis, 1 révoqué (§ 9.1) ;
  - mémoire injectée : 99 % (§ 8) ;
  - state.db : 4,6 Go et caches de digestion 5,9 Go sur 30 Go occupés (§ 1).
- Citation du monolithe vérifiée mot à mot dans la section 1 : « parler, se souvenir, exécuter, et se réveiller tout seul ».

## Éclaté

- 0 % : un seul bloc, « Hermes Agent v0.21.5 », avec la citation et les neuf traits des couches repliées.
- 55 % : une miniature de l'architecture, sans chevauchement.
- 100 % : les neuf couches déployées.
- À l'ouverture, l'animation passe de 0 à 100 % en 1,7 s. Désactivée si le système demande moins de mouvement (lu dans le code, non testé avec le réglage système).
- Les noms de couches n'apparaissent qu'en fin d'éclatement : à mi-course, ils se chevauchaient (corrigé).

## Survol et chemins

- Survol de Figma : 15 flux et 14 composants s'allument, des entrées jusqu'à Figma.
  - Bug trouvé pendant ce test, puis corrigé : les flux internes à une couche (catalogue MCP → Figma, passerelle → transcription) ne prolongeaient pas le chemin.
- Après correction, d'autres survols :
  - Firecrawl : 15 flux, 14 composants ;
  - transcription : 4 flux, 5 composants ;
  - compression : 11 flux, 11 composants ;
  - Tailscale : 2 flux, 3 composants.
- Un flux hors service ne prolonge pas un chemin : WhatsApp n'apparaît pas dans les chemins venant de la passerelle.
- En quittant le survol, la carte redevient neutre.

## Fiches

- Recherche « jeton » : le composant « Jetons Google » est trouvé. Entrée ouvre sa fiche, avec la mesure « rafraîchis 2 jetons, révoqué 1 jetons ».
- Quand une fiche est ouverte, le panneau de gauche s'efface et la carte glisse pour que le chemin reste visible. À la fermeture (Échap), la carte revient à sa vue d'avant.
- Fiche de la boucle principale : rôle, machine, entrée, sortie, coût, conséquence d'une panne, mesure des jetons par modèle, preuve, connexions cliquables.
- Fiche de Blender : encadré « À discuter » sur la section 9.4.

## Parcours

- La barre d'espace lance le parcours : « 01 », « Lecture · 10 s par étape ».
- Quatorze appuis sur la flèche droite : arrêt à l'étape 12 (8 composants, 5 flux, les trois pannes).
- Échap ferme la carte du parcours et retire la mise en évidence.
- À l'étape 8, la carte glisse pour que le chemin Boucle → Catalogue → Blender ← Tailscale reste visible à gauche de la carte d'étape.

## Filtres

- Couche Déploiement masquée : 36 composants, 42 flux.
- Flux « Hors service » masqués : 39 flux visibles.
- « Tout afficher » : retour à 44 composants et 52 flux.

## Export et captures

- Export PNG : image de 3840 × 2160, avec titre, source et carte. En parcours, la légende de l'étape est ajoutée en bas.
- `captures/1-vue-ensemble.png`, `2-fiche-boucle-principale.png`, `3-parcours-etape-8.png` et `4-monolithe.png` : Chrome sans interface, `file://`, réseau coupé, 3840 × 2160.

## Écart assumé

- La version 1 visait 24 px de texte minimum pour une lecture à cinq mètres. Cette version privilégie une typographie fine : 15 px pour le titre d'un composant, 17 px dans les cartes, dans un repère de 1920 px.
- Sur un projecteur en 1920 × 1080, ces tailles restent lisibles de près. De loin, utiliser le zoom (+) ou le parcours, qui grossit le propos dans la carte de droite.

## Non vérifié

- La projection réelle en salle.
- D'autres navigateurs que Chrome.
- Un lecteur d'écran réel.
