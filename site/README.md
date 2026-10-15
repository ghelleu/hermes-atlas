# Hermes Atlas

Un atlas interactif de l'architecture agentique Hermes, pensé comme support de cours. On suit un mémo vocal envoyé depuis Telegram jusqu'à ses effets : livrable écrit, commit poussé, archive déposée. Chaque composant s'ouvre sur une fiche.

Source unique : `architecture.md`, dossier de passation mis à jour le 15 octobre 2026, converti depuis le fichier Word.

## Ouvrir

Double-cliquer sur `index.html`. La page s'ouvre dans Chrome sans serveur, sans réseau et sans installation. La scène est composée en 1920 × 1080 puis mise à l'échelle de la fenêtre, si bien que la composition reste identique sur un portable, un grand écran ou un projecteur. Pour projeter, passer Chrome en plein écran (⌃⌘F).

| Fichier | Rôle |
|---|---|
| `index.html` | la page |
| `styles.css` | toutes les couleurs et toutes les tailles, dans le bloc `:root` |
| `app.js` | le rendu et les interactions, sans aucune donnée |
| `data.js` | **tout le contenu** : couches, composants, flux, mesures, parcours |
| `captures/` | quatre PNG haute définition pour les slides |

Le contenu est dans `data.js` et non dans `data.json`, parce que Chrome interdit à une page ouverte par double-clic de lire un `.json` voisin. Tout ce qui suit `window.DONNEES =` reste du JSON pur.

## Principes de design

- **Fond clair, panneaux blancs flottants**, une seule police (celle du système), des micro-titres en capitales espacées.
- **De l'air** : 52 px entre deux couches, panneau des couches replié par défaut, composants très connectés plus hauts pour que chaque flux ait sa place.
- **Au repos, les 52 flux sont des filets gris.** La couleur n'apparaît que sur le chemin survolé, sélectionné ou parcouru, avec des perles animées qui montrent le sens. Les étiquettes se placent là où elles ne recouvrent rien ; sans place libre, elles se retirent et restent lisibles au survol direct du flux.
- **Une teinte par sens de flux**, palette vérifiée pour les daltonismes. Chaque sens a aussi son motif de trait propre. Le rouge est réservé aux pannes.
- **L'état d'un composant** se lit à sa pastille : pleine = actif, rouge = en panne ou en pause, creuse et bordure en tirets = non branché, bordure en points = hors périmètre.
- **Micro-jauges** sous les composants qui ont une mesure documentée : instantanés 476 Mo sur 500, volume 30 Go sur 46, jetons par modèle, outils MCP par serveur…
- **L'éclaté** : le curseur du bas replie l'architecture en un seul programme (section 1 du document) et la déploie en neuf couches. Il s'anime à l'ouverture de la page.

## Commandes

| Action | Souris | Clavier |
|---|---|---|
| Voir le chemin d'un composant ou d'un flux | survol | Tab sur un composant |
| Ouvrir la fiche d'un composant | clic | Entrée |
| Fermer la fiche | croix, clic sur le fond | Échap |
| Parcours : lancer, mettre en pause, reprendre | bouton noir de la barre d'outils | barre d'espace |
| Étape suivante ou précédente | flèches et barre de progression de la carte | ← → |
| Quitter le parcours | croix | Échap |
| Chercher un composant | champ en haut à droite | `/`, puis Entrée pour ouvrir |
| Masquer une couche ou un sens de flux | bouton « couches » de la barre d'outils, puis interrupteurs (onglets Couches et Flux) | |
| Éclater ou replier l'architecture | curseur du bas | |
| Zoom | molette, boutons + et − | + et − |
| Recentrer | bouton cadre | 0 |
| Toutes les étiquettes de flux | bouton étiquette | |
| Export PNG 3840 × 2160 | bouton flèche | |

Ouvrir directement un état précis, pratique pour préparer un cours :
- `#bloc=bl` ouvre la fiche de Blender ;
- `#etape=8` ouvre le parcours à l'étape 8 ;
- `#eclat=0` ouvre sur le monolithe.

## Modifier le contenu (sans toucher au code)

Tout se fait dans `data.js`, en respectant la syntaxe JSON : guillemets doubles, pas de virgule après le dernier élément.

