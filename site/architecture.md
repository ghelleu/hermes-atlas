# Architecture agentique complète — dossier de passation

Rédigé le 28 septembre 2026 depuis le système en marche, en lecture seule.

Objet : permettre de reconstruire l'ensemble à l'identique, sur place après une panne,

ou ailleurs, sur une autre machine ou un autre hébergeur.

>

Aucun secret dans ce document. Aucune clé, aucun jeton, aucun mot de passe n'y figure,

ni en clair ni en valeur partielle. Le document nomme les variables à réobtenir et dit où elles vivent.

>

Mise à jour du 15 octobre 2026. Le relevé complet a été refait sur le système en marche. Ce qui a

changé depuis la première rédaction : le pont Tailscale vers le MacBook et le serveur MCP Blender

(section 7.5), la reconnaissance et la synthèse vocales en français (section 7.6), l'entretien

automatique du fichier d'environnement au démarrage (section 3.1), la règle de génération des médias

confiée à Dadaland (section 9.4), les comptages et les tailles remis à jour (sections 1, 5.3, 8, 10, 12),

et sept tâches planifiées au lieu de six (section 11).

## 0. Comment lire ce document

Trois usages, dans l'ordre de probabilité.

- Réparer. L'agent tourne mal ou plus du tout, mais le volume existe encore. Aller en section 13 (scénarios) puis revenir au composant concerné.

- Reconstruire. Le volume est perdu. Suivre la procédure de la section 13, scénario B, du début à la fin, et vérifier chaque étape avec les commandes données.

- Transmettre. Un tiers, ou vous-même dans un an, veut comprendre sans accès au système. La section 1 suffit pour comprendre, les sections 2 à 12 donnent chaque pièce, la section 14 liste ce qui doit être réobtenu.

Convention de lecture : les identifiants (identifiants Google Drive, identifiants de jobs cron, identifiants Railway) sont recopiés exactement tels qu'ils existent. Tout ce qui est en `code` est une valeur réelle à saisir telle quelle.

## 1. Vue d'ensemble

Le système est un seul programme qui tourne en continu sur un serveur loué, et qui sait faire quatre choses : parler, se souvenir, exécuter, et se réveiller tout seul.

- Hébergement. Un conteneur Docker chez Railway, projet `zesty-elegance`, service `hermes-railway`, environnement `production`, région `sfo` (San Francisco). Le conteneur tourne en permanence, sans redémarrage planifié. Dernier déploiement réussi le 2 octobre 2026 à 10 h 25 UTC (`761c3e6b`), conteneur démarré deux minutes plus tard.

- Mémoire de masse. Un volume persistant `hermes-railway-volume` monté sur `/opt/data`. C'est ce disque qui survit aux redéploiements. Il contient la base des conversations, les mémoires, les skills, les sauvegardes locales et le vault. 46 Go alloués, 30 Go occupés, dont 4,6 Go pour la base des sessions et 5,9 Go de caches de digestion.

- Le programme. L'image officielle Nous Research, version épinglée `v2026.9.24`, qui correspond à Hermes Agent v0.21.5. L'image est publique, donc reconstructible sans vous.

- Le code de déploiement. Le dépôt privé GitHub `ghelleu/hermes-railway` ne contient que quatre fichiers : `Dockerfile`, `config.yaml`, `railway.json`, `README.md`. Chaque `git push` sur `main` déclenche une reconstruction complète de l'image (environ six minutes) et un redéploiement automatique. Le `Dockerfile` tient en trois lignes : la base épinglée, la copie de la configuration en graine, et un commentaire daté.

- La parole. La passerelle (gateway) est connectée à Telegram. Un bot, des chats autorisés, des sujets (topics) qui déclenchent des personnalités différentes. WhatsApp a un adaptateur prêt mais n'est pas appairé. La voix est traitée sur place, reconnaissance `large-v3` en français et synthèse `edge` voix `fr-FR-DeniseNeural` (section 7.6).

- Le cerveau. Un modèle principal (DeepSeek, modèle `deepseek-flash`), deux modèles de repli en cascade, et des modèles auxiliaires pour les tâches annexes (titrer une conversation, compresser un contexte, lire une image).

- Les mains. Des outils : terminal, fichiers, recherche web, navigateur, vision, synthèse vocale, sous-agents délégués, et trois serveurs MCP : Firecrawl pour le web, Figma pour le design, Blender pour la 3D, ce dernier atteignant le MacBook de Guillaume à travers le tailnet (section 7.5).

- La mémoire. Quatre couches : `MEMORY.md` et `USER.md` injectés à chaque tour, un magasin « holographique » interrogeable, les skills comme mémoire procédurale, et la base des sessions passées en recherche plein texte.

- Le réveil. Sept tâches planifiées (cron), dont six actives au 15 octobre 2026 : sauvegarde quotidienne, miroir Obsidian, rafraîchissement des jetons Google, surveillance des alertes de sécurité Google, veille agentique du lundi, réparation du tunnel Tailscale toutes les quinze minutes, et le pont vers l'agent Elio, en pause depuis le 15 octobre 2026.

- La connaissance. Un vault markdown versionné sur GitHub privé (`ghelleu/hermes-vault`), 1 530 fichiers suivis, 1 258 notes, structuré en cinq catégories et 29 univers, avec une constitution écrite qui gouverne tout ce qui y entre.

- Les sauvegardes. Une archive complète de 1,52 à 1,72 Go déposée chaque nuit à 3 h sur Google Drive, trente conservées, plus une copie de la configuration, plus un miroir Obsidian lisible sans l'agent.

- La fabrication des images et des vidéos. Elle ne passe pas par le système : Guillaume la confie à Dadaland, dont l'accès MCP est annoncé. Aucun autre outil média ne sert pour un livrable (section 9.4).

Autrement dit : un conteneur, un disque, deux dépôts Git, un Drive, et un pont vers le MacBook. Rien d'exotique, aucune dépendance à un service rare. La reconstruction complète tient en une journée de travail humain.

## 2. Carte physique : où vit chaque chose

### 2.1 Railway (l'hébergement)

- Projet : `zesty-elegance` (identifiant `5fd03d97-caba-489b-b41c-31237fc47e85`)

- Service : `hermes-railway` (identifiant `a5145405-5306-452e-93cb-aa52fd56108d`)

- Environnement : `production` (identifiant `2d76c6df-8570-494b-94dc-a0378d70d96a`)

