/*
  DONNÉES DU DASHBOARD — seul fichier à modifier pour changer le contenu.

  Tout ce qui suit le signe « = » est du JSON pur : guillemets doubles,
  pas de virgule finale, pas de commentaire à l'intérieur.
  Ce fichier est un .js (et non un .json) pour une seule raison : Chrome
  interdit à une page ouverte par double-clic de lire un fichier .json voisin.

  Source unique : architecture.md (dossier de passation, maj 15 octobre 2026).
  Chaque bloc, lien et étape porte le numéro de section dont il vient.
*/
window.DONNEES = {
  "meta": {
    "titre": "Hermes Atlas",
    "surtitre": "Architecture agentique",
    "sousTitre": "Suivre un message de Telegram jusqu'à ses effets mesurables",
    "source": "architecture.md, dossier de passation, mise à jour du 15 octobre 2026",
    "sourceCourte": "architecture.md (15 octobre 2026)"
  },

  "monolithe": {
    "surtitre": "Un seul programme",
    "titre": "Hermes Agent v0.21.5",
    "ligne": "un conteneur Docker chez Railway, région sfo, en continu",
    "citation": "« parler, se souvenir, exécuter, et se réveiller tout seul »",
    "source": "1"
  },

  "couches": [
    { "id": "entrees",     "num": 1, "nom": "Entrées",          "nomLong": "Entrées : là où l'humain parle",                        "source": "6.1, 7.6",        "annexe": false },
    { "id": "reception",   "num": 2, "nom": "Réception",        "nomLong": "Réception et assemblage du contexte",                  "source": "4, 6.1, 10.1",    "annexe": false },
    { "id": "orchestre",   "num": 3, "nom": "Orchestrateur",    "nomLong": "Orchestrateur : la boucle qui décide",                 "source": "1, 4, 7.1",       "annexe": false },
    { "id": "outils",      "num": 4, "nom": "Outils directs",   "nomLong": "Outils directs : ce que l'agent fait lui-même",        "source": "7.1",             "annexe": false },
    { "id": "sousagents",  "num": 5, "nom": "Sous-agents",      "nomLong": "Sous-agents : le travail délégué",                     "source": "4",               "annexe": false },
    { "id": "mcp",         "num": 6, "nom": "Connecteurs MCP",  "nomLong": "Connecteurs MCP : les serveurs d'outils externes",     "source": "7.2, 7.5, 9.4",   "annexe": false },
    { "id": "memoire",     "num": 7, "nom": "Mémoire",          "nomLong": "Mémoire et connaissance",                              "source": "8, 10",           "annexe": false },
    { "id": "deploiement", "num": 8, "nom": "Déploiement",      "nomLong": "Déploiement et souveraineté : où ça tourne, qui répare", "source": "2, 11, 12, 13.4", "annexe": true },
    { "id": "sorties",     "num": 9, "nom": "Sorties",          "nomLong": "Sorties : les effets mesurables",                      "source": "6.1, 9.1, 9.4",   "annexe": false }
  ],

  "statuts": {
    "actif":          { "nom": "Actif" },
    "non-branche":    { "nom": "Non branché" },
    "panne":          { "nom": "En panne" },
    "pause":          { "nom": "En pause" },
    "hors-perimetre": { "nom": "Hors périmètre" }
  },

  "typesLiens": [
    { "id": "evt",   "nom": "Message entrant",     "description": "Événement Telegram : message, mémo vocal ou réponse. Trait plein épais et animé, sens unique.", "fleche": "fin",    "anime": true },
    { "id": "ctx",   "nom": "Contexte injecté",    "description": "Fichier lu pour construire la requête envoyée au modèle. Tirets fins, flèche vers l'orchestrateur.", "fleche": "fin" },
    { "id": "outil", "nom": "Appel d'outil",       "description": "Appel interne puis résultat. Trait plein fin, double flèche.", "fleche": "double" },
    { "id": "stdio", "nom": "MCP stdio local",     "description": "Transport MCP par processus local (entrée et sortie standard). Tirets longs.", "fleche": "double" },
    { "id": "http",  "nom": "MCP HTTP + OAuth",    "description": "Transport MCP vers un serveur distant, authentifié par OAuth. Tiret-point.", "fleche": "double" },
    { "id": "ssh",   "nom": "MCP SSH tailnet",     "description": "Transport MCP qui traverse le tailnet en SSH jusqu'au Mac. Tiret-point-point.", "fleche": "double" },
    { "id": "data",  "nom": "Lecture / écriture",  "description": "Lecture ou écriture de données : volume, base SQLite, Drive. Pointillé fin.", "fleche": "fin" },
    { "id": "git",   "nom": "Git · déploiement",   "description": "push, reconstruction de l'image, redéploiement. Double rail.", "fleche": "fin" },
    { "id": "cout",  "nom": "Coût · latence",      "description": "Lien qui porte une valeur chiffrée (coût, durée). Étiquette toujours visible.", "fleche": "fin" },
    { "id": "off",   "nom": "Hors service",        "description": "Flux en panne, en pause ou non branché. Rouge discontinu, marqué d'une croix.", "fleche": "fin" }
  ],

  "blocs": [
    {
      "id": "tg", "couche": "entrees", "titre": "Telegram", "chiffre": "@eiryn_bot", "statut": "actif",
      "machine": "Service distant Telegram",
      "fait": "Seule plateforme active. Deux chats autorisés : 8333583307 (le canal personnel « Home ») et -1003930058551 (le groupe de travail). Le groupe porte des sujets : 121 travail courant, 8227 digestion, 1063 facturation, 16965 livraison du rafraîchissement des jetons Google.",
      "entre": "Les messages de Guillaume, en texte ou en voix.",
      "sort": "Des mises à jour récupérées par la passerelle en interrogation continue (polling, pas de webhook).",
      "cout": "Non précisé dans le document.",
      "casse": "Plus aucune entrée : l'agent ne reçoit plus rien. Un seul agent peut utiliser le jeton du bot à la fois (13.3).",
      "source": "6.1",
      "preuve": { "titre": "Configuration Telegram", "source": "6.1",
        "lignes": ["telegram.allowed_chats = 8333583307, -1003930058551", "fil 8227 → /opt/data/profiles/digest/SOUL.md", "fil 1063 → /opt/data/profiles/facture/SOUL.md"] }
    },
    {
      "id": "memo", "couche": "entrees", "titre": "Mémo vocal", "chiffre": "fil 121", "statut": "actif",
      "machine": "Téléphone de Guillaume, application Telegram",
      "fait": "Message vocal envoyé dans un fil Telegram. L'échange vocal fonctionne dans les deux sens, et rien ne sort du système.",
      "entre": "La voix de Guillaume.",
      "sort": "Un fichier audio transmis à la passerelle.",
      "cout": "La transcription locale est gratuite (7.6).",
      "casse": "Rien de bloquant : le texte reste possible.",
      "source": "7.6",
      "preuve": { "titre": "Commandes du mode vocal", "source": "7.6",
        "lignes": ["/voice on", "/voice tts", "/voice off", "/voice status"] }
    },
    {
      "id": "desk", "couche": "entrees", "titre": "Client de bureau", "chiffre": "hors périmètre", "statut": "hors-perimetre", "annexe": true,
      "machine": "Poste de travail",
      "fait": "Le plein duplex vocal reste réservé au client de bureau. Il ne fait pas partie du parcours étudié ici.",
      "entre": "Non précisé dans le document.",
      "sort": "Non précisé dans le document.",
      "cout": "Mode vocal du client de bureau : 0,05 dollar la minute.",
      "casse": "Rien pour le parcours Telegram.",
      "source": "7.6",
      "preuve": { "titre": "Comparaison des coûts vocaux", "source": "7.6",
        "lignes": ["Transcription locale : gratuite", "whisper-1 chez OpenAI : 0,006 $ / minute", "Mode vocal du client de bureau : 0,05 $ / minute"] }
    },
    {
      "id": "wa", "couche": "entrees", "titre": "WhatsApp", "chiffre": "non appairé", "statut": "non-branche",
      "machine": "Volume /opt/data (pont Node.js « Baileys »)",
      "fait": "Adaptateur présent dans l'image, pont « Baileys » installé sur le volume. Aucun appairage : pas de fichier d'identifiants, pas de processus en écoute.",
      "entre": "Rien aujourd'hui.",
      "sort": "Rien aujourd'hui.",
      "cout": "Mode bot chiffré le 28 septembre 2026 : environ 1 dollar par mois d'infrastructure, puis 0,031 dollar par message entrant.",
      "casse": "Rien : la plateforme n'est pas branchée. Tout ce qui s'appuie dessus reste théorique (15).",
      "source": "6.3",
      "preuve": { "titre": "État du pont WhatsApp", "source": "6.3",
        "lignes": ["/opt/data/scripts/whatsapp-bridge/bridge.js (28 101 octets)", "node_modules : 57,9 Mo, installés le 28 septembre 2026", "État : aucun appairage"] }
    },

    {
      "id": "gw", "couche": "reception", "titre": "Passerelle", "chiffre": "polling · sfo", "statut": "actif",
      "machine": "Conteneur Docker chez Railway, région sfo (San Francisco)",
      "fait": "Le programme « hermes gateway run ». Il reçoit les messages Telegram et sert tous les profils dans un seul processus. Il refuse de tourner en root : il tourne sous l'utilisateur hermes (uid 10000).",
      "entre": "Messages texte et fichiers audio venus de Telegram.",
      "sort": "La demande vers l'orchestrateur ; l'audio vers la transcription.",
      "cout": "Non précisé dans le document.",
      "casse": "L'agent devient muet. Le 21 septembre 2026, une valeur non résolue dans .env a vidé l'autorisation Telegram : cinq heures de panne (3.1).",
      "source": "2.1, 3.1, 6.1",
      "preuve": { "titre": "Démarrage du service", "source": "2.1, 3",
        "lignes": ["start_main.py --apply  puis  exec hermes gateway run", "image nousresearch/hermes-agent:v2026.9.24 (Hermes Agent v0.21.5)", "gateway.multiplex_profiles = vrai"] }
    },
    {
      "id": "stt", "couche": "reception", "titre": "Transcription", "chiffre": "large-v3 · fr", "statut": "actif",
      "machine": "Conteneur Railway (sfo), modèle gardé en cache sur le volume",
      "fait": "Reconnaissance vocale locale : moteur faster-whisper, modèle large-v3, langue forcée en français.",
      "entre": "Le fichier audio du mémo.",
      "sort": "Le texte transcrit, en français.",
      "cout": "Gratuit, car local. Mesure publiée : un mémo de 8 secondes se transcrit en une dizaine de secondes, chargement du modèle compris.",
      "casse": "Les mémos vocaux ne sont plus compris ; le texte reste possible. Limite connue : les noms propres dérivent (Tour des Possibles, Magnetic, Geneva Lux).",
      "source": "7.6",
      "preuve": { "titre": "Réglage et mesure", "source": "4, 7.6",
        "lignes": ["stt : faster-whisper · large-v3 · langue fr", "modèle : 3,1 Go dans /opt/data/.cache/huggingface/", "mesure : mémo de 8 s → une dizaine de secondes"] }
    },
    {
      "id": "soul", "couche": "reception", "titre": "config/soul.md", "chiffre": "voix et règles", "statut": "actif",
      "machine": "Volume /opt/data, dans le vault Git",
      "fait": "Le fichier qui porte la voix de l'agent et ses règles de rédaction.",
      "entre": "Lu depuis le vault.",
      "sort": "Injecté dans la requête envoyée au modèle.",
      "cout": "Non précisé dans le document.",
      "casse": "L'agent perd sa voix et ses règles d'écriture.",
      "source": "10.1, 16",
      "preuve": { "titre": "Règle de rédaction du 12 octobre 2026", "source": "16",
        "lignes": ["Proscrites de tout texte produit :", "· l'antithèse", "· la règle de trois", "· la tournure « ni… ni… mais… »"],
        "note": "Le document source ne cite pas le contenu de soul.md. Cette règle vient de l'arbitrage rédactionnel consigné en section 16." }
    },
    {
      "id": "mem", "couche": "reception", "titre": "Mémoire injectée", "chiffre": "MEMORY · USER", "statut": "actif",
      "mesure": { "titre": "Remplissage de la mémoire injectée (28 septembre 2026)", "source": "8", "unite": "%", "max": 100, "segments": [ { "l": "plein", "v": 99 } ] },
      "machine": "Volume /opt/data/memories/",
      "fait": "MEMORY.md (mémoire de l'agent) et USER.md (profil de Guillaume), rechargés à chaque tour, avant même la première question. Au 28 septembre 2026, la mémoire est pleine à 99 % : toute addition exige de condenser.",
      "entre": "Les écritures de l'outil mémoire.",
      "sort": "Une injection dans chaque tour de conversation.",
      "cout": "Non précisé dans le document.",
      "casse": "L'agent oublie le profil de Guillaume et ses faits durables.",
      "source": "8, 4",
      "preuve": { "titre": "Plafonds", "source": "4, 8",
        "lignes": ["memory_char_limit = 5000", "memory.user_char_limit = 3000", "miroir versionné : vault 03_agent/memories/"] }
    },
    {
      "id": "persona", "couche": "reception", "titre": "Personas par fil", "chiffre": "fils 8227 · 1063", "statut": "actif",
      "machine": "Volume /opt/data/profiles/",
      "fait": "telegram.channel_prompts : le fil 8227 charge la persona Digest (curateur de connaissance), le fil 1063 la persona Facture (factures freelance).",
      "entre": "L'identifiant du fil Telegram.",
      "sort": "Le fichier d'âme du profil, injecté dans la requête.",
      "cout": "Non précisé dans le document.",
      "casse": "Les fils de digestion et de facturation répondent avec la voix par défaut. Les profils ne sont pas dans l'archive Drive (12.2).",
      "source": "6.1, 6.2",
      "preuve": { "titre": "Profils", "source": "6.2",
        "lignes": ["digest : 9,0 Mo", "facture : 508 Ko", "coquilles vides : head, magnetic, pdn, hermes"] }
    },
    {
      "id": "skills", "couche": "reception", "titre": "Skills", "chiffre": "159 actives", "statut": "actif",
      "mesure": { "titre": "Origine des 159 skills actives", "source": "8", "unite": "skills", "segments": [ { "l": "locales", "v": 148 }, { "l": "fournies par l'image", "v": 11 } ] },
      "machine": "Volume : vault/skills/, atteint par le lien /opt/data/skills",
      "fait": "Mémoire procédurale. Un skill est un mode d'emploi que l'agent écrit après avoir résolu un problème, et qui se recharge quand le sujet revient.",
      "entre": "Le sujet de la demande.",
      "sort": "Le skill pertinent, ajouté au contexte.",
      "cout": "Non précisé dans le document.",
      "casse": "Sans le lien symbolique skills/ → vault/skills/, les 148 skills locales n'existent plus pour l'agent (13.2).",
      "source": "8, 10.3",
      "preuve": { "titre": "Inventaire", "source": "8",
        "lignes": ["159 actives : 148 locales + 11 fournies par l'image", "39 dossiers de catégorie, 495 fichiers markdown", "/opt/data/skills → /opt/data/vault/skills"] }
    },
    {
      "id": "hist", "couche": "reception", "titre": "Historique", "chiffre": "9 597 sessions", "statut": "actif",
      "machine": "Conteneur Railway, lecture de state.db sur le volume",
      "fait": "Retrouve un échange précis du passé grâce à l'index plein texte de la base des sessions.",
      "entre": "Une requête de recherche.",
      "sort": "Des extraits d'échanges passés.",
      "cout": "Non précisé dans le document.",
      "casse": "L'agent ne retrouve plus les conversations passées.",
      "source": "8",
      "preuve": { "titre": "Base des sessions", "source": "4, 8",
        "lignes": ["index plein texte : messages_fts", "9 597 sessions · 301 927 messages", "session_reset.mode = none"] }
    },

    {
      "id": "loop", "couche": "orchestre", "titre": "Boucle principale", "chiffre": "deepseek-flash", "statut": "actif", "pivot": true,
      "mesure": { "titre": "Jetons traités sur 30 jours, par modèle", "source": "5.3", "unite": "M jetons", "segments": [ { "l": "deepseek-flash", "v": 1004.5 }, { "l": "claude-haiku-4-5", "v": 30.6 }, { "l": "claude-opus-5-5", "v": 29.7 } ] },
      "machine": "Conteneur Railway ; modèle appelé chez DeepSeek (https://api.deepseek.com)",
      "fait": "Lit la demande, décide d'appeler un outil, de déléguer ou de répondre. Deux replis en cascade si le fournisseur est indisponible.",
      "entre": "La requête assemblée : message, soul.md, mémoire, skills, historique.",
      "sort": "Des appels d'outils, des délégations, une réponse.",
      "cout": "Sur 30 jours (16 septembre → 14 octobre 2026) : 1,064 milliard de jetons traités, coût estimé 53,61 dollars. deepseek-flash : 1 004,5 M jetons sur 57 sessions.",
      "casse": "Plus de raisonnement sur le modèle principal : bascule sur claude-sonnet-4-6, puis sur MiniMax-M3.",
      "source": "4, 5.1, 5.3",
      "preuve": { "titre": "Configuration du modèle", "source": "4",
        "lignes": ["model.default = deepseek-flash", "fallback_providers = claude-sonnet-4-6, MiniMax-M3", "agent.reasoning_effort = medium"] }
    },
    {
      "id": "turns", "couche": "orchestre", "titre": "Plafond de tours", "chiffre": "1 000 tours", "statut": "actif",
      "machine": "Conteneur Railway, réglage dans /opt/data/config.yaml",
      "fait": "Nombre maximal de tours pour une boucle d'agent.",
      "entre": "Non précisé dans le document.",
      "sort": "Non précisé dans le document.",
      "cout": "Non précisé dans le document.",
      "casse": "Non précisé dans le document.",
      "source": "4",
      "preuve": { "titre": "Réglage", "source": "4",
        "lignes": ["agent.max_turns = 1000", "agent.tool_use_enforcement = auto"] }
    },
    {
      "id": "comp", "couche": "orchestre", "titre": "Compression", "chiffre": "0,50 → 0,20", "statut": "actif",
      "machine": "Conteneur Railway ; modèle openai/gpt-6-luna via OpenRouter",
      "fait": "Compresse le contexte quand il atteint la moitié de la fenêtre, vers 20 %, en protégeant les 3 premiers et les 20 derniers messages.",
      "entre": "Le contexte de la conversation.",
      "sort": "Un contexte compressé.",
      "cout": "openai/gpt-6-luna : 0,10 dollar par million de jetons en entrée, 0,50 en sortie, 0,01 en lecture de cache. Repli : claude-haiku-4-5.",
      "casse": "Non précisé dans le document.",
      "source": "4, 5.1",
      "preuve": { "titre": "Réglages", "source": "4",
        "lignes": ["compression.threshold = 0,50", "compression.target_ratio = 0,20", "protect_first_n = 3 · protect_last_n = 20"] }
    },
    {
      "id": "ckpt", "couche": "orchestre", "titre": "Instantanés", "chiffre": "476 / 500 Mo", "statut": "actif",
      "mesure": { "titre": "Occupation des instantanés", "source": "2.2, 4", "unite": "Mo", "max": 500, "segments": [ { "l": "occupé", "v": 476 } ] },
      "machine": "Volume /opt/data/checkpoints/",
      "fait": "Instantané d'un fichier, pris par l'agent avant chaque modification. Sert à revenir en arrière.",
      "entre": "Le fichier avant modification.",
      "sort": "Une copie datée, conservée sept jours.",
      "cout": "476 Mo occupés sur un plafond de 500 Mo : la marge est mince (15).",
      "casse": "Plus de retour en arrière possible sur les fichiers modifiés (13.1).",
      "source": "2.2, 4, 15",
      "preuve": { "titre": "Réglages et occupation", "source": "4",
        "lignes": ["checkpoints.max_snapshots = 20", "retention_days = 7 · min_interval_hours = 24", "occupé : 476 Mo sur 500 Mo au 15 octobre 2026"] }
    },
    {
      "id": "curator", "couche": "orchestre", "titre": "Conservateur", "chiffre": "toutes les 168 h", "statut": "actif",
      "machine": "Conteneur Railway",
      "fait": "Entretient les skills créés par l'agent : archive après 90 jours d'inactivité sans jamais supprimer, sauvegarde tar.gz avant chaque passe. Ne touche pas aux skills écrits par Guillaume.",
      "entre": "Les skills créés par l'agent.",
      "sort": "Des skills archivés.",
      "cout": "Non précisé dans le document.",
      "casse": "Non précisé dans le document.",
      "source": "4, 8",
      "preuve": { "titre": "Réglages", "source": "4",
        "lignes": ["curator.enabled = vrai", "une passe toutes les 168 heures", "archivage après 90 jours"] }
    },

    {
      "id": "t_term", "couche": "outils", "titre": "Terminal · fichiers", "chiffre": "+ exécution de code", "statut": "actif",
      "machine": "Conteneur Railway (Debian 13, Python 3.13.5, Node.js v26.5.1)",
      "fait": "Commandes shell, lecture et écriture de fichiers, exécution de code. Les outils de fichier refusent d'écrire dans le vault : toute écriture y passe par le terminal.",
      "entre": "Une commande de l'orchestrateur ou d'un sous-agent.",
      "sort": "La sortie de la commande, filtrée de ses secrets.",
      "cout": "Sortie plafonnée à 50 000 octets, 2 000 lignes.",
      "casse": "L'agent ne peut plus agir sur le système ni écrire dans le vault.",
      "source": "7.1, 4, 15",
      "preuve": { "titre": "Garde-fous", "source": "4",
        "lignes": ["tool_output : 50 000 octets, 2 000 lignes", "security.redact_secrets = vrai", "security.tirith_enabled = vrai (fail open)"] }
    },
    {
      "id": "t_web", "couche": "outils", "titre": "Web · navigateur", "chiffre": "+ vision", "statut": "actif",
      "machine": "Conteneur Railway (Playwright) ; vision chez Anthropic (claude-haiku-4-5)",
      "fait": "Recherche et extraction web, navigateur automatisé, lecture d'images par un modèle auxiliaire.",
      "entre": "Une requête, une adresse, une image.",
      "sort": "Pages, extraits, description d'image.",
      "cout": "30 secondes par commande de navigateur.",
      "casse": "Plus de recherche web interne ; Firecrawl reste disponible en MCP.",
      "source": "7.1, 7.4, 5.1",
      "preuve": { "titre": "Délais du navigateur", "source": "4",
        "lignes": ["browser : moteur auto, 30 s par commande", "inactivité 120 s · dialogues 300 s", "allow_private_urls = faux"] }
    },
    {
      "id": "t_tts", "couche": "outils", "titre": "Synthèse vocale", "chiffre": "fr-FR-DeniseNeural", "statut": "actif",
      "machine": "Conteneur Railway (moteur edge)",
      "fait": "Lit la réponse à voix haute. La voix anglaise d'origine rendait le français incompréhensible et dégradait la reconnaissance des mémos suivants.",
      "entre": "Le texte de la réponse.",
      "sort": "Un message vocal pour Telegram.",
      "cout": "Non précisé dans le document.",
      "casse": "Les réponses reviennent en texte seulement.",
      "source": "7.6",
      "preuve": { "titre": "Réglage", "source": "4, 7.6",
        "lignes": ["tts : edge", "voix : fr-FR-DeniseNeural", "commande Telegram : /voice tts"] }
    },
    {
      "id": "t_mem", "couche": "outils", "titre": "Mémoire · sessions", "chiffre": "skills · à faire · cron", "statut": "actif",
      "machine": "Conteneur Railway ; données sur le volume",
      "fait": "Outils de mémoire, recherche dans les sessions, skills, tâches à faire, tâches planifiées et clarification.",
      "entre": "Une requête de l'orchestrateur ou d'un sous-agent.",
      "sort": "Faits, extraits, écritures en mémoire.",
      "cout": "Non précisé dans le document.",
      "casse": "L'agent ne se souvient plus et ne retrouve plus rien.",
      "source": "7.1, 8",
      "preuve": { "titre": "Jeux d'outils", "source": "4, 7.1",
        "lignes": ["toolsets = hermes-cli", "agent.disabled_toolsets = vide", "aucun jeu d'outils désactivé"] }
    },

    {
      "id": "deleg", "couche": "sousagents", "titre": "delegate_task", "chiffre": "profondeur 1", "statut": "actif",
      "machine": "Conteneur Railway",
      "fait": "Ouvre un contexte isolé pour un sous-agent. Orchestrateur activé, un seul niveau de délégation : un sous-agent ne délègue pas à son tour.",
      "entre": "Une tâche confiée par l'orchestrateur.",
      "sort": "Un sous-agent lancé, puis son résultat.",
      "cout": "Délai par enfant : 600 secondes.",
      "casse": "L'agent principal fait tout lui-même, en série.",
      "source": "4",
      "preuve": { "titre": "Réglages de délégation", "source": "4",
        "lignes": ["delegation.provider = anthropic", "max_spawn_depth = 1", "délai par enfant : 600 s"] }
    },
    {
      "id": "sub", "couche": "sousagents", "titre": "Sous-agents", "chiffre": "3 en parallèle", "statut": "actif",
      "mesure": { "titre": "Sous-agents en parallèle", "source": "4", "unite": "sous-agents au plus", "max": 3, "segments": [ { "l": "plafond", "v": 3 } ] },
      "machine": "Conteneur Railway ; modèle claude-haiku-4-5 chez Anthropic",
      "fait": "Contextes enfants qui travaillent en parallèle, trois au plus.",
      "entre": "Une tâche bornée.",
      "sort": "Un résultat remonté à l'orchestrateur.",
      "cout": "Sur 30 jours : 31 sessions de sous-agents. claude-haiku-4-5 : 30,6 M jetons sur 32 sessions.",
      "casse": "Plus de travail en parallèle.",
      "source": "4, 5.3",
      "preuve": { "titre": "Réglages", "source": "4, 5.3",
        "lignes": ["delegation.model = claude-haiku-4-5", "max_concurrent_children = 3", "31 sessions de sous-agents sur 30 jours"] }
    },

    {
      "id": "cat", "couche": "mcp", "titre": "Catalogue MCP", "chiffre": "111 outils", "statut": "actif", "pivot": true,
      "mesure": { "titre": "Catalogue des 111 outils MCP", "source": "7.1", "unite": "outils", "segments": [ { "l": "Firecrawl", "v": 27 }, { "l": "Figma", "v": 44 }, { "l": "Blender", "v": 40 } ] },
      "machine": "Conteneur Railway",
      "fait": "Les outils MCP ne sont pas chargés d'office : l'agent les cherche à la demande. C'est ce qui permet de garder trois serveurs branchés sans noyer le contexte.",
      "entre": "Une recherche d'outil.",
      "sort": "L'outil MCP chargé, puis son résultat.",
      "cout": "Seuil de chargement : 10 % du contexte.",
      "casse": "Les trois serveurs MCP deviennent inaccessibles.",
      "source": "4, 7.1",
      "preuve": { "titre": "Recherche d'outils", "source": "4, 7.1",
        "lignes": ["tools.tool_search = auto, seuil 10 %", "27 Firecrawl + 44 Figma + 40 Blender = 111", "rechargement d'un serveur : confirmation demandée"] }
    },
    {
      "id": "fc", "couche": "mcp", "titre": "Firecrawl", "chiffre": "27 outils · local", "statut": "actif",
      "machine": "Conteneur Railway (processus npx), service Firecrawl distant",
      "fait": "Moteur de recherche et de collecte web.",
      "entre": "Une requête de recherche ou une adresse.",
      "sort": "Pages collectées et extraites.",
      "cout": "Non précisé dans le document.",
      "casse": "Plus de collecte web en MCP. La clé FIRECRAWL_API_KEY n'est pas reconstruite au démarrage (15).",
      "source": "7.2",
      "preuve": { "titre": "Serveur MCP", "source": "4, 7.2",
        "lignes": ["commande : npx firecrawl-mcp", "clé : FIRECRAWL_API_KEY", "27 outils, tous activés"] }
    },
    {
      "id": "fig", "couche": "mcp", "titre": "Figma", "chiffre": "44 outils · distant", "statut": "actif",
      "machine": "Service distant https://mcp.figma.com/mcp",
      "fait": "Lecture des fichiers et des composants, capture d'un cadre, export d'images et de vidéos, création de diagrammes, écriture dans un fichier Figma.",
      "entre": "Une commande MCP authentifiée.",
      "sort": "Composants lus, images exportées, fichier modifié.",
      "cout": "Non précisé dans le document.",
      "casse": "Plus de lecture ni d'écriture de maquettes. Après perte du volume, l'OAuth est à refaire (13.2).",
      "source": "7.2",
      "preuve": { "titre": "Serveur MCP distant", "source": "7.2",
        "lignes": ["https://mcp.figma.com/mcp", "authentification : OAuth", "jetons : /opt/data/mcp-tokens/figma.json"] }
    },
    {
      "id": "bl", "couche": "mcp", "titre": "Blender", "chiffre": "40 outils · Mac", "statut": "actif",
      "machine": "Mac de Guillaume : macbook-air-de-guillaume (100.106.146.95)",
      "fait": "Lecture de scène, création d'objets, matériaux, rendu, imports (Polyhaven, Poly Pizza, Sketchfab), génération par Hyper3D, Tripo ou Hunyuan3D, export de scène.",
      "entre": "Une commande MCP arrivée par SSH à travers le tailnet.",
      "sort": "Un résultat ou un rendu, renvoyé dans la session.",
      "cout": "Non précisé dans le document.",
      "casse": "Le pont ne se refait pas sans mac_blender_mcp.env et la clé SSH id_hermes_mac, sauvegardés nulle part (12.2). Côté Mac : Tailscale actif, extension Blender lancée, SSH distant autorisé.",
      "note": "Un rendu Blender produit une image. La section 9.4 confie toute génération de média à Dadaland ; le document ne tranche pas ce cas. Point à discuter en cours.",
      "source": "7.2, 7.5",
      "preuve": { "titre": "Côté Mac", "source": "7.5",
        "lignes": ["extension Blender : 127.0.0.1:9876", "uvx mcp-for-blender --host 127.0.0.1 --port 9876", "diagnostic : MAC_MCP_DIAG=1 bash mac_blender_mcp.sh"] }
    },
    {
      "id": "dada", "couche": "mcp", "titre": "Dadaland", "chiffre": "annoncé, non branché", "statut": "non-branche",
      "machine": "Outil du studio, hors du système",
      "fait": "Guillaume confie toute génération d'images et de vidéos à Dadaland. L'accès MCP est annoncé pour octobre 2026 ; il deviendra le quatrième serveur MCP.",
      "entre": "Rien aujourd'hui.",
      "sort": "Rien aujourd'hui.",
      "cout": "Non précisé dans le document.",
      "casse": "Aujourd'hui, une demande d'image se solde par un prompt remis à Guillaume (15).",
      "source": "9.4, 15",
      "preuve": { "titre": "Règle en vigueur", "source": "9.4",
        "lignes": ["ne produire aucun média par un autre canal", "livrer un prompt quand une image est demandée"] }
    },

    {
      "id": "vault", "couche": "memoire", "titre": "Vault Git", "chiffre": "1 258 notes", "statut": "actif",
      "machine": "Volume /opt/data/vault (132 Mo), poussé sur GitHub",
      "fait": "Le second brain en markdown : 5 catégories, 29 univers, une constitution écrite. Tout entre par inbox/, l'agent trie après digestion.",
      "entre": "Écritures par le terminal, puis commit.",
      "sort": "Notes, soul.md, skills.",
      "cout": "Non précisé dans le document.",
      "casse": "Perte de la connaissance digérée et des skills, qui vivent dans le vault.",
      "source": "10, 2.3",
      "preuve": { "titre": "Volumétrie", "source": "10.3",
        "lignes": ["1 530 fichiers suivis · 589 commits depuis le 6 août 2026", "1 258 notes markdown hors skills", "règle : vault_git.py pull avant lecture, push après écriture"] }
    },
    {
      "id": "statedb", "couche": "memoire", "titre": "state.db", "chiffre": "4,6 Go", "statut": "actif",
      "mesure": { "titre": "Part de state.db dans le volume occupé", "source": "1", "unite": "Go", "max": 30, "segments": [ { "l": "state.db", "v": 4.6 }, { "l": "caches de digestion", "v": 5.9 } ] },
      "machine": "Volume /opt/data/state.db",
      "fait": "Base SQLite des sessions : la mémoire brute, celle qui retrouve un échange d'il y a trois mois.",
      "entre": "Chaque message de chaque session.",
      "sort": "Recherches plein texte.",
      "cout": "Non précisé dans le document.",
      "casse": "Perte de l'historique des conversations. Elle revient avec l'archive Drive (13.2).",
      "source": "8, 2.2",
      "preuve": { "titre": "Contenu", "source": "2.2, 8",
        "lignes": ["41 tables · 9 597 sessions · 301 927 messages", "state.db-wal : 12 Mo", "contrôle : pragma quick_check, en lecture seule"] }
    },
    {
      "id": "holo", "couche": "memoire", "titre": "Mémoire holographique", "chiffre": "memory_store.db", "statut": "actif",
      "machine": "Volume /opt/data/memory_store.db (64 Ko)",
      "fait": "Faits résolus par entité avec un score de confiance ; répond à des questions composées. Indépendante de la mémoire injectée.",
      "entre": "Faits écrits par l'outil mémoire.",
      "sort": "Réponses à des questions composées.",
      "cout": "Non précisé dans le document.",
      "casse": "Non précisé dans le document.",
      "source": "8, 4",
      "preuve": { "titre": "Réglages", "source": "4, 8",
        "lignes": ["memory.provider = holographic", "en service depuis le 22 septembre 2026", "memory.flush_min_turns = 6"] }
    },
    {
      "id": "drive", "couche": "memoire", "titre": "Google Drive", "chiffre": "11 HERMES", "statut": "actif",
      "machine": "Service distant Google, compte professionnel de Guillaume",
      "fait": "Dépôt des sauvegardes, matière première professionnelle (01 WORK), et miroir Obsidian du vault, lisible sans l'agent.",
      "entre": "Archives nocturnes, copies de configuration, miroir Obsidian.",
      "sort": "Matière première, lue par la persona Digest.",
      "cout": "Non précisé dans le document.",
      "casse": "Plus de sauvegarde hors du volume.",
      "source": "2.4, 11, 12.1",
      "preuve": { "titre": "Dossiers de 11 HERMES", "source": "2.4, 12.1",
        "lignes": ["02 SNAPSHOTS COMPLETS : 30 archives conservées", "01 CONFIGS INFRASTRUCTURE : config.yaml, 11 772 octets", "04 OBSIDIAN : miroir du vault, 8 sous-dossiers"] }
    },

    {
      "id": "railway", "couche": "deploiement", "titre": "Railway", "chiffre": "volume 46 Go", "statut": "actif",
      "mesure": { "titre": "Volume /opt/data", "source": "1, 2.1", "unite": "Go", "max": 46, "segments": [ { "l": "occupé", "v": 30 } ] },
      "machine": "Hébergeur Railway, région sfo (San Francisco)",
      "fait": "Projet zesty-elegance, service hermes-railway, environnement production. Le volume hermes-railway-volume, monté sur /opt/data, survit aux redéploiements.",
      "entre": "L'image reconstruite à chaque push.",
      "sort": "Le conteneur en marche.",
      "cout": "Non précisé dans le document.",
      "casse": "Tout s'arrête. Reprise : section 13.",
      "source": "2.1, 13.5",
      "preuve": { "titre": "Relevé Railway", "source": "1, 2.1, 13.5",
        "lignes": ["volume : 46 Go alloués, 30 Go occupés", "dernier déploiement : 761c3e6b, 2 octobre 2026", "sauvegarde de volume : 08 h 14 UTC, 6 jours"] }
    },
    {
      "id": "gh_rail", "couche": "deploiement", "titre": "hermes-railway", "chiffre": "4 fichiers", "statut": "actif",
      "machine": "GitHub, dépôt privé ghelleu/hermes-railway",
      "fait": "Dockerfile, config.yaml, railway.json, README.md. Chaque git push sur main reconstruit l'image et redéploie. Le config.yaml du dépôt n'est copié qu'en graine : le pousser ne change rien au conteneur qui tourne.",
      "entre": "Un git push sur main.",
      "sort": "Une reconstruction complète de l'image.",
      "cout": "Environ six minutes de reconstruction, même pour une ligne modifiée.",
      "casse": "Plus de redéploiement possible depuis le code.",
      "source": "2.3, 3, 4",
      "preuve": { "titre": "Dockerfile (3 lignes)", "source": "2.3",
        "lignes": ["FROM nousresearch/hermes-agent:v2026.9.24", "copie de config.yaml → /opt/hermes/seed-config.yaml", "dernier commit : 6987c381, « Update config.yaml »"] }
    },
    {
      "id": "gh_vault", "couche": "deploiement", "titre": "hermes-vault", "chiffre": "589 commits", "statut": "actif",
      "machine": "GitHub, dépôt privé ghelleu/hermes-vault",
      "fait": "La copie du vault : notes, skills, miroir des mémoires. Aucun secret n'y entre.",
      "entre": "Les commits poussés par vault_git.py.",
      "sort": "Un clone possible pour reconstruire le vault (13.2).",
      "cout": "Non précisé dans le document.",
      "casse": "Plus de copie hors du volume pour la connaissance.",
      "source": "2.3, 10.3, 12.1",
      "preuve": { "titre": "Dernier commit au 15 octobre 2026", "source": "2.3, 10.3",
        "lignes": ["9136be3", "« MAGNETIC : avis exterieur sur le dossier v6 »", "vérification : git ls-remote origin main"] }
    },
    {
      "id": "cron", "couche": "deploiement", "titre": "Tâches planifiées", "chiffre": "7 · 1 en pause", "statut": "actif",
      "mesure": { "titre": "État des tâches planifiées au 15 octobre 2026", "source": "11", "unite": "tâches", "segments": [ { "l": "actives", "v": 6 }, { "l": "en pause", "v": 1, "etat": "pause" } ] },
      "machine": "Conteneur Railway ; /opt/data/cron/jobs.json",
      "fait": "Sauvegarde nocturne, miroir Obsidian, rafraîchissement des jetons Google, surveillance des alertes de sécurité, veille du lundi, réparation de Tailscale, pont Elio (en pause).",
      "entre": "L'horloge (le système raisonne en UTC).",
      "sort": "Scripts exécutés, livraisons dans Telegram.",
      "cout": "Sur 30 jours : 16 sessions de tâches planifiées.",
      "casse": "La sauvegarde est la tâche la plus importante : sa panne est silencieuse (12).",
      "source": "11, 5.3",
      "preuve": { "titre": "Les sept tâches (jobs.json)", "source": "11",
        "lignes": ["8f403b4498a6 sauvegarde · chaque jour 3 h UTC", "d473683bdfcc miroir Obsidian · 180 min", "194c5b9cdd11 jetons OAuth · 30 min · en échec", "b411607aaa21 alertes Google · 1 h", "1c2007698eef veille · lundi 7 h", "389ade52c1bb Tailscale · 15 min", "60254156653a pont Elio · 5 min · en pause"] }
    },
    {
      "id": "ts", "couche": "deploiement", "titre": "Tailscale", "chiffre": "2 nœuds · SOCKS5", "statut": "actif",
      "machine": "Conteneur Railway (démon userspace) et Mac de Guillaume",
      "fait": "Relie le conteneur au Mac sans ouvrir de port. Démon en userspace-networking, proxy SOCKS5 sur 127.0.0.1:1055. L'identité du nœud vit sur le volume : pas de réauthentification au redémarrage.",
      "entre": "La connexion SSH de la passerelle MCP.",
      "sort": "Le Mac joignable à travers le tailnet.",
      "cout": "Non précisé dans le document.",
      "casse": "Blender devient injoignable.",
      "source": "7.5",
      "preuve": { "titre": "Les deux nœuds", "source": "7.5",
        "lignes": ["hermes-railway : 100.116.245.51 (linux)", "macbook-air-de-guillaume : 100.106.146.95 (macOS)", "réparation : tailscale_ensure.sh toutes les 15 min"] }
    },
    {
      "id": "jetons", "couche": "deploiement", "titre": "Jetons Google", "chiffre": "1 jeton révoqué", "statut": "panne",
      "mesure": { "titre": "État des fichiers de jetons Google", "source": "9.1", "unite": "jetons", "segments": [ { "l": "rafraîchis", "v": 2 }, { "l": "révoqué", "v": 1, "etat": "panne" } ] },
      "machine": "Volume /opt/data/google_token*.json",
      "fait": "Trois fichiers de jetons. Le principal, google_token.json (mode 444), porte onze périmètres : Drive, Docs, Sheets, Calendar, Gmail, Contacts, Apps Script.",
      "entre": "Le rafraîchissement automatique toutes les 30 minutes.",
      "sort": "L'accès aux API Google.",
      "cout": "Non précisé dans le document.",
      "casse": "Les onze périmètres partagent le même identifiant client : une révocation en cascade peut tout emporter d'un coup (9.1).",
      "source": "9.1, 15",
      "preuve": { "titre": "État au 15 octobre 2026", "source": "9.1",
        "lignes": ["google_token.json : rafraîchi normalement", "google_token_guillaumepro.json : rafraîchi normalement", "google_token_hint3rland.json : révoqué (invalid_grant)"] }
    },
    {
      "id": "elio", "couche": "deploiement", "titre": "Pont Elio", "chiffre": "en pause", "statut": "pause",
      "machine": "Tâche du conteneur ; fichiers JSONL dans Google Drive",
      "fait": "Échange agent à agent avec Elio, l'agent OpenClaw du studio Hint3rland, par deux fichiers JSONL dans Drive, un par sens.",
      "entre": "Les fichiers JSONL du pont.",
      "sort": "Un réveil de l'agent si un fichier change.",
      "cout": "Non précisé dans le document.",
      "casse": "Réactiver sans refaire le jeton relance les mêmes échecs toutes les cinq minutes (15).",
      "source": "9.3, 11, 15",
      "preuve": { "titre": "Tâche pont_elio", "source": "9.3, 11",
        "lignes": ["60254156653a, toutes les 5 min", "dernier échec : HTTP 400 au rafraîchissement du jeton Drive", "10 passages consécutifs ; en pause depuis le 15 octobre 2026"] }
    },
    {
      "id": "secours", "couche": "deploiement", "titre": "Agent de secours", "chiffre": "service secours", "statut": "actif", "annexe": true,
      "machine": "Second service Railway, même projet",
      "fait": "Diagnostique et répare l'agent principal par l'API Railway : redéploiement, redémarrage, inspection, variables, sauvegardes du volume. Il a son propre bot Telegram.",
      "entre": "Un appel de Guillaume quand l'agent principal ne répond plus.",
      "sort": "Des actions sur le service hermes-railway.",
      "cout": "Non précisé dans le document.",
      "casse": "Plus de réparation indépendante de l'agent réparé.",
      "source": "13.4, 17.1",
      "preuve": { "titre": "Service secours", "source": "13.4, 17.1",
        "lignes": ["identifiant f6a49b37-b541-4a0c-8279-03f24b0acf5b", "skill agent_de_secours (dossier devops du vault)", "railway_api.py doctor --service hermes-railway"] }
    },

    {
      "id": "out_tg", "couche": "sorties", "titre": "Réponse Telegram", "chiffre": "texte ou voix", "statut": "actif",
      "machine": "Service distant Telegram",
      "fait": "La réponse revient dans le fil d'origine, en texte, ou en voix selon le mode réglé par /voice.",
      "entre": "Le texte de l'orchestrateur, la voix de la synthèse.",
      "sort": "Un message dans le fil.",
      "cout": "Non précisé dans le document.",
      "casse": "Guillaume ne reçoit plus de réponse.",
      "source": "6.1, 7.6",
      "preuve": { "titre": "Affichage", "source": "6.1",
        "lignes": ["réactions Telegram désactivées", "affichage des appels d'outils désactivé"] }
    },
    {
      "id": "out_doc", "couche": "sorties", "titre": "Document Google", "chiffre": "écrit par API", "statut": "actif",
      "machine": "Service distant Google Docs",
      "fait": "Le livrable écrit, mis à jour par l'API Google avec le jeton principal.",
      "entre": "Le texte rédigé par l'agent.",
      "sort": "Un document Google à jour.",
      "cout": "Non précisé dans le document.",
      "casse": "Le livrable ne s'écrit plus si le jeton principal tombe.",
      "source": "9.1, 17.2",
      "preuve": { "titre": "Accès", "source": "9.1, 17.2",
        "lignes": ["token_manager.py : Drive, Gmail, Sheets, Docs, Calendar", "périmètre documents du jeton principal"] }
    },
    {
      "id": "out_img", "couche": "sorties", "titre": "Image générée", "chiffre": "via Dadaland, non branché", "statut": "non-branche",
      "machine": "Hors du système",
      "fait": "Aujourd'hui, aucune image n'est générée par le système : l'agent remet un prompt à Guillaume.",
      "entre": "Rien tant que Dadaland n'est pas branché.",
      "sort": "Un prompt, pas une image.",
      "cout": "Non précisé dans le document.",
      "casse": "Rien de plus : la sortie n'existe pas encore.",
      "source": "9.4, 15",
      "preuve": { "titre": "Règle", "source": "9.4",
        "lignes": ["livrer un prompt quand une image est demandée"] }
    },
    {
      "id": "out_commit", "couche": "sorties", "titre": "Commit poussé", "chiffre": "vers hermes-vault", "statut": "actif",
      "machine": "Volume /opt/data/vault, puis GitHub",
      "fait": "Les notes de travail sont commitées puis poussées, en ne mettant en index que les fichiers touchés.",
      "entre": "Les fichiers modifiés du vault.",
      "sort": "Un commit sur ghelleu/hermes-vault.",
      "cout": "Non précisé dans le document.",
      "casse": "Les notes restent sur le volume seulement.",
      "source": "10.3",
      "preuve": { "titre": "Commande", "source": "10.3",
        "lignes": ["python3 /opt/data/scripts/vault_git.py push \"message\"", "vérification : git ls-remote origin main"] }
    },
    {
      "id": "out_arch", "couche": "sorties", "titre": "Archive nocturne", "chiffre": "1,52 à 1,72 Go", "statut": "actif",
      "machine": "Conteneur Railway, puis Google Drive",
      "fait": "Archive tar.gz complète déposée chaque nuit sur Drive, trente conservées. Elle contient memories/, skills/, cron/, scripts/, config.yaml, SOUL.md et state.db.",
      "entre": "Le volume /opt/data.",
      "sort": "hermes-backup-<date>_0300.tar.gz dans 02 SNAPSHOTS COMPLETS.",
      "cout": "Dernière archive déposée à 03 h 04 le 15 octobre 2026.",
      "casse": "Panne silencieuse : une archive de quelques kilo-octets signale l'échec connu. Vérifier l'artefact, jamais le journal (12.3).",
      "source": "1, 11, 12.1, 12.3",
      "preuve": { "titre": "Contrôle du 15 octobre 2026", "source": "12.1, 12.3",
        "lignes": ["30 archives : de 1 519,3 à 1 716,1 Mo", "tâche 8f403b4498a6, chaque jour à 3 h UTC", "archive de quelques Ko = échec silencieux"] }
    }
  ],

  "liens": [
    { "id": "l01", "de": "memo",    "vers": "gw",      "type": "evt",   "etiquette": "fichier audio",                "source": "7.6" },
    { "id": "l02", "de": "tg",      "vers": "gw",      "type": "evt",   "etiquette": "message · polling",            "source": "6.1" },
    { "id": "l03", "de": "wa",      "vers": "gw",      "type": "off",   "etiquette": "non appairé",                  "source": "6.3" },
    { "id": "l04", "de": "gw",      "vers": "stt",     "type": "cout",  "etiquette": "0 $ · 8 s ≈ 10 s",            "source": "7.6" },
    { "id": "l05", "de": "stt",     "vers": "loop",    "type": "evt",   "etiquette": "texte fr",                     "source": "7.6" },
    { "id": "l06", "de": "gw",      "vers": "loop",    "type": "evt",   "etiquette": "demande",                      "source": "6.1" },
    { "id": "l07", "de": "soul",    "vers": "loop",    "type": "ctx",   "etiquette": "voix · règles",                "source": "10.1" },
    { "id": "l08", "de": "mem",     "vers": "loop",    "type": "ctx",   "etiquette": "à chaque tour",                "source": "8" },
    { "id": "l09", "de": "persona", "vers": "loop",    "type": "ctx",   "etiquette": "persona du fil",               "source": "6.1" },
    { "id": "l10", "de": "skills",  "vers": "loop",    "type": "ctx",   "etiquette": "skill pertinent",              "source": "8" },
    { "id": "l11", "de": "hist",    "vers": "loop",    "type": "ctx",   "etiquette": "échanges passés",              "source": "8" },
    { "id": "l12", "de": "loop",    "vers": "comp",    "type": "cout",  "etiquette": "0,10 $ / M jetons",            "source": "5.1" },
    { "id": "l13", "de": "loop",    "vers": "t_term",  "type": "outil", "etiquette": "commande",                     "source": "7.1" },
    { "id": "l14", "de": "loop",    "vers": "t_web",   "type": "outil", "etiquette": "recherche",                    "source": "7.1" },
    { "id": "l15", "de": "loop",    "vers": "t_tts",   "type": "outil", "etiquette": "lecture à voix haute",         "source": "7.6" },
    { "id": "l16", "de": "loop",    "vers": "t_mem",   "type": "outil", "etiquette": "mémoire",                      "source": "7.1" },
    { "id": "l17", "de": "loop",    "vers": "deleg",   "type": "outil", "etiquette": "délégation",                   "source": "4" },
    { "id": "l18", "de": "deleg",   "vers": "sub",     "type": "outil", "etiquette": "≤ 3 · 600 s",                  "source": "4" },
    { "id": "l19", "de": "sub",     "vers": "cat",     "type": "outil", "etiquette": "outil MCP",                    "source": "7.1" },
    { "id": "l20", "de": "sub",     "vers": "t_mem",   "type": "outil", "etiquette": "recherche sessions",           "source": "7.1" },
    { "id": "l21", "de": "sub",     "vers": "t_term",  "type": "outil", "etiquette": "lecture du vault",             "source": "7.1" },
    { "id": "l22", "de": "loop",    "vers": "cat",     "type": "outil", "etiquette": "tool_search",                  "source": "4" },
    { "id": "l23", "de": "cat",     "vers": "fc",      "type": "stdio", "etiquette": "stdio · npx",                  "source": "7.2" },
    { "id": "l24", "de": "cat",     "vers": "fig",     "type": "http",  "etiquette": "HTTP · OAuth",                 "source": "7.2" },
    { "id": "l25", "de": "cat",     "vers": "bl",      "type": "ssh",   "etiquette": "stdio → SSH tailnet",          "source": "7.5" },
    { "id": "l26", "de": "ts",      "vers": "bl",      "type": "ssh",   "etiquette": "SOCKS5 :1055 → :9876",         "source": "7.5", "pos": 0.62 },
    { "id": "l27", "de": "cat",     "vers": "dada",    "type": "off",   "etiquette": "MCP annoncé",                  "source": "9.4" },
    { "id": "l28", "de": "t_term",  "vers": "ckpt",    "type": "data",  "etiquette": "avant modification",           "source": "2.2" },
    { "id": "l29", "de": "curator", "vers": "skills",  "type": "data",  "etiquette": "archive après 90 j",           "source": "8" },
    { "id": "l30", "de": "statedb", "vers": "hist",    "type": "data",  "etiquette": "messages_fts",                 "source": "8" },
    { "id": "l31", "de": "vault",   "vers": "soul",    "type": "data",  "etiquette": "config/soul.md",               "source": "10.1" },
    { "id": "l32", "de": "vault",   "vers": "skills",  "type": "data",  "etiquette": "vault/skills",                 "source": "10.3" },
    { "id": "l33", "de": "t_mem",   "vers": "statedb", "type": "data",  "etiquette": "recherche",                    "source": "8" },
    { "id": "l34", "de": "t_mem",   "vers": "holo",    "type": "data",  "etiquette": "faits par entité",             "source": "8" },
    { "id": "l35", "de": "t_mem",   "vers": "mem",     "type": "data",  "etiquette": "écriture",                     "source": "8" },
    { "id": "l36", "de": "t_term",  "vers": "vault",   "type": "data",  "etiquette": "écriture par terminal",        "source": "15" },
    { "id": "l37", "de": "vault",   "vers": "out_commit", "type": "git", "etiquette": "commit",                      "source": "10.3" },
    { "id": "l38", "de": "out_commit", "vers": "gh_vault", "type": "git", "etiquette": "git push",                   "source": "10.3" },
    { "id": "l39", "de": "gh_rail", "vers": "railway", "type": "git",   "etiquette": "push → image ~6 min → redéploiement", "source": "1, 3" },
    { "id": "l40", "de": "cron",    "vers": "out_arch", "type": "data", "etiquette": "3 h UTC",                      "source": "11" },
    { "id": "l41", "de": "out_arch", "vers": "drive",  "type": "data",  "etiquette": "02 SNAPSHOTS",                 "source": "12.1" },
    { "id": "l42", "de": "vault",   "vers": "drive",   "type": "data",  "etiquette": "Obsidian · 180 min",           "source": "11" },
    { "id": "l43", "de": "cron",    "vers": "ts",      "type": "outil", "etiquette": "réparation · 15 min",          "source": "11" },
    { "id": "l44", "de": "cron",    "vers": "jetons",  "type": "off",   "etiquette": "invalid_grant · 51 échecs",    "source": "9.1" },
    { "id": "l45", "de": "cron",    "vers": "out_tg",  "type": "off",   "etiquette": "livraison 16965 · 401",        "source": "11" },
    { "id": "l46", "de": "elio",    "vers": "drive",   "type": "off",   "etiquette": "HTTP 400 · en pause",          "source": "9.3" },
    { "id": "l47", "de": "secours", "vers": "railway", "type": "outil", "etiquette": "API Railway",                  "source": "13.4" },
    { "id": "l48", "de": "loop",    "vers": "out_tg",  "type": "evt",   "etiquette": "réponse",                      "source": "6.1" },
    { "id": "l49", "de": "t_tts",   "vers": "out_tg",  "type": "evt",   "etiquette": "voix Denise",                  "source": "7.6" },
    { "id": "l50", "de": "t_term",  "vers": "out_doc", "type": "outil", "etiquette": "API Docs",                     "source": "9.1" },
    { "id": "l51", "de": "jetons",  "vers": "out_doc", "type": "data",  "etiquette": "jeton principal",              "source": "9.1" },
    { "id": "l52", "de": "dada",    "vers": "out_img", "type": "off",   "etiquette": "non branché",                  "source": "9.4" }
  ],

  "scenario": {
    "titre": "Le mémo du lundi matin",
    "dureeEtape": 10,
    "etapes": [
      {
        "titre": "Le mémo arrive",
        "texte": "Un lundi matin, Guillaume envoie un mémo vocal de quarante secondes dans le fil de travail : « Il me faut la note d'intention et une vue 3D du pavillon pour l'appel à projets, avec les références qu'on a vues, et une remise en page propre pour le jury. » La passerelle le récupère par interrogation continue.",
        "ou": "Téléphone → service Telegram → conteneur Railway, région sfo (San Francisco)",
        "fichier": "hermes gateway run · jeton TELEGRAM_BOT_TOKEN dans /opt/data/.env",
        "source": "2.1, 6.1",
        "blocs": ["memo", "tg", "gw"], "liens": ["l01"]
      },
      {
        "titre": "Transcription sur place",
        "texte": "faster-whisper transcrit en français, sans rien envoyer hors du système, pour 0 dollar. Seule mesure publiée : un mémo de 8 secondes se transcrit en une dizaine de secondes, chargement du modèle compris. Le document ne donne aucune mesure pour 40 secondes.",
        "ou": "Conteneur Railway (sfo)",
        "fichier": "/opt/data/.cache/huggingface/ : modèle large-v3, 3,1 Go",
        "source": "7.6",
        "blocs": ["gw", "stt"], "liens": ["l04", "l05"]
      },
      {
        "titre": "Assemblage du contexte",
        "texte": "Le texte transcrit rejoint la voix et les règles de config/soul.md, la mémoire injectée, les skills pertinents et l'historique, pour former la requête envoyée au modèle. Depuis le 12 octobre 2026, l'antithèse, la règle de trois et la tournure « ni… ni… mais… » sont proscrites.",
        "ou": "Volume /opt/data, lu par le conteneur",
        "fichier": "vault/config/soul.md · memories/MEMORY.md, USER.md · vault/skills/ · state.db",
        "source": "8, 10.1, 16",
        "blocs": ["soul", "mem", "skills", "hist", "statedb", "vault", "loop"], "liens": ["l31", "l07", "l08", "l32", "l10", "l30", "l11"]
      },
      {
        "titre": "Un plan en trois volets",
        "texte": "L'orchestrateur, sur le modèle deepseek-flash, constate que la demande exige de la recherche externe, de la connaissance interne et une production 3D. Il ouvre un plan en trois volets, dans la limite de 1 000 tours.",
        "ou": "Conteneur Railway · appel à https://api.deepseek.com",
        "fichier": "/opt/data/config.yaml : agent.max_turns = 1000",
        "source": "4, 5.1",
        "blocs": ["loop", "turns"], "liens": ["l05"]
      },
      {
        "titre": "Volet recherche",
        "texte": "delegate_task ouvre un sous-agent sur claude-haiku-4-5, 600 secondes au plus. Il cherche l'outil dans le catalogue MCP, interroge Firecrawl en local par stdio, et ramène des pages citées.",
        "ou": "Conteneur Railway · processus npx firecrawl-mcp",
        "fichier": "config.yaml, section mcp_servers.firecrawl",
        "source": "4, 7.2",
        "blocs": ["loop", "deleg", "sub", "cat", "fc"], "liens": ["l17", "l18", "l19", "l23"]
      },
      {
        "titre": "Volet connaissance",
        "texte": "Un second sous-agent lit le vault, univers act_paysages_territoires de la catégorie 03_office, et cherche dans state.db les échanges passés sur le sujet, puis remonte des citations. Trois sous-agents au plus tournent en même temps.",
        "ou": "Conteneur Railway · volume /opt/data",
        "fichier": "vault, univers act_paysages_territoires · state.db (index messages_fts)",
        "source": "4, 8, 10.1",
        "blocs": ["deleg", "sub", "t_term", "t_mem", "vault", "statedb"], "liens": ["l18", "l21", "l36", "l20", "l33"]
      },
      {
        "titre": "Rédaction de la note",
        "texte": "L'agent principal rédige la note d'intention lui-même, en respectant les règles de rédaction enregistrées.",
        "ou": "Conteneur Railway · modèle deepseek-flash",
        "fichier": "vault/config/soul.md",
        "source": "10.1, 16",
        "blocs": ["loop", "soul"], "liens": ["l07"]
      },
      {
        "titre": "Une vue 3D par Blender",
        "texte": "La commande part de la passerelle locale mac_blender_mcp.sh, traverse le tailnet en SSH de hermes-railway (100.116.245.51) vers macbook-air-de-guillaume (100.106.146.95) par le proxy SOCKS5, atteint Blender qui écoute sur 127.0.0.1:9876, et un rendu revient dans la session. À discuter : la section 9.4 confie toute génération de média à Dadaland.",
        "ou": "Conteneur Railway → tailnet → Mac de Guillaume",
        "fichier": "/opt/data/scripts/mac_blender_mcp.sh · clé /opt/data/.ssh/id_hermes_mac",
        "source": "7.5, 9.4",
        "blocs": ["loop", "cat", "bl", "ts"], "liens": ["l22", "l25", "l26"]
      },
      {
        "titre": "Mise en page dans Figma",
        "texte": "Par le serveur MCP distant de Figma (HTTP, OAuth), l'agent ouvre le fichier de gabarit du cours, lit les composants graphiques, remplace les textes et récupère un export d'images.",
        "ou": "Service distant https://mcp.figma.com/mcp",
        "fichier": "/opt/data/mcp-tokens/figma.json",
        "source": "7.2",
        "blocs": ["loop", "cat", "fig"], "liens": ["l22", "l24"]
      },
      {
        "titre": "Livraison",
        "texte": "Le texte est écrit dans un document Google par API, avec le jeton principal. La réponse revient dans Telegram, en texte, ou en voix fr-FR-DeniseNeural selon le mode /voice. Pour une image générée, Dadaland n'est pas branché : l'agent remet un prompt à Guillaume.",
        "ou": "Conteneur Railway → API Google → Telegram",
        "fichier": "/opt/data/google_token.json · token_manager.py",
        "source": "6.1, 7.6, 9.1, 9.4",
        "blocs": ["t_term", "out_doc", "jetons", "loop", "t_tts", "out_tg", "dada", "out_img"], "liens": ["l50", "l51", "l48", "l49", "l52"]
      },
      {
        "titre": "Traçabilité",
        "texte": "Les notes de travail sont écrites dans le vault puis poussées sur GitHub. Le miroir Obsidian les recopie sur Drive toutes les 180 minutes. Les autres tâches suivent : archive nocturne à 3 h UTC (1,52 à 1,72 Go), jetons toutes les 30 minutes, réparation de Tailscale toutes les 15 minutes.",
        "ou": "Volume /opt/data → GitHub → Google Drive",
        "fichier": "/opt/data/cron/jobs.json · vault_git.py · obsidian_sync.py · backup-to-drive.sh",
        "source": "10.3, 11, 12.1",
        "blocs": ["t_term", "vault", "out_commit", "gh_vault", "drive", "cron", "out_arch", "ts"], "liens": ["l36", "l37", "l38", "l42", "l40", "l41", "l43"]
      },
      {
        "titre": "Les pannes réelles",
        "texte": "Au 15 octobre 2026 : le jeton Google hint3rland est révoqué (invalid_grant), la tâche de rafraîchissement échoue depuis 51 passages et sa livraison Telegram répond 401. Le pont vers Elio est en pause après 10 échecs HTTP 400. Dadaland n'est pas encore branché.",
        "ou": "Conteneur Railway · Google · Drive",
        "fichier": "auto_refresh_tokens.py · bridge_watch_elio.py",
        "source": "9.1, 9.3, 9.4, 15",
        "blocs": ["cron", "jetons", "out_tg", "elio", "drive", "cat", "dada", "out_img"], "liens": ["l44", "l45", "l46", "l27", "l52"]
      }
    ]
  }
}