- **Une étape du parcours** (`scenario.etapes`) : `titre`, `texte`, `ou`, `fichier`, `source`, et les identifiants `blocs` et `liens` à mettre en évidence, dans l'ordre où le jeton les parcourt.
- **Un composant** (`blocs`) : `id`, `couche`, `titre`, `chiffre`, `statut` (`actif`, `non-branche`, `panne`, `pause`, `hors-perimetre`), `machine`, `fait`, `entre`, `sort`, `cout`, `casse`, `source`, `preuve`. Champs facultatifs :
  - `mesure` : titre, source, unité, `max` éventuel, liste de `segments` ; un segment peut porter `"etat": "panne"` ou `"pause"` ;
  - `note` : un encadré « À discuter » dans la fiche ;
  - `pivot` : la mise en évidence du chemin aval s'arrête à ce composant.
- **Un flux** (`liens`) : `id`, `de`, `vers`, `type` (`evt`, `ctx`, `outil`, `stdio`, `http`, `ssh`, `data`, `git`, `cout`, `off`), `etiquette`, `source`, et `pos` en option (position de l'étiquette, de 0 à 1).
- **Le monolithe** (`monolithe`) : les textes de l'état replié.

La disposition se recalcule toute seule, sans hasard. Les couleurs et les tailles se changent dans `:root`, en tête de `styles.css`.

## Les sens de flux

| Sens | Couleur et motif (quand le flux est actif) |
|---|---|
| Message entrant | bleu, trait plein épais |
| Contexte injecté | violet, tirets |
| Appel d'outil | gris foncé, trait plein, double flèche |
| MCP stdio local | vert d'eau, tirets longs |
| MCP HTTP + OAuth | rose, tiret-point |
| MCP SSH tailnet | orange, tiret-point-point |
| Lecture / écriture | jaune, pointillé |
| Git · déploiement | vert, trait épais |
| Coût · latence | noir, pointillé serré, badge « $ » toujours visible |
| Hors service | rouge, tirets, badge croix toujours visible |

## Correspondance entre composants et sections du document

| Couche | Composant (id) | Valeur affichée | État | Mesure | Sections |
|---|---|---|---|---|---|
| 01 Entrées | Telegram (`tg`) | @eiryn_bot | actif |  | 6.1 |
| 01 Entrées | Mémo vocal (`memo`) | fil 121 | actif |  | 7.6 |
| 01 Entrées | Client de bureau (`desk`) | hors périmètre | hors périmètre |  | 7.6 |
| 01 Entrées | WhatsApp (`wa`) | non appairé | non branché |  | 6.3 |
| 02 Réception | Passerelle (`gw`) | polling · sfo | actif |  | 2.1, 3.1, 6.1 |
| 02 Réception | Transcription (`stt`) | large-v3 · fr | actif |  | 7.6 |
| 02 Réception | config/soul.md (`soul`) | voix et règles | actif |  | 10.1, 16 |
| 02 Réception | Mémoire injectée (`mem`) | MEMORY · USER | actif | Remplissage de la mémoire injectée (28 septembre 2026) (§ 8) | 8, 4 |
| 02 Réception | Personas par fil (`persona`) | fils 8227 · 1063 | actif |  | 6.1, 6.2 |
| 02 Réception | Skills (`skills`) | 159 actives | actif | Origine des 159 skills actives (§ 8) | 8, 10.3 |
| 02 Réception | Historique (`hist`) | 9 597 sessions | actif |  | 8 |
| 03 Orchestrateur | Boucle principale (`loop`) | deepseek-flash | actif | Jetons traités sur 30 jours, par modèle (§ 5.3) | 4, 5.1, 5.3 |
| 03 Orchestrateur | Plafond de tours (`turns`) | 1 000 tours | actif |  | 4 |
| 03 Orchestrateur | Compression (`comp`) | 0,50 → 0,20 | actif |  | 4, 5.1 |
| 03 Orchestrateur | Instantanés (`ckpt`) | 476 / 500 Mo | actif | Occupation des instantanés (§ 2.2, 4) | 2.2, 4, 15 |
| 03 Orchestrateur | Conservateur (`curator`) | toutes les 168 h | actif |  | 4, 8 |
| 04 Outils directs | Terminal · fichiers (`t_term`) | + exécution de code | actif |  | 7.1, 4, 15 |
| 04 Outils directs | Web · navigateur (`t_web`) | + vision | actif |  | 7.1, 7.4, 5.1 |
| 04 Outils directs | Synthèse vocale (`t_tts`) | fr-FR-DeniseNeural | actif |  | 7.6 |
| 04 Outils directs | Mémoire · sessions (`t_mem`) | skills · à faire · cron | actif |  | 7.1, 8 |
| 05 Sous-agents | delegate_task (`deleg`) | profondeur 1 | actif |  | 4 |
| 05 Sous-agents | Sous-agents (`sub`) | 3 en parallèle | actif | Sous-agents en parallèle (§ 4) | 4, 5.3 |
| 06 Connecteurs MCP | Catalogue MCP (`cat`) | 111 outils | actif | Catalogue des 111 outils MCP (§ 7.1) | 4, 7.1 |
| 06 Connecteurs MCP | Firecrawl (`fc`) | 27 outils · local | actif |  | 7.2 |
| 06 Connecteurs MCP | Figma (`fig`) | 44 outils · distant | actif |  | 7.2 |
| 06 Connecteurs MCP | Blender (`bl`) | 40 outils · Mac | actif |  | 7.2, 7.5 |
| 06 Connecteurs MCP | Dadaland (`dada`) | annoncé, non branché | non branché |  | 9.4, 15 |
| 07 Mémoire | Vault Git (`vault`) | 1 258 notes | actif |  | 10, 2.3 |
| 07 Mémoire | state.db (`statedb`) | 4,6 Go | actif | Part de state.db dans le volume occupé (§ 1) | 8, 2.2 |
| 07 Mémoire | Mémoire holographique (`holo`) | memory_store.db | actif |  | 8, 4 |
| 07 Mémoire | Google Drive (`drive`) | 11 HERMES | actif |  | 2.4, 11, 12.1 |
| 08 Déploiement | Railway (`railway`) | volume 46 Go | actif | Volume /opt/data (§ 1, 2.1) | 2.1, 13.5 |
| 08 Déploiement | hermes-railway (`gh_rail`) | 4 fichiers | actif |  | 2.3, 3, 4 |
| 08 Déploiement | hermes-vault (`gh_vault`) | 589 commits | actif |  | 2.3, 10.3, 12.1 |
| 08 Déploiement | Tâches planifiées (`cron`) | 7 · 1 en pause | actif | État des tâches planifiées au 15 octobre 2026 (§ 11) | 11, 5.3 |
| 08 Déploiement | Tailscale (`ts`) | 2 nœuds · SOCKS5 | actif |  | 7.5 |
| 08 Déploiement | Jetons Google (`jetons`) | 1 jeton révoqué | en panne | État des fichiers de jetons Google (§ 9.1) | 9.1, 15 |
| 08 Déploiement | Pont Elio (`elio`) | en pause | en pause |  | 9.3, 11, 15 |
| 08 Déploiement | Agent de secours (`secours`) | service secours | actif |  | 13.4, 17.1 |
| 09 Sorties | Réponse Telegram (`out_tg`) | texte ou voix | actif |  | 6.1, 7.6 |
| 09 Sorties | Document Google (`out_doc`) | écrit par API | actif |  | 9.1, 17.2 |
| 09 Sorties | Image générée (`out_img`) | via Dadaland, non branché | non branché |  | 9.4, 15 |
| 09 Sorties | Commit poussé (`out_commit`) | vers hermes-vault | actif |  | 10.3 |
| 09 Sorties | Archive nocturne (`out_arch`) | 1,52 à 1,72 Go | actif |  | 1, 11, 12.1, 12.3 |

## Écarts assumés par rapport à la consigne d'origine

La consigne interdisait tout chiffre absent du document source. Six points ont donc été ajustés :
- **Fichier audio** : le prompt parlait de « quelques dizaines de kilo-octets », un chiffre absent du document. Il n'apparaît pas.
- **Durée de transcription** : le document ne mesure qu'un mémo de 8 s, transcrit en une dizaine de secondes (7.6). Le bandeau le précise, sans extrapoler à 40 s.
- **Jeton révoqué** : la cause est `invalid_grant`, avec 51 échecs consécutifs ; le 401 est celui de la livraison Telegram de la tâche (9.1, 11). Le pont Elio échoue en HTTP 400, sur 10 passages (9.3).
- **Sous-agents** : seuls les réglages documentés sont affichés : 3 en parallèle, profondeur 1, 600 s, `claude-haiku-4-5` (4). Les autres interdits mentionnés dans le prompt ne figurent pas dans le document.
- **Preuve de `config/soul.md`** : le document ne cite pas le contenu du fichier. La fiche montre la règle de rédaction du 12 octobre 2026 (16) et l'indique.
- **Archive** : « 1,52 à 1,72 Go » (1, 12.1), et non « 1,5 à 1,7 ».

Point laissé visible pour le cours : l'étape 8 fait produire un rendu à Blender, alors que la section 9.4 confie toute génération de média à Dadaland. La fiche de Blender et le bandeau le signalent.

Les éléments propres au scénario (« fichier de gabarit du cours » dans Figma, « plan en trois volets ») viennent de la situation pédagogique demandée. L'outillage qu'ils mobilisent est, lui, documenté.