- Volume : `hermes-railway-volume` (identifiant `269a0a61-0d1d-4f39-9302-8204d1403cd0`), monté sur `/opt/data`, instance en service `d3de68fb-088a-44f9-95bb-637e90b8eb55` (33,1 Go relevés par l'API Railway)

- Région : `sfo` (San Francisco)

- Dernier déploiement réussi : `761c3e6b-a9ab-437c-b8e4-1a953a6dd91f`, le 2 octobre 2026 à 10 h 25 UTC. Le conteneur en marche au 15 octobre 2026 a démarré le 2 octobre 2026 à 10 h 27 UTC.

- Domaine interne : `hermes-railway.railway.internal`

- Variables déclarées : 25, aucune signalée comme suspecte au 15 octobre 2026 (section 14.1).

- Ressources allouées : 48 processeurs, 380 Go de mémoire vive, disque 46 Go (30 Go occupés, 17 Go libres)

- Chaîne de démarrage : une commande de démarrage personnalisée remplace celle de l'image. Elle récupère si besoin `/opt/data/vault/skills/devops/agent_de_secours/scripts/start_main.py` depuis le vault GitHub, l'exécute avec `--apply`, puis lance `exec hermes gateway run`. Ce script entretient le fichier d'environnement avant que la passerelle ne démarre (section 3.1). La passerelle refuse de tourner en root, c'est pourquoi l'utilisateur `hermes` (uid 10000) existe et possède les fichiers du volume.

### 2.2 Le volume `/opt/data` (ce qui survit)

- `vault/` (132 Mo) : le second brain, dépôt Git.

- `skills/` : symlink vers `vault/skills/`. Les deux chemins sont le même répertoire, ne jamais les traiter comme des doublons.

- `state.db` (4,6 Go) : base SQLite des sessions, 41 tables, 9 597 sessions, 301 927 messages. Plus `state.db-wal` (12 Mo).

- `config.yaml` (538 lignes, version de schéma 24) : la configuration vivante.

- `.env` (482 lignes, dont 394 de commentaires, et 21 variables réelles) : le fichier de secrets qui prime sur les variables Railway.

- `memories/` (32 Mo), `memory_store.db` : mémoire longue et magasin holographique.

- `cron/` (4,9 Mo) : `jobs.json` plus les journaux de chaque exécution.

- `checkpoints/` (476 Mo) : instantanés de fichiers pris par l'agent avant modification. Le plafond est de 500 Mo, la marge est donc mince (section 15).

- `profiles/` (9,6 Mo) : `default`, `digest` (9 Mo), `facture` (508 Ko), et quatre coquilles vides (`head`, `magnetic`, `pdn`, `hermes`).

- `cache/` (5,9 Go), `pop_pdfs/` (472 Mo), `sil_pdfs/` (434 Mo), `iah_pdfs/` (183 Mo) : matières premières et caches de digestion.

- `wip/` (184 Mo), `web-deploy/` (180 Mo), `web-projects/` (34 Mo) : travail en cours, hors périmètre de sauvegarde.

- `index.db` (148 Mo, héritage arrêté le 4 août 2026), `index_clean.db` (17 Mo), `kanban.db`, `shared-state.db`, `verification_evidence.db` : bases secondaires.

- `logs/` (29 Mo), `sessions/` (15 Mo), `scripts/` (113 fichiers), `audit_env/` (27 Mo) : exploitation.

- Bibliothèques d'exécution : `lazy-packages/` (420 Mo), `lsp/` (56 Mo), `bin/` (123 Mo, qui porte aussi les deux binaires Tailscale).

- Hors périmètre mais présents : `projects/` (27 Mo), `archive/` (11 Mo), `iconographie/` (7,2 Mo), `hint3rland_shared_drive.json` (7,3 Mo).

### 2.3 Les dépôts GitHub

- `ghelleu/hermes-railway` (privé) : le déploiement, quatre fichiers. Dernier commit : `6987c381`, « Update config.yaml », le 2 octobre 2026 à 10 h 25 UTC. Le `Dockerfile` fait trois lignes : `FROM nousresearch/hermes-agent:v2026.9.24`, la copie de `config.yaml` vers `/opt/hermes/seed-config.yaml`, et un commentaire daté du 28 septembre 2026.

- `ghelleu/hermes-vault` (privé) : le vault entier, 1 530 fichiers suivis, 589 commits depuis le 6 août 2026. Dernier commit au 15 octobre 2026 : `9136be3`, « MAGNETIC : avis exterieur sur le dossier v6 ».

- Autres dépôts liés : `ghelleu/ghelleu.github.io` (portfolio public), `ghelleu/mariage-sg` (public), `Hint3rland/NODE-UI`, `Hint3rland/elio`, `Hint3rland/hint3rland`, `Hint3rland/MCI` (privés).

- Le code de `/opt/hermes` n'est pas un dépôt Git : il vient de l'image. Ne pas le traiter comme une source à sauvegarder, sauf patch local documenté.

### 2.4 Google Drive (compte `guillaumehelleu.pro@gmail.com`)

Dossiers racine : `01 WORK`, `02 ADMINISTRATIF`, `03 BANDES DESSINEES`, `03 SIG - Signal`, `04 EBOOK`, `05 IMAGES`, `08 DIVERS`, `09 PARTAGE`, `10 TEMPORAIRE`, `11 HERMES`, `12 CLAUDE CODE`.

`11 HERMES` (identifiant `14VmA1ww0qQ-93_8HwqSNnmE6Z4gz94po`) et ses sous-dossiers :

- `01 CONFIGS INFRASTRUCTURE` (`1YG0yaTOXAzgJzUjFPg7vIsuTGf0UIeN8`) : copie de `config.yaml` à chaque exécution, trente conservées. La plus récente, déposée le 15 octobre 2026, pèse 11 772 octets.

- `02 SNAPSHOTS COMPLETS` (`1x8RUMg9yaVGyfNrpeGszwdPMy0at1LSv`) : les archives nocturnes, trente conservées (section 12.1).

- `02 DOCUMENTATION` (`1AUhiKdl7nc2GshYsqiDAOP_HXwF-6DAy`) : documents de référence. Il contient la version Google Docs du présent dossier, mise à jour le 15 octobre 2026, à côté de `GUILLAUME_DRIVE_ORGANIZATION.md`, `DRIVE RULES - Nomenclature & Backup` et `TECH REFERENCE - Infrastructure`.

- `03 SECRETS TOKENS` (`1GrkrHuF-x7IrWHqSEPsG5U9CXPsnpS78`) : contient un document intitulé « Clés API & Mots de passe Hermes », dernière modification le 6 août 2026. Voir section 15, point 2.

- `04 OBSIDIAN` (`1Z28uE0EVN-SHuGSeoykIA7NnTlD0JjDL`) : miroir markdown du vault, huit sous-dossiers.

- `05 HTML`, `06 URGENCE`, `07 AUDIO`, `08 TEMPORAIRE ANALYSE PITCH`, `09 WHATSAPP` : archives opérationnelles.

`01 WORK` (identifiant `0Byb7TQSJQ-1FdmY3Z2pEczBuRkk`) contient la matière première professionnelle : `01 PROJETS` (27 dossiers, un par univers), `02 PORTFOLIO - PUBLICATIONS`, `03 OUTILS DE TRAVAIL`, `04 CARNETS DE RECHERCHES`, `05 COURS`, `06 ECRITS DE DOSSIERS`, `07 SCANS`.

Correspondance : chaque dossier de `01 PROJETS` donne un univers du vault, avec un code de trois lettres (par exemple `AETC` pour l'univers `aet_aetc`). La table complète code vers dossier vit dans la constitution du vault, section 6.

## 3. Le socle technique

- Image de base : `nousresearch/hermes-agent:v2026.9.24` (version épinglée, plus jamais `latest`). Le pin a été posé le 28 septembre 2026 parce qu'un `latest` rendait chaque reconstruction indéterminée.

- Version en marche : Hermes Agent v0.21.5 (2026.9.24), révision amont `f97608f1`. Méthode d'installation : `docker`.

- Système : Debian GNU/Linux 13 (trixie). Langages et outils présents : Python 3.13.5, Node.js v26.5.1, npm 11.17.0, `uv` et `uvx`, `ffmpeg` (nécessaire à la voix), SQLite compilé depuis les sources, Playwright fourni par l'image pour le navigateur automatisé.

- Environnements Python : `/opt/hermes/.venv` (celui du programme, il porte `yaml` et les bibliothèques Google), et sur le volume `/.venv`, `/.venv-google`, `/.venv-mail`, `/.venv-workspace`, `/.venv-life_memory`, `/.venv_pdf`.

- Taille de l'image : environ 1,3 Go. Un `git push` la reconstruit entièrement en six minutes, même pour une ligne modifiée, parce que le `COPY . .` invalide le cache à partir de ce point.

- Utilisateur d'exécution : `hermes`, uid 10000. Le volume est monté en root : au démarrage, un `chown -R hermes:hermes /opt/data` est nécessaire, et `HOME` doit valoir `/opt/data` sinon la passerelle écrit son verrou dans `/root` et refuse de démarrer.

- Contrôles après mise à jour : `/opt/data/scripts/post_upgrade_controls.sh` enchaîne sept vérifications (version attendue, conteneur, intégrité de la base `state.db`, erreurs de session en fin de journal, reprogrammation des tâches planifiées, erreur réseau Telegram de 01 h 11, premières lignes du démarrage). C'est le rituel à repasser après chaque déploiement.

### 3.1 L'entretien du fichier d'environnement au démarrage

Depuis le 2 octobre 2026, la commande de démarrage du service n'est plus celle de l'image : elle appelle d'abord `start_main.py --apply`, puis la passerelle. Ce script existe à cause d'un incident précis, et il change la façon de reconstruire le système.

- L'ancienne commande recopiait ses blocs de variables à chaque redémarrage. Le fichier `/opt/data/.env` a fini par contenir cinq fois les mêmes lignes, dont une valeur jamais résolue (`${...}`). C'est cette valeur vide qui a vidé l'autorisation Telegram et provoqué cinq heures de panne le 21 septembre 2026.

- Ce que le script fait, dans l'ordre : il sauvegarde le fichier courant dans `/opt/data/backups/env/`, écarte les doublons (une seule ligne par clé, la dernière valeur valable gagne), retire les valeurs non résolues et les jetons GitHub morts, retire les autorisations ouvertes à tous et écrit l'autorisation nominative, reprend les secrets depuis les variables Railway, qui font foi, puis vérifie le fichier obtenu et restaure la sauvegarde en cas de problème.

- Le mode par défaut est la simulation ; `--apply` écrit réellement.

- Ce que cela implique pour la reprise : les variables Railway sont la source qui fait foi pour les secrets qu'elles portent, et le fichier du volume se reconstruit à partir d'elles à chaque démarrage. Les variables du fichier qui n'existent pas côté Railway doivent en revanche être ressaisies à la main (section 14.2).

## 4. La configuration vivante

Le fichier qui compte est `/opt/data/config.yaml`, sur le volume. Trois propriétés à retenir.

- Il est seedé une seule fois au premier démarrage, puis vit indépendamment. Un redéploiement ne le réécrit pas.

- Le `config.yaml` du dépôt `hermes-railway` n'est copié que vers `/opt/hermes/seed-config.yaml` et aucun code ne le lit au moment de l'exécution. Pousser une modification de configuration sur GitHub ne change donc rien au conteneur qui tourne.

- La bonne façon de modifier la configuration est `hermes config set <clé> <valeur>` (binaire à `/opt/hermes/.venv/bin/hermes`). La livraison relit le fichier à la volée, donc le changement prend effet sans redémarrage.

Règle de prudence héritée de plusieurs incidents : ne jamais éditer `config.yaml` directement, ni par script, sans autorisation explicite. Passer par `hermes config set`, ou fournir un fichier complet à téléverser.

Réglages structurants, tels qu'en marche le 28 septembre 2026 :

- `model.default` = `deepseek-flash`, `model.provider` = `deepseek`, `providers.deepseek.base_url` = `https://api.deepseek.com`, format d'API `openai`.

- `fallback_providers` = `["anthropic:claude-sonnet-4-6", "minimax:MiniMax-M3"]`, dans cet ordre.

- `agent.max_turns` = 1000, `agent.reasoning_effort` = `medium`, `agent.tool_use_enforcement` = `auto`.

- `compression.enabled` = vrai, `threshold` = 0,50, `target_ratio` = 0,20, `protect_first_n` = 3, `protect_last_n` = 20.

- `memory.memory_enabled` = vrai, `memory_char_limit` = 5000, `memory.user_char_limit` = 3000, `memory.provider` = `holographic`, `memory.flush_min_turns` = 6.

- `model_catalog.enabled` = vrai : le catalogue des modèles se rafraîchit toutes les 24 heures.

- `checkpoints.enabled` = vrai, `max_snapshots` = 20, `min_interval_hours` = 24, `retention_days` = 7, plafond total 500 Mo, occupé 476 Mo au 15 octobre 2026.

- `approvals.mode` = `smart` (un modèle auxiliaire juge les commandes risquées), `approvals.cron_mode` = `deny` (une tâche planifiée ne peut pas ouvrir de demande d'approbation interactive), délai 60 secondes, confirmation demandée pour les commandes destructrices et pour le rechargement d'un serveur MCP.

- `session_reset.mode` = `none` (aucune remise à zéro automatique des sessions ; contrairement à ce qu'affirmait une note interne plus ancienne qui disait `both`).

- `sessions.retention_days` = 90, `sessions.auto_prune` = faux : rien ne se supprime tout seul.

- `delegation.model` = `claude-haiku-4-5`, `delegation.provider` = `anthropic`, `max_concurrent_children` = 3, `max_spawn_depth` = 1, délai par enfant 600 secondes, orchestrateur activé.

- `curator.enabled` = vrai : entretien des skills créés par l'agent, toutes les 168 heures, archivage après 90 jours, sauvegarde tar.gz avant chaque passe.

- `kanban.dispatch_in_gateway` = vrai, intervalle de distribution 60 secondes.

- `gateway.multiplex_profiles` = vrai : un seul processus sert tous les profils.

- `security.redact_secrets` = vrai : les sorties d'outils sont filtrées avant d'entrer dans le contexte. Conserver cette valeur. `security.tirith_enabled` = vrai : les commandes sont analysées avant exécution, en mode « fail open ».

- `tool_output` : 50 000 octets, 2 000 lignes, 2 000 caractères par ligne maximum.

- `tools.tool_search` = `auto`, seuil 10 pour cent : les outils des serveurs MCP ne sont pas chargés d'office, l'agent va les chercher à la demande. C'est ce qui permet de garder trois serveurs MCP branchés sans noyer le contexte.

- `logging` : niveau `INFO`, rotation 5 Mo, trois fichiers, surveillance mémoire toutes les 300 secondes.

- `stt` : activé, moteur local `faster-whisper`, modèle `large-v3`, langue `fr`. `tts` : `edge`, voix `fr-FR-DeniseNeural` (section 7.6).

- `browser` : moteur `auto`, 30 secondes par commande, inactivité 120 secondes, dialogues gérés en 300 secondes, `allow_private_urls` = faux.

- `timezone` : vide (le système raisonne en UTC).

- `mcp_servers` : `firecrawl` (commande `npx firecrawl-mcp`, avec la clé en variable d'environnement), `figma` (`https://mcp.figma.com/mcp`, authentification OAuth) et `blender` (commande `/opt/data/scripts/mac_blender_mcp.sh`, section 7.5).

- `toolsets` = `["hermes-cli"]`, et `agent.disabled_toolsets` est vide : aucun jeu d'outils n'est désactivé par la configuration.

## 5. Modèles et fournisseurs

### 5.1 Répartition

- Modèle principal : `deepseek-flash` chez DeepSeek en direct. C'est lui qui répond à tout, sauf mention contraire.

- Replis : `claude-sonnet-4-6` chez Anthropic, puis `MiniMax-M3` chez MiniMax. Les trois sont chaînés automatiquement en cas d'indisponibilité.

- Tâches auxiliaires, chacune avec son modèle propre :

  - `auxiliary.vision` : `claude-haiku-4-5` chez Anthropic (lecture d'images).

  - `auxiliary.approval` : `claude-haiku-4-5` chez Anthropic (juge des commandes risquées).

  - `auxiliary.triage_specifier` : `claude-haiku-4-5` chez Anthropic.

  - `auxiliary.title_generation` : `openai/gpt-6-luna` via OpenRouter, avec repli `anthropic/claude-haiku-4-5`.

  - `auxiliary.compression` : `openai/gpt-6-luna` via OpenRouter, avec repli `anthropic/claude-haiku-4-5`.

  - Les autres emplacements (`curator`, `kanban_decomposer`, `mcp`, `profile_describer`, `skills_hub`, `web_extract`) sont en `auto`, c'est-à-dire qu'ils empruntent le modèle principal.

- Le basculement de `title_generation` et `compression` vers Luna (les 28 septembre 2026) visait une économie mesurée sur les données réelles : la facture Anthropic venait aux deux tiers des écritures de cache, à 1,25 dollar le million chez Anthropic contre 0,125 chez OpenAI. Le prix de `openai/gpt-6-luna` est de 0,10 dollar par million en entrée, 0,50 en sortie, 0,01 en lecture de cache, pour 1 050 000 jetons de contexte. La variante `-pro` est au même prix, la différence étant le mode raisonnement et donc la latence.

### 5.2 Clés nécessaires (noms seulement)

`DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `ANTHROPIC_API_KEY`, `MINIMAX_API_KEY`, `OPENROUTER_API_KEY`. Les quatre premières vivent dans `/opt/data/.env` ; `OPENROUTER_API_KEY` vit dans les variables Railway depuis l'origine.

### 5.3 Volumétrie et coûts réels

Relevé par `hermes insights` sur trente jours glissants, du 16 septembre au 14 octobre 2026.

- 89 sessions, 6 696 messages, 3 514 appels d'outils, 934 messages de Guillaume, 1,064 milliard de jetons traités, coût estimé 53,61 dollars.

- Par modèle : `deepseek-flash` 1 004,5 M jetons sur 57 sessions, `claude-haiku-4-5` 30,6 M sur 32 sessions, `claude-opus-5-5` 29,7 M sur 2 sessions, `deepseek-v4-pro` aucun.

- Par plateforme : Telegram 42 sessions, sous-agents 31, tâches planifiées 16.

Ce que ces chiffres disent, et ce qui a changé depuis septembre : le poste de coût n'est plus seulement les tâches auxiliaires. Deux sessions menées avec `claude-opus-5-5` pèsent 29,7 M jetons, presque autant que les trente-deux sessions Haiku réunies, pour une facture bien supérieure. Le volume reste porté par le modèle principal et les lectures de cache, mais un appel ponctuel à un modèle de tête se voit immédiatement dans le total. La mesure de l'économie attendue du basculement vers `openai/gpt-6-luna` (28 septembre 2026) reste à faire proprement.

## 6. Plateformes de messagerie, profils et personnalités

### 6.1 Telegram (la seule plateforme active)

- Bot : `@eiryn_bot`. Jeton dans `TELEGRAM_BOT_TOKEN` (fichier `/opt/data/.env`).

- Mode : interrogation continue (polling), pas de webhook.

- Chats autorisés (`telegram.allowed_chats`) : `8333583307` (le canal personnel, dit « Home ») et `-1003930058551` (le groupe de travail).

- Réactions Telegram désactivées, affichage des appels d'outils désactivé.

- Le groupe porte des sujets. Chaque sujet est un identifiant de fil, et deux d'entre eux changent la personnalité de l'agent (`telegram.channel_prompts`) :

  - fil `8227` → fichier d'âme `/opt/data/profiles/digest/SOUL.md` : persona « Digest », curateur de connaissance, qui digère la matière première vers le vault.

  - fil `1063` → fichier d'âme `/opt/data/profiles/facture/SOUL.md` : persona « Facture », dédié à l'émission et au suivi des factures freelance, avec pour référence unique la feuille de suivi.

- Sujets utilisés à ce jour, à titre de repère : `121` (travail courant), `8227` (digestion), `1063` (facturation), `16965` (livraison du rafraîchissement de jetons Google), plus des fils de projet (Tour des Possibles, Magnetic association).

### 6.2 Profils

- `default` : le profil principal, modèle `deepseek-flash`, passerelle active.

- `digest` : mémoire, sessions et journaux propres, 9,0 Mo. Persona d'ingestion.

- `facture` : mémoire, sessions et journaux propres, 508 Ko. Persona de facturation.

- Coquilles créées mais non utilisées : `head`, `magnetic`, `pdn`, `hermes` (16 Ko chacune).

- Le multiplexage est activé : un seul processus sert tous les profils.

### 6.3 WhatsApp (préparé, non activé)

- Adaptateur présent dans l'image : `/opt/hermes/plugins/platforms/whatsapp/adapter.py`, non activé.

- Passerelle Node.js « Baileys » installée sur le volume : `/opt/data/scripts/whatsapp-bridge/bridge.js` (28 101 octets), avec `node_modules` de 57,9 Mo installés le 28 septembre 2026.

- État : aucun appairage. Pas de fichier d'identifiants, pas de processus en écoute.

- Trois modes sont prévus par le pont : discussion avec soi-même (aucun risque de répondre à un vrai contact), mode bot sur un second numéro, et mentions uniquement.

- Coût du mode bot, chiffré le 28 septembre 2026 : environ 1 dollar par mois d'infrastructure, un numéro prépayé suisse autour de 20 francs une fois, puis 0,031 dollar par message entrant mesuré sur données réelles (5 messages par jour : 4,65 dollars par mois ; 30 messages par jour : 27,90 dollars).

- Une eSIM de données ne convient pas : sans numéro, ni appels, ni SMS, donc aucun code de vérification WhatsApp. Une eSIM prépayée Swisscom ou Sunrise, en double SIM, est la voie praticable.

### 6.4 Plateformes présentes en configuration mais non actives

Discord, Slack, Matrix, Mattermost ont des sections de configuration. Seuls Telegram et WhatsApp (adaptateur) sont câblés. Rien n'est perdu à les recréer si besoin, ce sont des sections inertes.

## 7. Outils et connecteurs

### 7.1 Jeux d'outils activés

Aucun jeu d'outils n'est désactivé par la configuration : `agent.disabled_toolsets` est vide. Sont donc disponibles le terminal, les fichiers, l'exécution de code, la recherche et l'extraction web, le navigateur, la vision, la synthèse vocale, les skills, les tâches à faire, la mémoire, la recherche dans les sessions, la clarification, la délégation à des sous-agents, les tâches planifiées et le pilotage d'écran.

Les outils des serveurs MCP ne sont pas chargés d'office : `tools.tool_search` est en `auto` avec un seuil de 10 pour cent, donc l'agent va les chercher à la demande dans un catalogue de 111 outils (27 Firecrawl, 44 Figma, 40 Blender). C'est ce qui permet de garder trois serveurs MCP branchés sans noyer le contexte.

`platform_toolsets` déclare un jeu d'outils par plateforme : `cli`, `telegram`, `discord`, `slack`, `signal`, `teams`, `google_chat`, `whatsapp`, `homeassistant`, `qqbot`, `yuanbao`. Seuls la CLI et Telegram servent aujourd'hui. Le greffon `a2a` (agent à agent) est installé dans l'image mais désactivé.

### 7.2 Serveurs MCP

- `firecrawl` : lancé par `npx firecrawl-mcp`, clé `FIRECRAWL_API_KEY`. Tous les outils activés. C'est le moteur de recherche et de collecte web.

- `figma` : `https://mcp.figma.com/mcp`, authentification OAuth, jetons rangés dans `/opt/data/mcp-tokens/` (`figma.client.json`, `figma.json`, `figma.meta.json`). Quarante-quatre outils : lecture des fichiers et des composants de design, capture d'écran d'un cadre, export d'images et de vidéos, création de diagrammes, écriture dans un fichier Figma. C'est ce qui permet de lire une maquette et d'en produire une.

- `blender` : lancé par `/opt/data/scripts/mac_blender_mcp.sh`, une passerelle locale qui parle au MacBook par SSH à travers le tailnet (section 7.5). Quarante outils : lecture de la scène, création et transformation d'objets, matériaux et textures, rendu, import de modèles Polyhaven, Poly Pizza et Sketchfab, génération de modèles par Hyper3D, Tripo ou Hunyuan3D, export de scène.

### 7.3 Greffons

Ceux fournis par l'image sont actifs, notamment les moteurs de navigateur `browser-browser-use` et `browser-browserbase` (ce dernier exige `BROWSERBASE_API_KEY` et `BROWSERBASE_PROJECT_ID`). Aucun greffon tiers installé à la main.

### 7.4 Recherche et navigateur

- Backends web laissés en automatique : Hermes choisit selon les clés présentes (Firecrawl en MCP, plus les outils internes).

- Navigateur en mode `auto`, délais : 30 secondes par commande, inactivité 120 secondes, dialogues gérés en 300 secondes.

### 7.5 Le pont vers le MacBook : Tailscale et le serveur MCP Blender

Le serveur MCP de Blender doit tourner sur le Mac, parce que l'extension Blender n'écoute que sur `127.0.0.1:9876` : seule la boucle locale du Mac peut lui parler. Le conteneur l'atteint par SSH à travers le tailnet, sans ouvrir aucun port nulle part.

- Deux nœuds vivent dans le tailnet `guillaumehelleu.pro@` : `hermes-railway` (`100.116.245.51`, linux, le conteneur) et `macbook-air-de-guillaume` (`100.106.146.95`, macOS, le Mac de Guillaume).

- Le démon Tailscale tourne en mode `userspace-networking`, sans périphérique TUN, que le conteneur n'a pas. Son état vit sur le volume (`/opt/data/tailscale/tailscaled.state`), sa socket dans `/opt/data/tailscale/tailscaled.sock`, et il expose un proxy SOCKS5 sur `127.0.0.1:1055`. Les deux binaires sont sur le volume : `/opt/data/bin/tailscale` (33 Mo) et `/opt/data/bin/tailscaled` (42 Mo).

- Conséquence utile : un redéploiement fait disparaître le démon mais pas l'identité du nœud, qui vit sur le disque. Aucune réauthentification n'est nécessaire au redémarrage.

- La passerelle MCP (`/opt/data/scripts/mac_blender_mcp.sh`, transport stdio) ouvre une connexion SSH vers `guillaumehelleu@macbook-air-de-guillaume.tail10b401.ts.net` avec la clé `/opt/data/.ssh/id_hermes_mac`, à travers un `ProxyCommand` SOCKS (`/opt/data/scripts/socks_proxycmd.py`). La commande distante lance `uvx mcp-for-blender --host 127.0.0.1 --port 9876` avec un `PATH` explicite, parce qu'une commande SSH non interactive sur macOS n'hérite pas de `/opt/homebrew/bin`.

- Les identifiants vivent hors dépôt Git, dans `/opt/data/mac_blender_mcp.env` : utilisateur, hôte, commande distante. Ce fichier et la clé SSH ne sont sauvegardés nulle part (section 12.2).

- Réparation : `/opt/data/scripts/tailscale_ensure.sh` est idempotent et silencieux quand tout va bien. Il est appelé en pré-vol par la passerelle MCP, et par une tâche planifiée toutes les quinze minutes (`389ade52c1bb`) pour survivre aux redéploiements.

- Historique : la première version passait par un tunnel Cloudflare sortant. Elle a été abandonnée, le réseau de Guillaume bloquant le port 7844 de Cloudflare en UDP comme en TCP.

- Ce qu'il faut côté Mac : l'application Tailscale active, l'extension Blender et son serveur MCP lancés, et le SSH distant autorisé pour cet utilisateur.

- Diagnostic manuel : `MAC_MCP_DIAG=1 bash /opt/data/scripts/mac_blender_mcp.sh` interroge le Mac directement, hors du chemin MCP.

### 7.6 La voix : reconnaissance et synthèse en français

L'échange vocal fonctionne dans les deux sens sur Telegram, et rien ne sort du système.

- Reconnaissance : `stt` est activé, moteur local `faster-whisper`, modèle `large-v3` (3,1 Go rangés dans `/opt/data/.cache/huggingface/`), langue forcée en français. Un mémo vocal envoyé dans Telegram est transcrit sur place.

- Synthèse : `tts` en `edge`, voix `fr-FR-DeniseNeural`. La voix anglaise d'origine rendait le français incompréhensible et dégradait la reconnaissance des messages vocaux suivants.

- Commandes : `/voice on`, `/voice tts`, `/voice off` et `/voice status` règlent le mode vocal côté Telegram. Le plein duplex reste réservé au client de bureau.

- Coût : la transcription locale est gratuite. À titre de comparaison, `whisper-1` chez OpenAI coûte 0,006 dollar la minute, et le mode vocal du client de bureau 0,05 dollar la minute.

- Durée observée : un mémo de huit secondes se transcrit en une dizaine de secondes, chargement du modèle compris.

- Limite connue : les noms propres dérivent (Tour des Possibles, Magnetic, Geneva Lux, Hans Wilsdorf). Un amorçage de vocabulaire (`stt.initial_prompt`) reste à renseigner pour les corriger.

## 8. Mémoire et connaissance

Quatre couches, avec des rôles distincts. Confondre les couches est la première source d'erreur.

- Mémoire injectée (`MEMORY.md`, `USER.md`) : deux fichiers texte, rechargés dans chaque tour de conversation, avant même la première question. Plafonds : 5 000 caractères pour la mémoire d'agent, 3 000 pour le profil utilisateur. Au 28 septembre 2026, la mémoire est pleine à 99 pour cent : toute addition exige de retirer ou de condenser une entrée dans la même opération. Un miroir de ces deux fichiers est versionné dans le vault (`03_agent/memories/`).

- Mémoire longue « holographique » : fournisseur `holographic`, base `/opt/data/memory_store.db` (64 Ko), en service depuis le 22 septembre 2026. Elle stocke des faits résolus par entité avec un score de confiance, et répond à des questions composées (« quels projets relient telle personne et tel lieu »). Elle est indépendante de la mémoire injectée et peut donc ressortir un fait que `MEMORY.md` ne porte pas.

- Skills (mémoire procédurale) : 159 compétences actives, dont 148 locales et 11 fournies par l'image, réparties en 39 dossiers de catégorie, pour 495 fichiers markdown dans le vault (les skills embarquent leurs propres références et gabarits). Un skill est un mode d'emploi que l'agent écrit lui-même après avoir résolu un problème, et qui se recharge automatiquement quand le sujet revient. Le nettoyage est assuré par le conservateur (`curator`), qui archive après 90 jours d'inactivité sans jamais supprimer, avec sauvegarde préalable. Les skills de Guillaume, écrits par lui, sont hors de portée du conservateur : il ne touche qu'aux skills créés par l'agent.

- Base des sessions (`state.db`) : 4,6 Go, 41 tables, 9 597 sessions et 301 927 messages, indexée en recherche plein texte (`messages_fts`). C'est la mémoire brute, celle qui permet de retrouver un échange précis d'il y a trois mois. Bases secondaires : `checkpoints/` (476 Mo d'instantanés de fichiers avant modification, 20 maximum), `verification_evidence.db`, `shared-state.db`, `kanban.db`.

## 9. Intégrations tierces

### 9.1 Google Workspace

- Trois fichiers de jetons : `/opt/data/google_token.json` (compte principal, en lecture seule pour tous, mode 444 anti-écrasement), `google_token_guillaumepro.json`, `google_token_hint3rland.json`. Ces deux derniers n'ont pas toujours les bons périmètres pour Drive : le fichier de référence est `google_token.json`.

- Onze périmètres portés par le jeton principal : `drive`, `documents`, `spreadsheets`, `calendar`, `gmail.modify`, `gmail.readonly`, `gmail.send`, `contacts.readonly`, `script.deployments`, `script.projects`, `script.webapp.deploy`. Les trois derniers servent aux projets Apps Script.

- Les onze périmètres appartiennent au même identifiant client, ce qui a une conséquence documentée : une révocation en cascade peut tout emporter d'un coup.

- Ce que cet accès sert : le Drive (dépôt des sauvegardes, lecture de la matière première, ce document), Docs, Sheets, Calendar, Gmail en lecture, en envoi et en modification, Contacts en lecture, et les déploiements de projets Apps Script.

- Rafraîchissement automatique toutes les 30 minutes par la tâche `auto_refresh_tokens.py`, avec notification dans le fil Telegram `16965`.

- Surveillance horaire des alertes de sécurité Google (`google_security_monitor.py`) : le script détecte les courriels « Security alert » (octroi d'accès à une application tierce) et prévient avant que Google ne révoque les jetons, ce qui couperait Drive, Gmail et Sheets.

- Réauthentification : procédure OOB (hors navigateur) scripts `reauth_*` dans `/opt/data/scripts`. Piège éprouvé : deux délais dépassés d'affilée signifient qu'il faut demander à Guillaume d'ouvrir le lien, jamais relancer en boucle.

- Bibliothèque Google présente dans tous les environnements Python du volume : `google-auth` et `google-api-python-client`.

- État au 15 octobre 2026 : le jeton principal et celui de `guillaumepro` se rafraîchissent normalement. Celui de `hint3rland` est révoqué (`invalid_grant`), ce qui fait échouer la tâche de rafraîchissement toutes les trente minutes, cinquante et un passages consécutifs au 15 octobre. La livraison Telegram de cette tâche échoue elle aussi, en 401. Une réautorisation OOB du compte concerné est nécessaire (section 15).

### 9.2 Autres services

- Figma : via MCP, OAuth. Un script d'appel direct existe aussi (`/opt/data/scripts/figma_mcp_call.py`).

- Firecrawl : collecte et extraction web (MCP plus clé directe).

- Browserbase : navigateur distant (variables `BROWSERBASE_*`).

- Vercel : déploiement de pages (`VERCEL_TOKEN`), usage historique via `/opt/data/web-deploy/`.

- GitHub : `GITHUB_NEW_TOKEN` pour les dépôts, utilisé par les sauvegardes de vault et les lectures d'API.

- Google Sheets comme poste de travail : deux feuilles servent de source de vérité. Le tracker des tâches à faire, « Guillaume - A FAIRE (tracker) » (identifiant `1Mv1DmwIKewYkTo4O2w97ZsZrEK6JT21eASim2paotfE`), dont la synchronisation est assurée par `/opt/data/scripts/sync_tracker.py`. Et l'index de carrière, « Guillaume Helleu - INDEX 2026 » (identifiant `1-rDLUjDXWT5NfQJnbRwbCS_RidZxJc_VRGhJ5LrqdTs`), dont la note maîtresse vit dans le vault (`01_identite/index_carriere.md`). Règle de travail : ces feuilles se lisent et se mettent à jour, on ne les remplace pas par une copie locale.

- Supabase : `SUPABASE_URL` et `SUPABASE_KEY` présents dans l'environnement ; aucun usage actif identifié au 15 octobre 2026.

- DeepSeek, Anthropic, OpenRouter, MiniMax : fournisseurs de modèles (section 5).

### 9.3 Le pont vers Elio (agent à agent)

- Elio est l'agent OpenClaw du studio Hint3rland. L'échange passe par deux fichiers JSONL dans Google Drive (un par sens), append-only, un seul rédacteur par fichier, journal des tours, plafond de trois tours par fil.

- Procédure complète : skill `agent_bridge_elio`, script `bridge_drive.py` dans `/opt/data/vault/skills/devops/agent_bridge_elio/scripts/`.

- Surveillance : tâche planifiée `pont_elio` (`bridge_watch_elio.py`) toutes les cinq minutes, qui ne réveille l'agent que si un fichier change.

- Règle de sécurité du pont : jamais de secret dans Drive, uniquement des noms de variables et des chemins.

- État au 15 octobre 2026 : la tâche est en pause, sur décision de Guillaume. Son dernier échec venait du rafraîchissement du jeton Drive de la passerelle, refusé par Google en HTTP 400, sur dix passages consécutifs. La reprise suppose de refaire ce jeton, puis de réactiver la tâche.

### 9.4 La génération d'images et de vidéos passe par Dadaland

Guillaume confie toute génération de média à Dadaland, l'outil du studio, et non au système. L'accès MCP à Dadaland est annoncé pour octobre 2026. D'ici là, la règle tient en deux points : ne produire aucun média par un autre canal, et livrer un prompt quand une image est demandée. Le jour où l'accès arrive, il prendra place comme quatrième serveur MCP et cette section deviendra la description de son branchement.

## 10. Architecture du vault (second brain)

### 10.1 Forme

Cinq catégories, 29 univers, chaque univers nommé `code_nom` (trois lettres puis un nom en snake_case), le code servant aussi de préfixe aux fichiers internes.

- `01_school` (3 univers, 6 notes) : `jeu_jeunesse`, `aap_arts_appliques`, `ads_ateliers_de_sevres`.

- `02_study` (7 univers, 36 notes) : `al1`, `al2`, `al3` (Oxford Brookes), `am1`, `am2`, `mem_memoire`, `pfe_projet_de_fin_etude`.

- `03_office` (9 univers, 164 notes) : `wa1_wau_design`, `act_paysages_territoires`, `wa2_wau_design`, `ifa_ifadur`, `aet_aetc`, `dor_dorier`, `dts_downtown_studio`, `h3_hint3rland` (77 notes, le plus gros), `fpdn_fondation_portail_des_nations`.

- `04_academic` (3 univers, 220 notes) : `con_conferences`, `head` (193 notes), `iss_issues`.

- `05_various` (7 univers, 110 notes) : `fre_freelance`, `mag_magnetic`, `prg_progress`, `prp_productions_personnelles`, `tog_together`, `web3`, `wed_mariage_sg` (ajouté depuis septembre).

Autour des univers : `HOME.md` (navigation), `00_methodology/` (la constitution et la méthode d'apprentissage), `01_identite/` (27 notes : profil, CV, style, pédagogie), `02_people/` (189 fiches de personnes), `03_agent/` (documentation du système, dont ce dossier), `config/soul.md` (voix et règles de rédaction), `inbox/` (point d'entrée unique de la connaissance, avec les sous-dossiers `drive`, `mail`, `raw`, `processed`, `telegram`, `voice`, `web`), et `skills/`.

### 10.2 Règles de la constitution (résumé des obligations)

- Un seul point d'entrée logique : tout arrive dans `inbox/`, rien n'est créé directement dans un dossier de projet. L'agent trie après digestion, jamais avant.

- `inbox/raw/` n'est jamais modifié : la version brute est conservée comme couche géologique, une réécriture va dans `inbox/processed/`.

- Toute modification structurelle (renommage, changement de taxonomie) doit être répercutée partout : liens internes, fichiers `_INDEX`, index de carrière, constitution, comptages. Contrôle automatique : `rg` puis `/opt/data/scripts/audit_wikilinks.py`.

- Aucune invention de contenu. Si une source est absente ou illisible, on le dit et on cherche une autre édition, on ne comble pas.

- Nommage des fichiers en snake_case (underscore, jamais de tiret), préfixe de code pour les fichiers internes à un univers.

- Les liens entre notes sont des wikilinks `[[chemin/note]]`. Pour un humain, un lien vers le vault se donne toujours sous forme d'adresse GitHub cliquable, jamais sous forme de chemin de fichier.

### 10.3 Versionnement

Le vault est un dépôt Git (`/opt/data/vault`), poussé sur `ghelleu/hermes-vault` (privé), 589 commits depuis le 6 août 2026, 1 530 fichiers suivis, 1 258 notes markdown hors skills. Règle : `python3 /opt/data/scripts/vault_git.py pull` avant toute lecture, `push "message"` après toute écriture, en ne mettant en index que les fichiers touchés. Vérification du poussé : `git ls-remote origin main`. Aucun secret n'entre dans ce dépôt, il est lisible et consultable.

Les skills vivent dans ce dépôt (`vault/skills/`), atteints par le chemin `/opt/data/skills` qui est un lien symbolique. Conséquence : sauvegarder le vault sauvegarde aussi les compétences, et supprimer un fichier sous l'un des deux chemins le supprime sous l'autre.

### 10.4 Correspondance avec Drive

La matière première professionnelle vit dans Drive (`01 WORK > 01 PROJETS`, 27 dossiers : de `01 JEU - JEUNESSE` à `27 PROGRESS`). Le vault est la couche digérée et navigable. La digestion est faite par la persona Digest à partir du Drive, des courriels, des exports WhatsApp (dossier `11 HERMES > 09 WHATSAPP`, 130 archives) et des fichiers Figma via MCP.

## 11. Les sept tâches planifiées

Toutes sont dans `/opt/data/cron/jobs.json`, avec leurs journaux dans `/opt/data/cron/output/<identifiant>/`. État au 15 octobre 2026 : six actives, une en pause.

- Sauvegarde mémoire Hermes vers Google Drive (`8f403b4498a6`), tous les jours à 3 h UTC, script `backup-to-drive.sh` en mode sans agent. Produit l'archive nocturne et la copie de configuration, les dépose sur Drive, livre la sortie dans la conversation d'origine. C'est la tâche la plus importante du système : sa panne est silencieuse, voir la section 12. Dernier passage réussi le 15 octobre 2026 à 03 h 00.

- Miroir Obsidian vers Drive (`d473683bdfcc`), toutes les 180 minutes, script `obsidian_sync.py`. Recopie le vault en markdown lisible dans `11 HERMES > 04 OBSIDIAN`, pour consulter les notes sans l'agent. Dernier passage réussi le 15 octobre 2026 à 13 h 15.

- Rafraîchissement des jetons OAuth (`194c5b9cdd11`), toutes les 30 minutes, script `auto_refresh_tokens.py`, livraison dans le fil Telegram `16965`. Maintient les accès Google vivants et prévient en cas de rupture. En échec au 15 octobre 2026 : le jeton `hint3rland` est révoqué et la livraison Telegram de la tâche répond 401 (sections 9.1 et 15).

- Surveillance des alertes de sécurité Google (`b411607aaa21`), toutes les heures, script `google_security_monitor.py`. Détecte les alertes d'octroi d'accès et prévient avant la révocation en cascade. Dernier passage réussi le 15 octobre 2026 à 13 h 00.

- Veille agentique (`1c2007698eef`), chaque lundi à 7 h, script de collecte `veille_collect.py` puis passage d'agent avec le skill `veille-agentique`, chaînée à sa propre sortie précédente. Produit l'édition hebdomadaire (candidats collectés sans raisonnement, analyse faite par l'agent). Dernier passage réussi le 12 octobre 2026, prochain le 19 octobre.

- Réparation du tunnel Tailscale (`389ade52c1bb`), toutes les quinze minutes, script `tailscale_ensure.sh` en mode sans agent, livraison dans la conversation d'origine. Remet le démon Tailscale en route après un redéploiement, pour que le pont vers le Mac reste vivant (section 7.5). Dernier passage réussi le 15 octobre 2026 à 13 h 11.

- Pont Elio (`60254156653a`), toutes les cinq minutes, mode moniteur : le script `bridge_watch_elio.py` compare l'état du pont Drive et ne réveille l'agent que si quelque chose a changé. C'est ce qui rend l'échange avec l'agent du studio asynchrone et quasi instantané sans coût inutile. En pause depuis le 15 octobre 2026 (section 9.3).

## 12. Sauvegardes : ce qui existe, ce qui manque

### 12.1 Ce qui est sauvegardé, et où

Trois copies indépendantes.

- GitHub `ghelleu/hermes-vault` (privé) : le vault entier, notes, skills, miroir des mémoires (`03_agent/memories/MEMORY.md` et `USER.md`). Le jeton est porté par l'adresse du dépôt distant, donc le poussé fonctionne même si les jetons rangés dans `.env` sont révoqués.

- GitHub `ghelleu/hermes-railway` (privé) : le déploiement (Dockerfile, configuration, manifeste Railway). C'est ce qui permet à un tiers de comprendre et de reconstruire.

- Google Drive `11 HERMES` :

   - `02 SNAPSHOTS COMPLETS` : archive `tar.gz` quotidienne. Contrôle du 15 octobre 2026, trente archives présentes du 16 septembre au 15 octobre, tailles de 1 519,3 à 1 716,1 Mo, dernière déposée à 03 h 04. Contenu : `memories/`, `skills/`, `magnetic/`, `cron/`, `plans/`, `hooks/`, `scripts/`, `.hermes/`, `config.yaml`, `SOUL.md`, `state.db`. Le script conserve les trente dernières archives et les trente dernières copies de configuration.

   - `01 CONFIGS INFRASTRUCTURE` : copie de `config.yaml` à chaque exécution, 11 772 octets, trente conservées.

   - `04 OBSIDIAN` : miroir markdown du vault, huit sous-dossiers, rafraîchi toutes les trois heures.

   - `06 URGENCE` : dossier prévu pour les procédures d'urgence.

### 12.2 Ce qui n'est sauvegardé nulle part (à savoir avant d'en avoir besoin)

- `/opt/data/.env` : 21 variables, dont les clés Firecrawl, Anthropic, DeepSeek, MiniMax, Vercel, GitHub, le jeton du bot Telegram. Ce fichier prime sur les variables Railway et n'existe nulle part ailleurs. Remède : gestionnaire de mots de passe de Guillaume, jamais Git, jamais Drive.

- Les variables Railway elles-mêmes : aucun inventaire nulle part, à l'exception de `OPENROUTER_API_KEY`. Perdre le projet Railway sans inventaire, c'est perdre les clés qui n'y sont pas rangées à côté.

- `/opt/data/profiles/` : les mémoires et sessions propres aux profils `digest` et `facture`. L'archive nocturne ne prend que la racine.

- Les jetons MCP (`mcp-tokens/`) et les jetons OAuth Google : exclus volontairement, la reprise consiste à réautoriser, pas à restaurer un jeton expiré.

- Les accès au Mac : `/opt/data/mac_blender_mcp.env` (utilisateur, hôte, commande distante) et la clé SSH privée `/opt/data/.ssh/id_hermes_mac`. Sans eux, le pont vers Blender ne se refait pas, et rien ne les sauvegarde. À ranger avec les secrets.

- Le travail vivant hors vault : `wip/`, `web-projects/`, `web-deploy/`, les PDF de cours (`pop_pdfs`, `sil_pdfs`, `iah_pdfs`), `index.db` et `checkpoints/`. Une partie fait sans doute doublon avec Drive, mais ce n'est pas vérifié.

### 12.3 Règle de preuve

Vérifier l'artefact, jamais le journal. Un script qui affiche « terminé » ne prouve rien ; la preuve est le fichier daté et sa taille réelle. Une archive saine pèse entre 1,5 et 1,72 Go. Une archive de quelques kilo-octets signale l'échec silencieux connu : des copies lancées depuis un répertoire de travail arbitraire, neutralisées par un `|| true`, et `state.db` absent de la sauvegarde. Ce défaut a été corrigé le 20 août 2026 par un `cd /opt/data` en tête de script, mais la vérification de la taille reste la seule preuve.

La sauvegarde Git de `/opt/data` est désactivée depuis le 7 juillet 2026 et ne doit pas être réactivée en l'état : le dépôt distant d'alors était un dépôt Vercel, le `git add -A` avalait tout le volume, et le dépôt local avait gonflé à 14 Go sans jamais réussir à pousser. La vraie sauvegarde est l'archive Drive.

## 13. Reprise après sinistre

### 13.1 Les quatre scénarios

- L'agent répond mal, le volume est vivant. Le diagnostic se fait depuis l'intérieur : `hermes doctor`, lecture des journaux, contrôle de la base, inspection de la configuration. La réparation typique consiste à revenir en arrière sur les derniers fichiers modifiés (`checkpoints/`) ou à rejouer une configuration depuis les copies déposées sur Drive. Rien n'est perdu.

- Le volume est perdu ou corrompu. Un volume neuf est monté, le service redéploie depuis `hermes-railway`, les variables Railway sont intactes (sauf celles propres au volume, voir 14), et le contenu revient depuis la dernière archive Drive. À refaire à la main : les 21 variables du fichier `.env`, les accès au Mac (fichier d'identifiants et clé SSH), les autorisations Google, Figma et Tailscale, et le lien symbolique `skills/`.

- Le projet Railway est perdu en plus. Tout ce qui précède, plus la recréation du projet, du service et du volume, et la ressaisie intégrale des variables. C'est le seul scénario où une clé qui n'existe ni dans un gestionnaire de mots de passe ni ailleurs est définitivement perdue.

- On veut reconstruire ailleurs, sur une autre machine ou un autre hébergeur. Le cœur portable est : l'image épinglée, les deux dépôts Git, la dernière archive Drive, et la liste de variables. Aucune dépendance à Railway n'est nécessaire : n'importe quelle machine avec Docker et un disque persistant suffit.

### 13.2 Procédure de reconstruction complète (volume perdu)

- Créer le volume et le monter sur `/opt/data`. Sans ce point de montage, tout le reste est perdu au prochain redéploiement.

- Créer ou reconnecter le service depuis le dépôt `ghelleu/hermes-railway`, branche `main`. Le `Dockerfile` construit l'image sur la base `nousresearch/hermes-agent:v2026.9.24`.

- Saisir les variables de la section 14.1. Les valeurs viennent du gestionnaire de mots de passe. Les variables `RAILWAY_*` sont fournies automatiquement par la plateforme, ne pas les saisir.

- Déployer et attendre la fin de la construction, environ six minutes. Contrôle : les journaux doivent afficher une connexion Telegram en mode interrogation.

- Recréer le fichier `/opt/data/.env` (section 14.2). Il n'existe dans aucune sauvegarde et il prime sur les variables Railway du même nom. C'est l'étape qu'on oublie et qui donne un agent qui démarre mais perd la moitié de ses accès.

- Restaurer le vault : `git clone` du dépôt privé `ghelleu/hermes-vault` vers `/opt/data/vault`, puis recréer le lien symbolique `/opt/data/skills` vers `/opt/data/vault/skills`. Sans ce lien, les 148 skills locales n'existent plus pour l'agent.

- Restaurer la dernière archive Drive (`11 HERMES > 02 SNAPSHOTS COMPLETS`, fichier `hermes-backup-<date>_0300.tar.gz`) décompressée à la racine `/opt/data`. Elle ramène `state.db` (l'historique des conversations), `memories/`, `skills/`, `cron/` (les sept tâches planifiées et leurs identifiants), `scripts/`, `config.yaml` et `SOUL.md`.

- Restaurer la configuration depuis `11 HERMES > 01 CONFIGS INFRASTRUCTURE` si l'archive n'a pas suffi, et vérifier que `/opt/data/config.yaml` porte bien les réglages de la section 4 (modèle, auxiliaires, mémoire, Telegram).

- Réautoriser Google : régénérer les trois fichiers de jetons par la procédure OOB, avec les onze périmètres. Compter une validation manuelle de Guillaume (double authentification, un lien à ouvrir). Le jeton principal doit être nommé `google_token.json` et posé en lecture seule.

- Réautoriser Figma : relancer l'authentification OAuth du serveur MCP, ce qui recrée `/opt/data/mcp-tokens/`.

- Recréer les profils `digest` et `facture` s'ils ne sont pas revenus avec une sauvegarde de volume Railway, en restaurant leurs `SOUL.md` (dans le vault, `profiles/*/SOUL.md` sont versionnés à part) et leurs fils Telegram associés (8227 et 1063).

- Reconnecter le nœud Tailscale : le binaire vit sur le volume, mais un volume neuf n'a pas d'état de nœud. Relancer le démon en mode `userspace-networking` (le script `tailscale_ensure.sh` s'en charge), puis `tailscale up` avec une autorisation à valider par Guillaume. Le nom du nœud est `hermes-railway`.

- Recréer l'accès au Mac : ressaisir `/opt/data/mac_blender_mcp.env`, reposer la clé SSH privée en `/opt/data/.ssh/id_hermes_mac` (droits 600), vérifier la liaison avec `MAC_MCP_DIAG=1 bash /opt/data/scripts/mac_blender_mcp.sh`, et que `hermes mcp list` montre `blender` activé.

- Repasser les sept contrôles : `/opt/data/scripts/post_upgrade_controls.sh`. Puis vérifier les sept tâches planifiées (`hermes cron list`), la mémoire (`hermes memory status`), et le vault (`python3 /opt/data/scripts/vault_git.py pull`).

### 13.3 Reconstruire ailleurs, hors Railway

Le principe reste le même, seuls trois éléments changent.

- L'hébergement. À la place de Railway, n'importe quelle machine avec Docker : `docker run` de l'image épinglée, un volume monté sur `/opt/data`, les variables passées en environnement. Les variables `RAILWAY_*` disparaissent, tout le reste est identique. À défaut de Docker, Hermes s'installe nativement (script d'installation officiel) et l'on copie `config.yaml`, `skills/`, `vault/` et `.env`.

- Le démarrage. Hors Railway, il faut refaire les trois gestes du conteneur : propriété du volume, `HOME=/opt/data`, et exécution sous un utilisateur non privilégié. La passerelle refuse de tourner en root.

- Les tâches planifiées. Elles reviennent avec le dossier `cron/` de l'archive. Sans archive, elles se recréent à la main : chaque tâche est décrite en section 11, avec son script et sa cadence.

Attention à une règle absolue pendant toute migration : un seul agent peut utiliser un jeton de bot Telegram à la fois. Faire tourner l'ancien et le nouveau en parallèle avec le même jeton casse la réception des messages des deux côtés. Migrer signifie arrêter l'un avant de démarrer l'autre.

### 13.4 Un second chemin de reprise existe : l'agent de secours

Un second service Railway, `secours` (identifiant `f6a49b37-b541-4a0c-8279-03f24b0acf5b`), tourne dans le même projet avec son propre bot Telegram et ses propres variables (`SECOURS_BOT_TOKEN`, `RAILWAY_TARGET_SERVICE`, `TARGET_SERVICE_ID`, `SECOURS_MODEL`, `GOOGLE_TOKEN_JSON`). Son unique métier est de diagnostiquer et réparer l'agent principal par l'API Railway quand celui-ci ne répond plus : redéploiement, redémarrage, inspection, modification de variables, sauvegardes du volume. Sa méthode, ses interdits et son mode d'emploi vivent dans le skill `agent_de_secours` (dossier `devops` du vault), avec un runbook de pannes. C'est la capacité de réparation du système, indépendante de l'agent réparé.

### 13.5 Troisième filet : les sauvegardes de volume Railway

Le volume porte une programmation de sauvegarde propre, quotidienne à 08 h 14 UTC, conservation six jours. Au 28 septembre 2026, huit sauvegardes existaient, dont une sans date d'expiration (celle du 22 septembre, étendue 26,8 Go). Ce relevé n'a pas été refait le 15 octobre 2026 : la commande `backups` du script de l'agent de secours le donne. Ces sauvegardes couvrent tout le volume, y compris les dossiers que l'archive Drive ignore (`profiles/`, `wip/`, `web-projects/`). Elles se consultent et se restaurent par l'API Railway (commande `backups` du script de l'agent de secours) et ne consomment que l'espace des blocs modifiés.

## 14. Inventaire des variables et des secrets

### 14.1 Déclarées dans Railway, service `hermes-railway` (25)

Fournies par la plateforme, à ne pas saisir : `RAILWAY_ENVIRONMENT`, `RAILWAY_ENVIRONMENT_ID`, `RAILWAY_ENVIRONMENT_NAME`, `RAILWAY_PRIVATE_DOMAIN`, `RAILWAY_PROJECT_ID`, `RAILWAY_PROJECT_NAME`, `RAILWAY_PROJECT_TOKEN`, `RAILWAY_SERVICE_ID`, `RAILWAY_SERVICE_NAME`, `RAILWAY_VOLUME_ID`, `RAILWAY_VOLUME_MOUNT_PATH`, `RAILWAY_VOLUME_NAME`, plus `PYTHONPATH`.

À saisir à la main, seule liste à conserver hors du système : `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `MINIMAX_API_KEY`, `OPENROUTER_API_KEY`, `GITHUB_NEW_TOKEN`, `SUPABASE_URL`, `SUPABASE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`, `TELEGRAM_HOME_CHANNEL`, `SECOURS_BOT_TOKEN`.

### 14.2 Présentes dans `/opt/data/.env` sur le volume (21)

Le fichier fait 482 lignes, dont 394 de commentaires, pour 21 variables réelles. Elles sont chargées avec priorité sur celles de Railway : en cas de divergence, c'est le fichier du volume qui gagne, sauf pour les secrets que le démarrage reconstruit depuis Railway (section 3.1).

Deux autres fichiers portent des secrets hors de `.env` : `/opt/data/mac_blender_mcp.env` (11 lignes, accès au Mac) et la clé SSH privée `/opt/data/.ssh/id_hermes_mac`.

- Fournisseurs : `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `MINIMAX_API_KEY`.

- Web et publication : `FIRECRAWL_API_KEY`, `VERCEL_TOKEN`.

- Dépôts : `GITHUB_NEW_TOKEN`.

- Navigation : `BROWSERBASE_PROXIES`, `BROWSERBASE_ADVANCED_STEALTH`, `BROWSER_SESSION_TIMEOUT`, `BROWSER_INACTIVITY_TIMEOUT`.

- Messagerie : `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`, `GATEWAY_ALLOWED_USERS`.

- Terminal : `TERMINAL_MODAL_IMAGE`, `TERMINAL_TIMEOUT`, `TERMINAL_LIFETIME_SECONDS`.

- Diagnostic : `WEB_TOOLS_DEBUG`, `VISION_TOOLS_DEBUG`, `MOA_TOOLS_DEBUG`, `IMAGE_TOOLS_DEBUG`.

### 14.3 Service `secours` (23)

Mêmes clés de fournisseurs, plus `GATEWAY_ALLOWED_USERS`, `GOOGLE_TOKEN_JSON` (une copie de jeton Google rangée directement en variable), `RAILWAY_TARGET_SERVICE`, `TARGET_SERVICE_ID`, `SECOURS_MODEL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`, `TELEGRAM_HOME_CHANNEL`.

### 14.4 Secrets absents de toute sauvegarde, à conserver dans un gestionnaire de mots de passe

Les clés Anthropic, DeepSeek, MiniMax, OpenRouter, Firecrawl, Vercel, GitHub, le jeton du bot Telegram principal, le jeton du bot de secours, la paire Supabase, l'accès au projet Google Cloud qui porte l'identifiant client OAuth (sans lui, aucune réautorisation n'est possible), et l'accès au Mac, c'est-à-dire la clé SSH privée `/opt/data/.ssh/id_hermes_mac` avec le contenu de `/opt/data/mac_blender_mcp.env`. L'accès au projet Google Cloud est la pièce la plus facile à oublier et la plus difficile à reconstituer.

## 15. Points de fragilité et dettes connues

- WhatsApp n'est pas appairé. Le pont est installé et prêt, l'adaptateur est dans l'image, mais aucun numéro n'est lié. Tant que ce n'est pas fait, tout ce qui s'appuie dessus est théorique.

- Un document de clés dort dans Drive. `11 HERMES > 03 SECRETS TOKENS` contient « Clés API & Mots de passe Hermes » (6 août 2026). Le vault est consultable et le Drive aussi : la place d'un secret est un gestionnaire de mots de passe, pas un dossier partagé. À arbitrer par Guillaume (transfert puis suppression du document).

- Le fichier `.env` du volume n'est sauvegardé nulle part et il prime sur Railway. Une perte de volume perd ces vingt et une valeurs si elles n'existent pas ailleurs. Depuis le 2 octobre 2026, le démarrage en reconstitue une partie depuis les variables Railway (section 3.1), ce qui couvre les secrets les plus critiques mais pas Firecrawl, Vercel ni les délais du navigateur.

- Les variables Railway n'ont aucun inventaire écrit hors de ce document, qui n'en donne que les noms. Une capture d'écran de l'onglet Variables, datée et rangée avec ce dossier, fermerait le trou.

- Les profils `digest` et `facture` ne sont pas dans l'archive Drive (mémoires et sessions propres, 9,0 Mo et 508 Ko). Ils le sont en revanche dans les sauvegardes de volume Railway, chaque jour à 08 h 14 UTC avec six jours de conservation.

- Le poste de coût se déplace. 53,61 dollars estimés sur trente jours au 14 octobre 2026. Deux sessions `claude-opus-5-5` (29,7 M jetons) pèsent à elles seules plus que les trente-deux sessions Haiku. La mesure de l'économie attendue du basculement vers `openai/gpt-6-luna` (28 septembre 2026) reste à faire.

- Erreur réseau Telegram récurrente. Observée les 20, 22, 24, 25 et 26 septembre 2026 autour de 01 h 11 UTC, puis encore le 15 octobre 2026 à 10 h 01 et 10 h 37, avec des avertissements du type « Sticky Telegram path failed ; re-walking IPv4 literals » et des sockets en attente de fermeture. Rien n'est perdu, la passerelle se reconnecte et retente les adresses, mais le motif n'est pas expliqué.

- Bases héritées : `index.db` (148 Mo, arrêtée le 4 août 2026), `index_clean.db`, `index.db-wal`. Elles ne servent plus mais occupent de la place. Nettoyage à faire avec précaution et sauvegarde préalable.

- Dérive de nommage dans les scripts : la sauvegarde nocturne écrit vers un dossier nommé `11 AGENTIC` dans ses commentaires, alors que le dossier réel s'appelle `11 HERMES`. Le comportement est correct (les identifiants sont utilisés, pas les noms), mais la documentation interne est trompeuse.

- Le vault est en lecture seule pour les outils de fichier. Ils refusent d'écrire dans `/opt/data/vault` (protection de type coffre). Toute écriture dans le vault passe par le terminal, puis par un commit scoped. À savoir pour ne pas croire à une panne de droits.

- Un seul bot Telegram par jeton : toute migration ou tout test doit arrêter l'instance précédente, sinon les deux se disputent les messages.

- Le jeton Google `hint3rland` est révoqué. Cinquante et un échecs consécutifs de la tâche de rafraîchissement au 15 octobre 2026, et une livraison Telegram en 401 sur cette même tâche. Tant que la réautorisation n'est pas faite, la tâche reste bruyante sans rien apporter.

- Le pont vers Elio est en pause, pas réparé. Sa passerelle Drive répond 400 sur le rafraîchissement de son jeton. Réactiver la tâche sans refaire ce jeton relancera les mêmes échecs toutes les cinq minutes.

- Les instantanés de fichiers sont près du plafond. `checkpoints/` occupe 476 Mo sur un plafond de 500 Mo, avec vingt instantanés au maximum et sept jours de conservation.

- La génération de médias dépend d'un outil externe. La règle veut que tout passe par Dadaland (section 9.4), dont l'accès MCP n'est pas encore branché. Tant qu'il ne l'est pas, une demande d'image se solde par un prompt remis à Guillaume.

- Ce dossier se périme. La source qui fait foi est la note du vault `03_agent/hermes_architecture_handover.md` ; la version Google Docs n'en est qu'une copie datée. Toute modification structurelle doit être répercutée dans les deux, sinon cette section devient elle-même un point de fragilité.

## 16. Chronologie de construction

- 2 juin 2026 : premier audit d'infrastructure documenté ; le volume pèse 4,6 Go, `state.db` 19 Mo, 23 sessions, 1 792 messages.

- 7 juillet 2026 : sauvegarde Git de `/opt/data` désactivée (dépôt distant inadapté, gonflement à 14 Go). La sauvegarde devient l'archive Drive.

- 6 août 2026 : création du vault actuel, premier commit, 69 notes en quatre dossiers. La configuration, `soul.md` et les personnalités par fil entrent dans le vault.

- 7 août 2026 : constitution du second brain validée (pipeline inbox, cinq catégories, 27 univers). Cartographie des skills produite.

- 4 août 2026 : remise à zéro stricte du vault ; l'ancien vault de 4 877 notes part en archive et ne doit jamais être remigré.

- 20 août 2026 : correction du script de sauvegarde qui produisait des archives de 4 Ko sans `state.db` (copies lancées depuis un mauvais répertoire, erreurs masquées).

- 22 septembre 2026 : mémoire longue « holographique » mise en service ; l'agent de secours est testé et corrigé (il diagnostiquait son propre conteneur au lieu de l'agent principal) ; sauvegarde de volume sans expiration créée.

- 24 septembre 2026 : sortie de la version v0.21.5 (étiquette `v2026.9.24`).

- 28 septembre 2026 : montée en v0.21.5, image épinglée dans le `Dockerfile` (fin du `latest`), contrôles passés ; bascule des tâches auxiliaires titre et compression vers `openai/gpt-6-luna` via OpenRouter, avec repli Haiku ; rédaction du présent dossier.

- 28 septembre 2026 (soirée) : mise en place du pont Tailscale vers le MacBook et du serveur MCP Blender ; abandon du tunnel Cloudflare sortant, dont le port 7844 est bloqué par le réseau de Guillaume.

- 21 septembre 2026 : panne de cinq heures. Une valeur non résolue dans le fichier d'environnement avait vidé l'autorisation Telegram ; c'est l'origine du script d'entretien du fichier au démarrage (section 3.1).

- 2 octobre 2026 : reconnaissance vocale passée au modèle `large-v3` en français, voix de synthèse passée à `fr-FR-DeniseNeural` ; commande de démarrage personnalisée avec entretien du fichier d'environnement ; déploiement `761c3e6b`.

- 12 octobre 2026 : arbitrage rédactionnel de Guillaume. L'antithèse, la règle de trois et la tournure « ni… ni… mais… » sont proscrites de tout texte produit, y compris quand les travaux antérieurs les montrent.

- 15 octobre 2026 : mise à jour du présent dossier, refaite sur le système en marche. Sept tâches planifiées, pont Elio suspendu, jeton `hint3rland` révoqué, génération de médias confiée à Dadaland.

## 17. Annexes

### 17.1 Commandes d'audit en lecture seule

- Taille et répartition du volume : `du -sh /opt/data/* | sort -rh | head -25`

- Nature de chaque dossier : `for d in /opt/data /opt/data/vault /opt/hermes; do printf '%s ' "$d"; git -C "$d" remote get-url origin 2>/dev/null || echo "pas un depot"; done`

- Ce que GitHub garde vraiment : `git -C /opt/data/vault ls-files | wc -l`

- État de la base de sessions : `/opt/hermes/.venv/bin/python3 -c "import sqlite3;c=sqlite3.connect('file:/opt/data/state.db?mode=ro',uri=True);print(c.execute('pragma quick_check').fetchone())"`

- Tâches planifiées : `/opt/hermes/.venv/bin/hermes cron list`

- Mémoire : `/opt/hermes/.venv/bin/hermes memory status`

- Serveurs MCP : `/opt/hermes/.venv/bin/hermes mcp list`

- État du tailnet et des deux nœuds : `/opt/data/bin/tailscale --socket=/opt/data/tailscale/tailscaled.sock status`

- Consommation et coût sur trente jours : `/opt/hermes/.venv/bin/hermes insights`

- Profils : `/opt/hermes/.venv/bin/hermes profile list`

- Contrôles après déploiement : `bash /opt/data/scripts/post_upgrade_controls.sh`

- Diagnostic Railway de l'agent principal : `/opt/hermes/.venv/bin/python3 /opt/data/vault/skills/devops/agent_de_secours/scripts/railway_api.py doctor --service hermes-railway`

- Preuve de sauvegarde côté Drive : lister `02 SNAPSHOTS COMPLETS` et vérifier qu'une archive du jour pèse environ 1,7 Go (voir le script d'appel dans le skill `hermes_deployment_layout`, référence `backup-and-restore-map.md`).

- Aucune de ces commandes n'écrit : elles se contentent de lire l'état du système.

### 17.2 Les scripts qui comptent

Sur les 113 fichiers de `/opt/data/scripts`, ceux qui structurent le système :

- `vault_git.py` : synchronisation du vault (pull avant lecture, commit et push après écriture).

- `backup-to-drive.sh` et `backup-to-drive-impl.sh` : l'archive nocturne vers Drive.

- `obsidian_sync.py` : le miroir lisible du vault.

- `auto_refresh_tokens.py` : maintien des jetons Google.

- `google_security_monitor.py` : alerte avant révocation des accès.

- `veille_collect.py` et `veille_mark.py` : collecte de la veille du lundi.

- `bridge_watch_elio.py` : surveillance du pont vers l'agent du studio.

- `bridge_drive.py` (dans le vault, dossier du skill `agent_bridge_elio`) : protocole d'échange entre agents.

- `token_manager.py` : accès unifié aux comptes Google (Drive, Gmail, Sheets, Docs, Calendar).

- `post_upgrade_controls.sh` : les cinq contrôles d'après déploiement.

- `emergency-restore.sh` : procédure de récupération d'urgence.

- `railway_api.py` (dans le vault, dossier du skill `agent_de_secours`) : accès Railway pour l'agent de secours.

- `whatsapp-bridge/bridge.js` : le pont WhatsApp, non appairé.

- `audit_wikilinks.py` : cohérence des liens internes du vault après toute modification structurelle.

- `tailscale_ensure.sh` : réparation idempotente du démon Tailscale, appelée en pré-vol par la passerelle MCP et par la tâche planifiée du quart d'heure.

- `mac_blender_mcp.sh` : passerelle MCP stdio vers le serveur Blender du Mac (section 7.5).

- `socks_proxycmd.py` : relais SOCKS5 qui fait passer le SSH par le tailnet.

- `start_main.py` (dans le vault, dossier du skill `agent_de_secours`) : entretien du fichier d'environnement au démarrage (section 3.1).

- `sync_tracker.py` : synchronisation du tracker des tâches à faire avec sa feuille Google.

- `figma_mcp_call.py` : appel direct au serveur Figma, hors du chemin MCP standard.

### 17.3 Ce que ce dossier ne remplace pas

Ce document décrit l'architecture, pas les données. Pour repartir de zéro, il faut trois choses en plus : la dernière archive Drive (les données), un gestionnaire de mots de passe à jour (les secrets), et l'accès aux deux dépôts GitHub privés (le code et la connaissance). Avec ces trois éléments et ce dossier, la reconstruction est complète.

