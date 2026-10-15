/*
  HERMES ATLAS — rendu et interactions.

  Aucune donnée ici : tout vient de window.DONNEES (data.js).
  Toutes les tailles et couleurs viennent des variables CSS de styles.css.
  Aucune bibliothèque, aucune requête réseau.

  Plan du fichier :
    1. Réglages, index des données, état
    2. Mise à l'échelle de la scène
    3. Disposition de base (couches, composants, points d'accroche)
    4. Dessin SVG (guides, flux, composants, étiquettes, jeton)
    5. Éclatement : position de chaque élément selon le curseur
    6. Chemins amont / aval et mise en évidence
    7. Panneau de gauche : couches et flux
    8. Carte de droite : fiche d'un composant
    9. Parcours pas à pas
   10. Recherche
   11. Zoom, déplacement, cadrage
   12. Export PNG
   13. Clavier, adresse (#bloc=…, #etape=…, #eclat=…), démarrage
*/
(function () {
  'use strict';

  /* ============ 1. Réglages, index, état ============ */

  const D = window.DONNEES;
  const NS = 'http://www.w3.org/2000/svg';
  const css = getComputedStyle(document.documentElement);
  const cssVal = (n) => css.getPropertyValue(n).trim();
  const cssNum = (n) => parseFloat(cssVal(n));

  const R = {
    gauche: cssNum('--carte-gauche'),
    droite: cssNum('--carte-droite'),
    haut: cssNum('--carte-haut'),
    bas: cssNum('--carte-bas'),
    larg: cssNum('--noeud-largeur'),
    padH: cssNum('--noeud-pad-h'),
    padV: cssNum('--noeud-pad-v'),
    espace: cssNum('--noeud-espace'),
    rayon: cssNum('--noeud-rayon'),
    tTitre: cssNum('--noeud-t-titre'),
    tChiffre: cssNum('--noeud-t-chiffre'),
    interligne: cssNum('--noeud-interligne'),
    tEtiquette: cssNum('--t-etiquette'),
    tCouche: cssNum('--t-couche'),
    dureeIntro: cssNum('--duree-intro'),
    dureeLien: cssNum('--duree-etape')
  };
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const couches = D.couches;
  const rangCouche = {};
  const coucheParId = {};
  couches.forEach((c, i) => { rangCouche[c.id] = i; coucheParId[c.id] = c; });
  const blocs = {};
  D.blocs.forEach((b) => { blocs[b.id] = b; });
  const types = {};
  D.typesLiens.forEach((t) => { types[t.id] = t; });
  const liens = D.liens.filter((l) => {
    const ok = blocs[l.de] && blocs[l.vers] && types[l.type];
    if (!ok) console.warn('Lien ignoré (bloc ou type inconnu) :', l);
    return ok;
  });
  const lienParId = {};
  const sortants = {};
  const entrants = {};
  liens.forEach((l) => {
    lienParId[l.id] = l;
    (sortants[l.de] = sortants[l.de] || []).push(l);
    (entrants[l.vers] = entrants[l.vers] || []).push(l);
  });
  const etapes = D.scenario.etapes;

  const etat = {
    selection: null,                 // composant dont la fiche est ouverte
    survol: null,                    // { type: 'lien' | 'bloc' | 'couche' | 'flux', id }
    lecture: { active: false, enCours: false, index: 0, minuterie: null },
    couchesOff: new Set(),
    typesOff: new Set(),
    trouves: null,                   // résultats de recherche
    eclat: 1                         // 0 = un seul programme, 1 = neuf couches
  };

  /* ============ Outils ============ */

  function cree(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach((k) => { if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function texteSvg(parent, attrs, contenu) {
    const t = cree('text', attrs, parent);
    t.textContent = contenu;
    return t;
  }
  function el(tag, classe, texte, parent) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte !== undefined && texte !== null) n.textContent = texte;
    if (parent) parent.appendChild(n);
    return n;
  }
  const deux = (n) => String(n).padStart(2, '0');
  const borne = (v, a, b) => Math.max(a, Math.min(b, v));
  const adoucir = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const sansAccents = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* ============ 2. Mise à l'échelle de la scène ============ */

  const scene = document.getElementById('scene');
  function ajusterScene() {
    const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    scene.style.setProperty('--k', k);
  }
  window.addEventListener('resize', ajusterScene);
  ajusterScene();

  /* ============ 3. Disposition de base ============ */

  const svg = document.getElementById('carte');
  const defs = cree('defs', null, svg);
  // Ombre douce sous les composants
  const filtre = cree('filter', { id: 'ombre', x: '-20%', y: '-30%', width: '140%', height: '170%' }, defs);
  cree('feDropShadow', { dx: 0, dy: 2, stdDeviation: 3, 'flood-color': '#14140f', 'flood-opacity': 0.07 }, filtre);

  const gGuides = cree('g', { 'class': 'calque-guides' }, svg);
  const gMonolithe = cree('g', { 'class': 'monolithe' }, svg);
  const gFlux = cree('g', { 'class': 'calque-flux' }, svg);
  const gNoeuds = cree('g', { 'class': 'calque-noeuds' }, svg);
  const gEtiquettes = cree('g', { 'class': 'calque-etiquettes' }, svg);
  const gJeton = cree('g', { 'class': 'jeton', visibility: 'hidden' }, svg);
  cree('circle', { 'class': 'halo', r: 14 }, gJeton);
  cree('circle', { 'class': 'coeur', r: 6 }, gJeton);

  // Mesure de texte, pour couper les libellés de façon déterministe
  const mesure = cree('text', { x: -9999, y: -9999, 'aria-hidden': 'true' }, svg);
  function largeur(txt, taille, poids) {
    mesure.setAttribute('font-size', taille);
    mesure.setAttribute('font-weight', poids);
    mesure.textContent = txt;
    return mesure.getComputedTextLength();
  }
  function couper(txt, taille, poids, max) {
    const mots = [];
    String(txt).split(/\s+/).filter(Boolean).forEach((m) => {
      if (largeur(m, taille, poids) <= max) { mots.push(m); return; }
      // Mot trop long : coupure après / - _ . qui équilibre les deux moitiés
      let meilleure = null;
      for (let i = 1; i < m.length; i++) {
        if ('/-_.'.indexOf(m[i - 1]) < 0) continue;
        const w = Math.max(largeur(m.slice(0, i), taille, poids), largeur(m.slice(i), taille, poids));
        if (w <= max && (!meilleure || w < meilleure.w)) meilleure = { i: i, w: w };
      }
      if (meilleure) { mots.push(m.slice(0, meilleure.i)); mots.push(m.slice(meilleure.i)); } else mots.push(m);
    });
    const lignes = [];
    let cour = '';
    mots.forEach((m) => {
      const essai = cour ? cour + ' ' + m : m;
      if (!cour || largeur(essai, taille, poids) <= max) cour = essai;
      else { lignes.push(cour); cour = m; }
    });
    if (cour) lignes.push(cour);
    return lignes;
  }

  const pas = (R.droite - R.gauche) / couches.length;
  const centreCouche = (i) => R.gauche + pas * (i + 0.5);
  const hT = R.tTitre * R.interligne;
  const hC = R.tChiffre * R.interligne;
  const texteMax = R.larg - 2 * R.padH - 12;     // 12 : place de la pastille d'état
  const base = {};                                 // id → { cx, cy, w, h, lt, lc }
  const HAUT_JAUGE = 12;                           // place de la micro-jauge sous le chiffre
  // Teintes des segments d'une mesure : encres dégradées, rouge réservé aux états en panne ou en pause
  const TEINTES = [cssVal('--encre'), '#7d7c76', '#bdbcb4'];
  const teinte = (seg, i) => (seg.etat === 'panne' || seg.etat === 'pause') ? cssVal('--critique') : TEINTES[i % TEINTES.length];
  function totalMesure(m) { return Math.max(m.max || 0, m.segments.reduce((a, x) => a + x.v, 0)); }
  // Micro-jauge SVG : segments séparés d'un espace de 2, extrémités arrondies
  function jaugeSvg(parent, m, x, y, w, h) {
    const g = cree('g', { 'class': 'jauge' }, parent);
    cree('rect', { x: x, y: y, width: w, height: h, rx: h / 2, fill: '#ebeae5' }, g);
    const total = totalMesure(m);
    let cx = x;
    m.segments.forEach((seg, i) => {
      const sw = Math.max(1.5, w * seg.v / total - (i < m.segments.length - 1 ? 2 : 0));
      cree('rect', { x: cx, y: y, width: sw, height: h, rx: h / 2, fill: teinte(seg, i) }, g);
      cx += sw + 2;
    });
    return g;
  }
  const colonnes = couches.map(() => []);
  D.blocs.forEach((b) => {
    if (rangCouche[b.couche] === undefined) { console.warn('Couche inconnue :', b); return; }
    colonnes[rangCouche[b.couche]].push(b);
  });
  // Nombre de flux accrochés sur chaque côté d'un composant (connu dès maintenant : il ne dépend que des couches)
  const rangDe = (id) => rangCouche[blocs[id].couche];
  const nbPorts = {};
  liens.forEach((l) => {
    const a = rangDe(l.de), b = rangDe(l.vers);
    const cd = a === b ? 1 : (a < b ? 1 : -1);
    const cv = a === b ? 1 : (a < b ? -1 : 1);
    nbPorts[l.de + '|' + cd] = (nbPorts[l.de + '|' + cd] || 0) + 1;
    nbPorts[l.vers + '|' + cv] = (nbPorts[l.vers + '|' + cv] || 0) + 1;
  });
  const ECART_PORT = 13;   // espace vertical réservé à chaque flux sur un côté
  colonnes.forEach((col, i) => {
    let total = 0;
    col.forEach((b, k) => {
      const lt = couper(b.titre, R.tTitre, 620, texteMax);
      const lc = b.chiffre ? couper(b.chiffre, R.tChiffre, 400, texteMax) : [];
      const hTexte = 2 * R.padV + lt.length * hT + lc.length * hC + (b.mesure ? HAUT_JAUGE : 0);
      // Un composant qui reçoit beaucoup de flux grandit : chaque flux garde sa place
      const ports = Math.max(nbPorts[b.id + '|1'] || 0, nbPorts[b.id + '|-1'] || 0);
      const h = Math.max(hTexte, ports * ECART_PORT + 18);
      base[b.id] = { w: R.larg, h: h, lt: lt, lc: lc, rang: i };
      total += h + (k ? R.espace : 0);
    });
    // Colonne centrée verticalement dans la zone de carte
    let y = R.haut + (R.bas - R.haut - total) / 2;
    col.forEach((b) => {
      base[b.id].cx = centreCouche(i);
      base[b.id].cy = y + base[b.id].h / 2;
      y += base[b.id].h + R.espace;
    });
  });

  // Points d'accroche : chaque flux sort et entre par un côté, réparti le long de ce côté
  const accroches = {};
  liens.forEach((l) => {
    const a = base[l.de];
    const b = base[l.vers];
    let cote;
    if (a.rang === b.rang) cote = { de: 1, vers: 1 };               // même couche : arc par la droite
    else if (a.rang < b.rang) cote = { de: 1, vers: -1 };
    else cote = { de: -1, vers: 1 };
    l._cote = cote;
    const ka = l.de + '|' + cote.de;
    const kb = l.vers + '|' + cote.vers;
    (accroches[ka] = accroches[ka] || []).push({ l: l, bout: 'de', autre: b.cy });
    (accroches[kb] = accroches[kb] || []).push({ l: l, bout: 'vers', autre: a.cy });
  });
  Object.keys(accroches).forEach((k) => {
    const id = k.split('|')[0];
    const liste = accroches[k].sort((p, q) => p.autre - q.autre || (p.l.id < q.l.id ? -1 : 1));
    const n = liste.length;
    liste.forEach((p, i) => {
      const f = n === 1 ? 0.5 : 0.14 + 0.72 * i / (n - 1);    // position relative sur la hauteur
      p.l[p.bout === 'de' ? '_fDe' : '_fVers'] = f;
    });
    void id;
  });

  /* ============ 4. Dessin ============ */

  // Guides et en-têtes de couche
  couches.forEach((c, i) => {
    const g = cree('g', { 'class': 'couche', 'data-couche': c.id }, gGuides);
    c._g = g;
    c._guide = cree('line', { 'class': 'couche-guide', y1: R.haut - 18, y2: R.bas + 6 }, g);
    c._num = texteSvg(g, { 'class': 'couche-num', 'text-anchor': 'middle', 'font-size': R.tCouche }, deux(c.num));
    c._nom = texteSvg(g, { 'class': 'couche-nom', 'text-anchor': 'middle', 'font-size': R.tCouche }, c.nom);
    void i;
  });

  // Pointes de flèche, une par sens de flux
  D.typesLiens.forEach((t) => {
    const m = cree('marker', {
      id: 'fl-' + t.id, viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerWidth: 8, markerHeight: 8,
      markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse'
    }, defs);
    cree('path', { d: 'M1,1.5 L9,5 L1,8.5', fill: 'none', stroke: cssVal('--flux-' + t.id), 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
  });

  // Flux
  liens.forEach((l) => {
    const t = types[l.type];
    const g = cree('g', { 'class': 'flux flux--' + l.type, 'data-id': l.id }, gFlux);
    l._g = g;
    l._trait = cree('path', { 'class': 'flux-trait' }, g);
    l._perles = cree('path', { 'class': 'flux-perles' }, g);
    l._zone = cree('path', { 'class': 'flux-zone' }, g);
    cree('title', null, l._zone).textContent = t.nom + ' · ' + blocs[l.de].titre + ' → ' + blocs[l.vers].titre + ' : ' + l.etiquette + ' (§ ' + l.source + ')';
    l._fleches = { fin: t.fleche !== 'aucune', debut: t.fleche === 'double' };
    l._zone.addEventListener('mouseenter', () => { etat.survol = { type: 'lien', id: l.id }; appliquerFocus(); });
    l._zone.addEventListener('mouseleave', () => { etat.survol = null; appliquerFocus(); });

    // Étiquette : pastille blanche avec un trait de la couleur du flux
    const texte = l.etiquette;
    const lw = largeur(texte, R.tEtiquette, 600) + 34;
    const lh = R.tEtiquette + 12;
    const ge = cree('g', { 'class': 'etiquette' }, gEtiquettes);
    cree('rect', { x: -lw / 2, y: -lh / 2, width: lw, height: lh, rx: lh / 2 }, ge);
    cree('line', { 'class': 'etq-trait', x1: -lw / 2 + 10, x2: -lw / 2 + 20, y1: 0, y2: 0, stroke: cssVal('--flux-' + l.type) }, ge);
    texteSvg(ge, { x: -lw / 2 + 26, y: 0.5, 'dominant-baseline': 'central', 'font-size': R.tEtiquette }, texte);
    l._etq = ge;
    l._etqTaille = { w: lw, h: lh };

    // Badge toujours visible : croix pour un flux hors service, « $ » pour un flux de coût
    if (l.type === 'off' || l.type === 'cout') {
      const gb = cree('g', { 'class': 'badge badge--' + l.type }, gEtiquettes);
      cree('circle', { r: 7.5 }, gb);
      if (l.type === 'off') cree('path', { d: 'M-2.6,-2.6 L2.6,2.6 M2.6,-2.6 L-2.6,2.6' }, gb);
      else texteSvg(gb, { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10, y: 0.5 }, '$');
      l._badge = gb;
    }
  });

  // Composants
  D.blocs.forEach((b) => {
    const g0 = base[b.id];
    if (!g0) return;
    const statut = b.statut || 'actif';
    const c = coucheParId[b.couche];
    const g = cree('g', {
      'class': 'noeud noeud--' + statut, 'data-id': b.id, tabindex: 0, role: 'button',
      'aria-label': b.titre + (b.chiffre ? ', ' + b.chiffre : '') + '. Couche ' + c.num + ', ' + c.nom +
        (statut !== 'actif' ? '. ' + D.statuts[statut].nom : '') + '. Entrée pour ouvrir la fiche.'
    }, gNoeuds);
    const interne = cree('g', { transform: 'translate(' + (-g0.w / 2) + ',' + (-g0.h / 2) + ')' }, g);
    cree('rect', { 'class': 'noeud-fond', width: g0.w, height: g0.h, rx: R.rayon, filter: statut === 'actif' || statut === 'panne' || statut === 'pause' ? 'url(#ombre)' : null }, interne);
    cree('circle', { 'class': 'noeud-pastille', cx: R.padH + 3, cy: R.padV + hT / 2, r: 3.5 }, interne);
    const gt = cree('g', { 'class': 'noeud-textes' }, interne);
    let y = R.padV;
    const xTexte = R.padH + 13;
    g0.lt.forEach((li) => { texteSvg(gt, { 'class': 'noeud-titre', x: xTexte, y: y + R.tTitre * 0.93, 'font-size': R.tTitre }, li); y += hT; });
    g0.lc.forEach((li) => { texteSvg(gt, { 'class': 'noeud-chiffre', x: xTexte, y: y + R.tChiffre * 0.95, 'font-size': R.tChiffre }, li); y += hC; });
    if (b.mesure) jaugeSvg(gt, b.mesure, xTexte, y + 5, g0.w - xTexte - R.padH, 4);
    b._g = g;
    b._textes = gt;

    g.addEventListener('click', (e) => { e.stopPropagation(); ouvrirFiche(b.id); });
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ouvrirFiche(b.id); } });
    g.addEventListener('mouseenter', () => { etat.survol = { type: 'bloc', id: b.id }; appliquerFocus(); });
    g.addEventListener('mouseleave', () => { etat.survol = null; appliquerFocus(); });
    g.addEventListener('focus', () => { if (g.matches(':focus-visible')) { etat.survol = { type: 'bloc', id: b.id }; appliquerFocus(); } });
    g.addEventListener('blur', () => { etat.survol = null; appliquerFocus(); });
  });

  /* ============ 5. Éclatement ============ */

  // À 0, les neuf couches se resserrent en un seul bloc ; à 1, elles se déploient.
  const CX = (R.gauche + R.droite) / 2;
  const CY = (R.haut + R.bas) / 2;
  const pos = {};
  function calculerPositions() {
    const e = adoucir(etat.eclat);
    const kx = 0.05 + 0.95 * e;
    // La taille des composants suit l'écart entre couches : ils ne se chevauchent jamais
    const s = borne(kx * pas * 0.9 / R.larg, 0.08, 1);
    const ky = Math.max(s, 0.08);
    Object.keys(base).forEach((id) => {
      const g0 = base[id];
      pos[id] = { x: CX + (g0.cx - CX) * kx, y: CY + (g0.cy - CY) * ky, s: s, w: g0.w * s, h: g0.h * s };
    });
    return { e: e, kx: kx, ky: ky, s: s };
  }
  function bout(id, cote, f) {
    const p = pos[id];
    return { x: p.x + cote * p.w / 2, y: p.y - p.h / 2 + p.h * f };
  }
  function trace(l) {
    const p1 = bout(l.de, l._cote.de, l._fDe);
    const p2 = bout(l.vers, l._cote.vers, l._fVers);
    if (l._cote.de === l._cote.vers) {
      const b = 18 + Math.abs(p2.y - p1.y) * 0.08;
      return 'M' + p1.x + ',' + p1.y + ' C' + (p1.x + b) + ',' + p1.y + ' ' + (p2.x + b) + ',' + p2.y + ' ' + p2.x + ',' + p2.y;
    }
    const sens = l._cote.de;
    const dx = Math.max(28, Math.abs(p2.x - p1.x) * 0.45);
    return 'M' + p1.x + ',' + p1.y + ' C' + (p1.x + sens * dx) + ',' + p1.y + ' ' + (p2.x - sens * dx) + ',' + p2.y + ' ' + p2.x + ',' + p2.y;
  }

  // Le monolithe : à 0 %, le système n'est qu'un programme (section 1 du document)
  const mono = {};
  (function () {
    const M = D.monolithe || {};
    mono.fond = cree('rect', { 'class': 'mono-fond', rx: 18 }, gMonolithe);
    mono.textes = cree('g', { 'class': 'mono-textes', 'text-anchor': 'middle' }, gMonolithe);
    mono.surtitre = texteSvg(mono.textes, { 'class': 'mono-surtitre', y: -58 }, (M.surtitre || '').toUpperCase());
    mono.titre = texteSvg(mono.textes, { 'class': 'mono-titre', y: -16 }, M.titre || '');
    mono.ligne = texteSvg(mono.textes, { 'class': 'mono-ligne', y: 16 }, M.ligne || '');
    mono.citation = texteSvg(mono.textes, { 'class': 'mono-citation', y: 50 }, M.citation || '');
    mono.source = texteSvg(mono.textes, { 'class': 'mono-source', y: 78 }, M.source ? '§ ' + M.source : '');
    // Neuf traits : les couches encore repliées
    mono.traits = couches.map((c, i) => cree('rect', { 'class': 'mono-trait', width: 3, height: 26, rx: 1.5, x: -60 + i * 15 - 1.5, y: 98 }, mono.textes));
  })();

  function majGeometrie() {
    const k = calculerPositions();
    const opaciteTexte = borne((k.e - 0.55) / 0.35, 0, 1);
    // Composants et flux apparaissent pendant que le monolithe s'efface
    const apparition = borne((k.e - 0.12) / 0.3, 0, 1);
    const effacement = 1 - borne(k.e / 0.32, 0, 1);
    gNoeuds.setAttribute('opacity', apparition);
    gFlux.setAttribute('opacity', apparition);
    gEtiquettes.setAttribute('opacity', apparition);
    gMonolithe.setAttribute('opacity', effacement);
    gMonolithe.setAttribute('visibility', effacement > 0.01 ? 'visible' : 'hidden');
    const mw = 520 + 300 * (1 - effacement);
    const mh = 300 + 120 * (1 - effacement);
    mono.fond.setAttribute('x', CX - mw / 2); mono.fond.setAttribute('y', CY - mh / 2);
    mono.fond.setAttribute('width', mw); mono.fond.setAttribute('height', mh);
    mono.textes.setAttribute('transform', 'translate(' + CX + ',' + (CY - 20) + ')');
    // Couches
    couches.forEach((c, i) => {
      const x = CX + (centreCouche(i) - CX) * k.kx;
      c._guide.setAttribute('x1', x); c._guide.setAttribute('x2', x);
      c._num.setAttribute('x', x); c._num.setAttribute('y', R.haut - 50);
      c._nom.setAttribute('x', x); c._nom.setAttribute('y', R.haut - 32);
      c._num.setAttribute('opacity', opaciteTexte);
      c._nom.setAttribute('opacity', borne((k.e - 0.82) / 0.18, 0, 1));   // noms : seulement une fois déployés
      c._guide.setAttribute('opacity', opaciteTexte);
    });
    // Composants
    D.blocs.forEach((b) => {
      const p = pos[b.id];
      if (!p) return;
      b._g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') scale(' + p.s + ')');
      b._textes.setAttribute('opacity', opaciteTexte);
    });
    // Flux, étiquettes, badges
    liens.forEach((l) => {
      const d = trace(l);
      l._trait.setAttribute('d', d);
      l._perles.setAttribute('d', d);
      l._zone.setAttribute('d', d);
      const L = l._trait.getTotalLength();
      const pt = l._trait.getPointAtLength(L * (l.pos !== undefined ? l.pos : 0.5));
      if (l._badge) l._badge.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
    });
    if (cheminsJeton.length && !etat.lecture.enCours) figerJeton();
    placerEtiquettes();
  }

  // Chaque étiquette visible cherche, le long de son flux, une place qui ne recouvre
  // ni un composant ni une autre étiquette. À défaut, elle reste au milieu.
  const CANDIDATS = [0.5, 0.4, 0.6, 0.3, 0.7, 0.22, 0.78, 0.15, 0.85];
  let etiquettesForcees = new Set();   // flux survolé directement : son étiquette s'affiche toujours
  function placerEtiquettes() {
    const toutes = svg.classList.contains('etiquettes-toutes');
    const obstacles = [];
    D.blocs.forEach((b) => {
      const p = pos[b.id];
      if (!p || !blocVisible(b)) return;
      obstacles.push({ x1: p.x - p.w / 2 - 4, x2: p.x + p.w / 2 + 4, y1: p.y - p.h / 2 - 3, y2: p.y + p.h / 2 + 3 });
    });
    const posees = [];
    const croise = (r, liste) => liste.some((o) => r.x1 < o.x2 && r.x2 > o.x1 && r.y1 < o.y2 && r.y2 > o.y1);
    const touche = (r) => croise(r, obstacles) || croise(r, posees);
    liens.forEach((l) => {
      const visible = (toutes && !svg.classList.contains('a-focus')) || l._etq.classList.contains('visible');
      if (!visible || !lienVisible(l)) return;
      const L = l._trait.getTotalLength();
      const { w, h } = l._etqTaille;
      const essais = l.pos !== undefined ? [l.pos].concat(CANDIDATS) : CANDIDATS;
      // 1re passe : ni composant ni étiquette ; 2e passe : au moins aucune autre étiquette ;
      // 3e passe : décalage vertical par pas d'une hauteur d'étiquette
      const rect = (pt, dy) => ({ x1: pt.x - w / 2, x2: pt.x + w / 2, y1: pt.y + dy - h / 2, y2: pt.y + dy + h / 2 });
      const points = essais.map((t) => l._trait.getPointAtLength(L * t));
      let choix = null;
      for (let i = 0; i < points.length && !choix; i++) if (!touche(rect(points[i], 0))) choix = { pt: points[i], dy: 0 };
      // Pas de place libre : l'étiquette se retire, sauf si ce flux est survolé directement
      const forcee = etiquettesForcees.has(l.id);
      l._etq.classList.toggle('sans-place', !choix && !forcee);
      if (!choix && !forcee) return;
      for (let i = 0; i < points.length && !choix; i++) if (!croise(rect(points[i], 0), posees)) choix = { pt: points[i], dy: 0 };
      for (let k = 1; k < 8 && !choix; k++) {
        [k, -k].forEach((sgn) => { if (!choix && !croise(rect(points[0], sgn * (h + 3)), posees)) choix = { pt: points[0], dy: sgn * (h + 3) }; });
      }
      if (!choix) choix = { pt: points[0], dy: 0 };
      l._etq.setAttribute('transform', 'translate(' + choix.pt.x + ',' + (choix.pt.y + choix.dy) + ')');
      posees.push(rect(choix.pt, choix.dy));
    });
  }

  const curseur = document.getElementById('eclate');
  const valeurEclat = document.getElementById('eclate-valeur');
  let animIntro = null;
  function reglerEclat(t, depuisCurseur) {
    etat.eclat = borne(t, 0, 1);
    const pc = Math.round(etat.eclat * 100);
    if (!depuisCurseur) curseur.value = pc;
    curseur.style.setProperty('--rempli', pc + '%');
    valeurEclat.textContent = pc + ' %';
    majGeometrie();
  }
  curseur.addEventListener('input', () => { cancelAnimationFrame(animIntro); reglerEclat(curseur.value / 100, true); });
  function animerEclat(de, vers, duree) {
    cancelAnimationFrame(animIntro);
    if (mouvementReduit) { reglerEclat(vers); return; }
    const t0 = performance.now();
    const pasAnim = (t) => {
      const f = borne((t - t0) / duree, 0, 1);
      reglerEclat(de + (vers - de) * f);
      if (f < 1) animIntro = requestAnimationFrame(pasAnim);
    };
    animIntro = requestAnimationFrame(pasAnim);
  }

  /* ============ 6. Chemins et mise en évidence ============ */

  const blocVisible = (b) => !etat.couchesOff.has(b.couche);
  const lienVisible = (l) => blocVisible(blocs[l.de]) && blocVisible(blocs[l.vers]) && !etat.typesOff.has(l.type);
  // Un flux « avance » s'il va vers la droite ou reste dans sa couche (ex. catalogue MCP → Figma)
  const avance = (l) => rangCouche[blocs[l.vers].couche] >= rangCouche[blocs[l.de].couche];
  const prolonge = (l) => avance(l) && lienVisible(l) && l.type !== 'off';   // un flux hors service ne prolonge pas un chemin

  // Amont : on remonte jusqu'aux entrées. Aval : on descend, en s'arrêtant aux pivots
  // (orchestrateur, catalogue MCP) pour ne pas allumer toute la carte.
  function amont(id, B, Ls) {
    const pile = [id];
    while (pile.length) {
      const x = pile.pop();
      (entrants[x] || []).forEach((l) => {
        if (!prolonge(l)) return;
        Ls.add(l.id);
        if (!B.has(l.de)) { B.add(l.de); pile.push(l.de); }
      });
    }
  }
  function aval(id, B, Ls) {
    const pile = [id];
    while (pile.length) {
      const x = pile.pop();
      if (x !== id && blocs[x].pivot) continue;
      (sortants[x] || []).forEach((l) => {
        if (!prolonge(l)) return;
        Ls.add(l.id);
        if (!B.has(l.vers)) { B.add(l.vers); pile.push(l.vers); }
      });
    }
  }
  function cheminBloc(id) {
    const B = new Set([id]);
    const Ls = new Set();
    amont(id, B, Ls);
    aval(id, B, Ls);
    (entrants[id] || []).concat(sortants[id] || []).forEach((l) => {
      if (!lienVisible(l)) return;
      Ls.add(l.id); B.add(l.de); B.add(l.vers);
    });
    return { B: B, Ls: Ls };
  }
  function cheminLien(l) {
    const B = new Set([l.de, l.vers]);
    const Ls = new Set([l.id]);
    amont(l.de, B, Ls);
    aval(l.vers, B, Ls);
    return { B: B, Ls: Ls, etiquettes: new Set([l.id]) };
  }

  function focusCourant() {
    const s = etat.survol;
    if (s) {
      if (s.type === 'lien') return cheminLien(lienParId[s.id]);
      if (s.type === 'bloc') return cheminBloc(s.id);
      if (s.type === 'couche') {
        const B = new Set(D.blocs.filter((b) => b.couche === s.id).map((b) => b.id));
        const Ls = new Set(liens.filter((l) => lienVisible(l) && (B.has(l.de) || B.has(l.vers))).map((l) => l.id));
        return { B: B, Ls: Ls, etiquettes: new Set() };
      }
      if (s.type === 'flux') {
        const Ls = new Set(liens.filter((l) => l.type === s.id && lienVisible(l)).map((l) => l.id));
        const B = new Set();
        Ls.forEach((id) => { B.add(lienParId[id].de); B.add(lienParId[id].vers); });
        return { B: B, Ls: Ls };
      }
    }
    if (etat.trouves) return { B: etat.trouves, Ls: new Set(), etiquettes: new Set() };
    if (etat.selection) return cheminBloc(etat.selection);
    if (etat.lecture.active) {
      const e = etapes[etat.lecture.index];
      return { B: new Set(e.blocs), Ls: new Set(e.liens) };
    }
    return null;
  }

  function appliquerFocus() {
    const f = focusCourant();
    svg.classList.toggle('a-focus', !!f);
    // Étiquettes affichées : celles du chemin, sauf si le chemin est très long
    const etq = f ? (f.etiquettes || (f.Ls.size <= 12 ? f.Ls : new Set())) : new Set();
    etiquettesForcees = f && f.etiquettes ? f.etiquettes : new Set();
    D.blocs.forEach((b) => {
      b._g.classList.toggle('en-avant', !!f && f.B.has(b.id));
      b._g.classList.toggle('selectionne', etat.selection === b.id);
      b._g.classList.toggle('trouve', !!etat.trouves && etat.trouves.has(b.id));
    });
    liens.forEach((l) => {
      const actif = !!f && f.Ls.has(l.id);
      l._g.classList.toggle('actif', actif);
      l._trait.setAttribute('marker-end', actif && l._fleches.fin ? 'url(#fl-' + l.type + ')' : '');
      l._trait.setAttribute('marker-start', actif && l._fleches.debut ? 'url(#fl-' + l.type + ')' : '');
      l._etq.classList.toggle('visible', etq.has(l.id));
      if (l._badge) l._badge.classList.toggle('en-avant', actif);
    });
    // Les flux actifs passent au premier plan
    liens.forEach((l) => { if (f && f.Ls.has(l.id)) gFlux.appendChild(l._g); });
    placerEtiquettes();
  }

  /* ============ 7. Panneau de gauche ============ */

  const listeCouches = document.getElementById('liste-couches');
  const listeFlux = document.getElementById('liste-flux');
  const panneauTitre = document.getElementById('panneau-titre');
  const panneauCompteur = document.getElementById('panneau-compteur');
  const piedCompte = document.getElementById('pied-compte');
  let onglet = 'couches';

  function interrupteur(actif, libelle, quandClic) {
    const b = el('button', 'inter');
    b.type = 'button';
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', String(actif));
    b.setAttribute('aria-label', libelle);
    b.addEventListener('click', quandClic);
    return b;
  }
  function echantillon(type) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 28 12');
    s.setAttribute('class', 'echantillon ech--' + type);
    s.setAttribute('aria-hidden', 'true');
    cree('path', { d: 'M1,6 L27,6' }, s);
    return s;
  }
  function construirePanneau() {
    listeCouches.innerHTML = '';
    couches.forEach((c) => {
      const n = D.blocs.filter((b) => b.couche === c.id).length;
      const actif = !etat.couchesOff.has(c.id);
      const li = el('li', 'ligne' + (actif ? '' : ' eteinte'), null, listeCouches);
      el('span', 'ligne-num', deux(c.num), li);
      const nom = el('span', 'ligne-nom', c.nom, li);
      nom.title = c.nomLong + ' (§ ' + c.source + ')';
      el('span', 'ligne-compte', String(n), li);
      li.appendChild(interrupteur(actif, 'Afficher la couche ' + c.nom, () => {
        if (actif) etat.couchesOff.add(c.id); else etat.couchesOff.delete(c.id);
        appliquerFiltres();
      }));
      li.addEventListener('mouseenter', () => { etat.survol = { type: 'couche', id: c.id }; appliquerFocus(); });
      li.addEventListener('mouseleave', () => { etat.survol = null; appliquerFocus(); });
    });
    listeFlux.innerHTML = '';
    D.typesLiens.forEach((t) => {
      const n = liens.filter((l) => l.type === t.id).length;
      const actif = !etat.typesOff.has(t.id);
      const li = el('li', 'ligne' + (actif ? '' : ' eteinte'), null, listeFlux);
      li.appendChild(echantillon(t.id));
      const nom = el('span', 'ligne-nom', t.nom, li);
      nom.title = t.description;
      el('span', 'ligne-compte', String(n), li);
      li.appendChild(interrupteur(actif, 'Afficher les flux ' + t.nom, () => {
        if (actif) etat.typesOff.add(t.id); else etat.typesOff.delete(t.id);
        appliquerFiltres();
      }));
      li.addEventListener('mouseenter', () => { etat.survol = { type: 'flux', id: t.id }; appliquerFocus(); });
      li.addEventListener('mouseleave', () => { etat.survol = null; appliquerFocus(); });
    });
    const nb = D.blocs.filter(blocVisible).length;
    const nl = liens.filter(lienVisible).length;
    panneauTitre.textContent = onglet === 'couches' ? 'Couches' : 'Flux';
    panneauCompteur.textContent = onglet === 'couches' ? couches.length : D.typesLiens.length;
    piedCompte.textContent = onglet === 'couches' ? nb + ' composants visibles' : nl + ' flux visibles';
  }
  document.querySelectorAll('.segment').forEach((s) => {
    s.addEventListener('click', () => {
      onglet = s.dataset.onglet;
      document.querySelectorAll('.segment').forEach((x) => x.setAttribute('aria-selected', String(x === s)));
      listeCouches.hidden = onglet !== 'couches';
      listeFlux.hidden = onglet !== 'flux';
      construirePanneau();
    });
  });
  document.getElementById('tout-afficher').addEventListener('click', () => {
    etat.couchesOff.clear();
    etat.typesOff.clear();
    appliquerFiltres();
  });

  function appliquerFiltres() {
    couches.forEach((c) => c._g.classList.toggle('eteinte', etat.couchesOff.has(c.id)));
    D.blocs.forEach((b) => b._g.classList.toggle('masque', !blocVisible(b)));
    liens.forEach((l) => {
      const v = lienVisible(l);
      l._g.classList.toggle('masque', !v);
      l._etq.classList.toggle('masque', !v);
      if (l._badge) l._badge.classList.toggle('masque', !v);
    });
    if (etat.selection && !blocVisible(blocs[etat.selection])) fermerCarte();
    construirePanneau();
    appliquerFocus();
  }

  /* ============ 8. Carte de droite : fiche ============ */

  const carteDroite = document.getElementById('carte-droite');
  const ICONE_FERMER = '<svg viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12"/></svg>';
  let vueAvantCarte = null;

  function boutonFermer(quoi) {
    const b = el('button', 'fermer', null, carteDroite);
    b.type = 'button';
    b.setAttribute('aria-label', 'Fermer (Échap)');
    b.innerHTML = ICONE_FERMER;
    b.addEventListener('click', quoi);
    return b;
  }

  function ouvrirFiche(id) {
    const b = blocs[id];
    if (!b) return;
    if (etat.lecture.active) quitterLecture(true);
    etat.selection = id;
    const c = coucheParId[b.couche];
    const statut = b.statut || 'actif';
    carteDroite.innerHTML = '';
    const fermer = boutonFermer(fermerCarte);
    el('p', 'micro', 'Couche ' + deux(c.num) + ' · ' + c.nom, carteDroite);
    el('h2', 'fiche-titre', b.titre, carteDroite);
    if (b.chiffre) el('p', 'fiche-chiffre', b.chiffre, carteDroite);
    const puces = el('div', 'puces', null, carteDroite);
    const ps = el('span', 'puce puce--' + statut, null, puces);
    el('i', null, null, ps);
    ps.appendChild(document.createTextNode(D.statuts[statut].nom));
    el('span', 'puce', '§ ' + b.source, puces);

    const dl = el('dl', 'rangs', null, carteDroite);
    [['Rôle', b.fait], ['Machine', b.machine], ['Entrée', b.entre], ['Sortie', b.sort], ['Coût, latence', b.cout], ['Si ça tombe', b.casse]]
      .forEach((r) => {
        if (!r[1]) return;
        const d = el('div', 'rang', null, dl);
        el('dt', null, r[0], d);
        el('dd', null, r[1], d);
      });
    if (b.mesure) {
      const m = b.mesure;
      const total = totalMesure(m);
      const bloc = el('div', 'mesure', null, carteDroite);
      const tete = el('div', 'preuve-tete', null, bloc);
      el('p', 'micro', 'Mesure · ' + m.titre, tete);
      el('span', 'micro', '§ ' + m.source, tete);
      const barre = el('div', 'mesure-barre', null, bloc);
      m.segments.forEach((seg, i) => {
        const s0 = el('span', null, null, barre);
        s0.style.flexGrow = seg.v;
        s0.style.background = teinte(seg, i);
      });
      const reste = total - m.segments.reduce((a, x) => a + x.v, 0);
      if (reste > 0) { const r0 = el('span', 'mesure-reste', null, barre); r0.style.flexGrow = reste; }
      const leg = el('ul', 'mesure-legende', null, bloc);
      m.segments.forEach((seg, i) => {
        const li = el('li', null, null, leg);
        const pastille = el('i', null, null, li);
        pastille.style.background = teinte(seg, i);
        el('span', null, seg.l, li);
        el('b', null, seg.v.toLocaleString('fr-FR') + ' ' + m.unite, li);
      });
      if (m.max) {
        const li = el('li', 'mesure-max', null, leg);
        el('i', null, null, li);
        el('span', null, 'plafond', li);
        el('b', null, m.max.toLocaleString('fr-FR') + ' ' + m.unite, li);
      }
    }
    if (b.note) el('p', 'note', 'À discuter · ' + b.note, carteDroite);

    if (b.preuve) {
      const p = el('div', 'preuve', null, carteDroite);
      const tete = el('div', 'preuve-tete', null, p);
      el('p', 'micro', 'Preuve · ' + b.preuve.titre, tete);
      el('span', 'micro', '§ ' + b.preuve.source, tete);
      el('pre', null, b.preuve.lignes.join('\n'), p);
      if (b.preuve.note) el('p', 'preuve-note', b.preuve.note, p);
    }

    const voisins = (entrants[id] || []).concat(sortants[id] || []).filter(lienVisible);
    if (voisins.length) {
      el('p', 'micro', 'Connexions · ' + voisins.length, carteDroite).style.marginTop = '18px';
      const ul = el('ul', 'connexions', null, carteDroite);
      ul.style.marginTop = '6px';
      voisins.forEach((l) => {
        const autre = l.de === id ? l.vers : l.de;
        const li = el('li', null, null, ul);
        const btn = el('button', 'connexion', null, li);
        btn.type = 'button';
        btn.appendChild(echantillon(l.type));
        const t = el('span', null, (l.de === id ? '→ ' : '← ') + blocs[autre].titre, btn);
        el('small', null, types[l.type].nom + ' · ' + l.etiquette, t);
        btn.addEventListener('click', () => ouvrirFiche(autre));
        btn.addEventListener('mouseenter', () => { etat.survol = { type: 'lien', id: l.id }; appliquerFocus(); });
        btn.addEventListener('mouseleave', () => { etat.survol = null; appliquerFocus(); });
      });
    }

    carteDroite.hidden = false;
    scene.classList.add('carte-ouverte');
    carteDroite.scrollTop = 0;
    if (!vueAvantCarte) vueAvantCarte = Object.assign({}, vue);
    cadrer(cheminBloc(id).B, id);
    appliquerFocus();
    fermer.focus({ preventScroll: true });
    adresse('bloc=' + id);
  }

  function fermerCarte() {
    if (carteDroite.hidden) return;
    const id = etat.selection;
    carteDroite.hidden = true;
    scene.classList.remove('carte-ouverte');
    etat.selection = null;
    if (vueAvantCarte) { vue = vueAvantCarte; vueAvantCarte = null; appliquerVue(); }
    appliquerFocus();
    if (id && blocs[id]._g) blocs[id]._g.focus({ preventScroll: true });
    adresse('');
  }

  /* ============ 9. Parcours ============ */

  const btnLecture = document.getElementById('btn-lecture');
  let animJeton = null;
  let cheminsJeton = [];

  function demarrerLecture(i, jouer) {
    if (!carteDroite.hidden && etat.selection) fermerCarte();
    if (!vueAvantCarte) vueAvantCarte = Object.assign({}, vue);
    etat.lecture.active = true;
    allerEtape(i);
    if (jouer) reprendre(); else pause();
  }
  function quitterLecture(silencieux) {
    clearTimeout(etat.lecture.minuterie);
    cancelAnimationFrame(animJeton);
    etat.lecture.active = false;
    etat.lecture.enCours = false;
    cheminsJeton = [];
    gJeton.setAttribute('visibility', 'hidden');
    btnLecture.classList.remove('en-cours');
    if (!silencieux) {
      carteDroite.hidden = true;
      scene.classList.remove('carte-ouverte');
      if (vueAvantCarte) { vue = vueAvantCarte; vueAvantCarte = null; appliquerVue(); }
      adresse('');
    }
    appliquerFocus();
  }
  function reprendre() {
    etat.lecture.enCours = true;
    planifier();
    animerJeton(etapes[etat.lecture.index].liens, true);
    majEtatLecture();
  }
  function pause() {
    etat.lecture.enCours = false;
    clearTimeout(etat.lecture.minuterie);
    majEtatLecture();
  }
  function basculerLecture() {
    if (!etat.lecture.active) demarrerLecture(0, true);
    else if (etat.lecture.enCours) { pause(); figerJeton(); }
    else reprendre();
  }
  function planifier() {
    clearTimeout(etat.lecture.minuterie);
    if (!etat.lecture.enCours) return;
    etat.lecture.minuterie = setTimeout(() => {
      if (etat.lecture.index < etapes.length - 1) { allerEtape(etat.lecture.index + 1); planifier(); }
      else { pause(); figerJeton(); }
    }, (D.scenario.dureeEtape || 10) * 1000);
  }
  function majEtatLecture() {
    btnLecture.classList.toggle('en-cours', etat.lecture.enCours);
    btnLecture.setAttribute('aria-label', etat.lecture.enCours ? 'Mettre le parcours en pause' : 'Lancer le parcours');
    const etiq = carteDroite.querySelector('.etat');
    if (etiq) etiq.textContent = etat.lecture.enCours ? 'Lecture · ' + (D.scenario.dureeEtape || 10) + ' s par étape' : 'En pause';
    const bp = carteDroite.querySelector('.bouton-lecture');
    if (bp) bp.innerHTML = etat.lecture.enCours
      ? '<svg viewBox="0 0 14 14"><path d="M3 2h3v10H3zM8 2h3v10H8z"/></svg>Pause'
      : '<svg viewBox="0 0 14 14"><path d="M3.5 2v10l8-5z"/></svg>Lire';
  }

  function allerEtape(i) {
    i = borne(i, 0, etapes.length - 1);
    etat.lecture.index = i;
    const e = etapes[i];
    carteDroite.innerHTML = '';
    boutonFermer(() => quitterLecture(false));
    el('p', 'micro', 'Parcours · ' + D.scenario.titre, carteDroite);
    const num = el('div', 'etape-num', null, carteDroite);
    el('b', null, deux(i + 1), num);
    el('span', null, '/ ' + deux(etapes.length), num);
    el('h2', 'etape-titre', e.titre, carteDroite);
    el('p', 'etape-texte', e.texte, carteDroite);
    const dl = el('dl', 'rangs', null, carteDroite);
    [['Où', e.ou], ['Fichier', e.fichier], ['Source', '§ ' + e.source]].forEach((r) => {
      const d = el('div', 'rang', null, dl);
      el('dt', null, r[0], d);
      el('dd', null, r[1], d);
    });
    const prog = el('div', 'progression', null, carteDroite);
    etapes.forEach((x, k) => {
      const b = el('button', k < i ? 'fait' : null, null, prog);
      b.type = 'button';
      b.title = deux(k + 1) + ' · ' + x.titre;
      b.setAttribute('aria-label', 'Étape ' + (k + 1) + ' : ' + x.titre);
      if (k === i) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', () => { pause(); allerEtape(k); });
    });
    const cmd = el('div', 'commandes-etape', null, carteDroite);
    const prec = el('button', 'bouton', '←', cmd);
    prec.type = 'button';
    prec.setAttribute('aria-label', 'Étape précédente');
    prec.addEventListener('click', () => { pause(); allerEtape(etat.lecture.index - 1); });
    const lire = el('button', 'bouton bouton--plein bouton-lecture', null, cmd);
    lire.type = 'button';
    lire.addEventListener('click', basculerLecture);
    const suiv = el('button', 'bouton', '→', cmd);
    suiv.type = 'button';
    suiv.setAttribute('aria-label', 'Étape suivante');
    suiv.addEventListener('click', () => { pause(); allerEtape(etat.lecture.index + 1); });
    el('span', 'etat', '', cmd);
    carteDroite.hidden = false;
    scene.classList.add('carte-ouverte');
    majEtatLecture();
    cadrer(new Set(e.blocs));
    appliquerFocus();
    animerJeton(e.liens, etat.lecture.enCours);
    adresse('etape=' + (i + 1));
  }

  // Le jeton parcourt les flux de l'étape l'un après l'autre ; il boucle pendant la lecture.
  function animerJeton(ids, boucle) {
    cancelAnimationFrame(animJeton);
    cheminsJeton = ids.map((id) => lienParId[id]).filter((l) => l && lienVisible(l)).map((l) => l._trait);
    if (!cheminsJeton.length) { gJeton.setAttribute('visibility', 'hidden'); return; }
    gJeton.setAttribute('visibility', 'visible');
    placerJeton(cheminsJeton[0], 0);
    if (mouvementReduit) { figerJeton(); return; }
    const n = cheminsJeton.length;
    let t0 = performance.now();
    const avancer = (t) => {
      let k = (t - t0) / R.dureeLien;
      if (k >= n + 0.6) {
        if (boucle && etat.lecture.enCours) { t0 = t; k = 0; } else { figerJeton(); return; }
      }
      const i = Math.min(Math.floor(k), n - 1);
      placerJeton(cheminsJeton[i], adoucir(Math.min(1, k - i)));
      animJeton = requestAnimationFrame(avancer);
    };
    animJeton = requestAnimationFrame(avancer);
  }
  function placerJeton(chemin, f) {
    const pt = chemin.getPointAtLength(chemin.getTotalLength() * f);
    gJeton.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
  }
  function figerJeton() {
    cancelAnimationFrame(animJeton);
    if (cheminsJeton.length) placerJeton(cheminsJeton[cheminsJeton.length - 1], 1);
  }
  btnLecture.addEventListener('click', basculerLecture);

  /* ============ 10. Recherche ============ */

  const champ = document.getElementById('recherche');
  champ.addEventListener('input', () => {
    const q = sansAccents(champ.value.trim());
    if (!q) { etat.trouves = null; appliquerFocus(); return; }
    etat.trouves = new Set(D.blocs.filter((b) => blocVisible(b) &&
      sansAccents(b.titre + ' ' + (b.chiffre || '') + ' ' + b.id + ' ' + (b.machine || '')).indexOf(q) >= 0).map((b) => b.id));
    appliquerFocus();
  });
  champ.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && etat.trouves && etat.trouves.size) {
      const id = Array.from(etat.trouves)[0];
      champ.value = ''; etat.trouves = null; champ.blur();
      ouvrirFiche(id);
    } else if (e.key === 'Escape') {
      champ.value = ''; etat.trouves = null; champ.blur(); appliquerFocus();
      e.stopPropagation();
    }
  });

  /* ============ 11. Zoom, déplacement, cadrage ============ */

  const vueInitiale = { x: 0, y: 0, w: 1920, h: 1080 };
  let vue = Object.assign({}, vueInitiale);
  function appliquerVue() { svg.setAttribute('viewBox', vue.x + ' ' + vue.y + ' ' + vue.w + ' ' + vue.h); }
  function versCarte(cx, cy) {
    const p = svg.createSVGPoint();
    p.x = cx; p.y = cy;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function zoomer(f, cx, cy) {
    if (cx === undefined) { cx = vue.x + vue.w / 2; cy = vue.y + vue.h / 2; }
    const w = borne(vue.w / f, 1920 / 4, 1920 * 1.4);
    const k = w / vue.w;
    vue = { x: cx - (cx - vue.x) * k, y: cy - (cy - vue.y) * k, w: w, h: vue.h * k };
    vueAvantCarte = null;
    appliquerVue();
  }
  function recentrer() { vue = Object.assign({}, vueInitiale); vueAvantCarte = null; appliquerVue(); }

  // Si des composants passent sous la carte de droite, la carte glisse vers la gauche
  // (zone visible : entre le panneau de gauche et la carte de droite).
  function cadrer(ids) {
    const base0 = vueAvantCarte || vue;
    vue = Object.assign({}, base0);
    const liste = Array.from(ids).filter((id) => pos[id] && blocVisible(blocs[id]));
    if (!liste.length) { appliquerVue(); return; }
    const k = 1920 / vue.w;
    const gauche = Math.min.apply(null, liste.map((id) => pos[id].x - pos[id].w / 2));
    const droite = Math.max.apply(null, liste.map((id) => pos[id].x + pos[id].w / 2));
    const ecranG = (gauche - vue.x) * k;
    const ecranD = (droite - vue.x) * k;
    const zoneG = 60;      // le panneau de gauche s'efface quand une carte est ouverte
    const zoneD = 1920 - 88 - 420 - 40;
    if (ecranD > zoneD || ecranG < zoneG) {
      const largeurZone = zoneD - zoneG;
      const largeurSel = ecranD - ecranG;
      const cible = largeurSel <= largeurZone ? zoneG + (largeurZone - largeurSel) / 2 : zoneG;
      vue.x += (ecranG - cible) / k;
    }
    appliquerVue();
  }

  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = versCarte(e.clientX, e.clientY);
    zoomer(Math.pow(1.0018, -e.deltaY), p.x, p.y);
  }, { passive: false });
  let glisse = null;
  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.noeud')) return;
    glisse = { x: e.clientX, y: e.clientY, vx: vue.x, vy: vue.y, bouge: false };
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!glisse) return;
    const dx = e.clientX - glisse.x;
    const dy = e.clientY - glisse.y;
    if (!glisse.bouge && Math.hypot(dx, dy) < 4) return;
    glisse.bouge = true;
    svg.classList.add('glisse');
    const a = svg.getScreenCTM().a;
    vue.x = glisse.vx - dx / a;
    vue.y = glisse.vy - dy / a;
    vueAvantCarte = null;
    appliquerVue();
  });
  svg.addEventListener('pointerup', () => {
    if (glisse && !glisse.bouge && etat.selection) fermerCarte();   // clic sur le fond : ferme la fiche
    glisse = null;
    svg.classList.remove('glisse');
  });
  document.getElementById('btn-zoom-plus').addEventListener('click', () => zoomer(1.25));
  document.getElementById('btn-zoom-moins').addEventListener('click', () => zoomer(0.8));
  document.getElementById('btn-zoom-zero').addEventListener('click', recentrer);
  // Panneau des couches et des flux : replié par défaut
  const btnPanneau = document.getElementById('btn-panneau');
  btnPanneau.addEventListener('click', () => {
    const ouvert = !scene.classList.contains('panneau-ouvert');
    scene.classList.toggle('panneau-ouvert', ouvert);
    btnPanneau.setAttribute('aria-pressed', String(ouvert));
  });
  const btnEtq = document.getElementById('btn-etiquettes');
  btnEtq.addEventListener('click', () => {
    const v = btnEtq.getAttribute('aria-pressed') !== 'true';
    btnEtq.setAttribute('aria-pressed', String(v));
    svg.classList.toggle('etiquettes-toutes', v);
    placerEtiquettes();
  });

  /* ============ 12. Export PNG ============ */

  // Les styles viennent d'une feuille externe : on les recopie en ligne sur le clone.
  const PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap',
    'stroke-linejoin', 'stroke-opacity', 'opacity', 'display', 'visibility', 'font-family', 'font-size', 'font-weight',
    'letter-spacing', 'text-transform', 'text-anchor', 'dominant-baseline'];
  function copierStyles(src, dst) {
    if (src.nodeType !== 1) return;
    const cs = getComputedStyle(src);
    dst.setAttribute('style', PROPS.map((p) => p + ':' + cs.getPropertyValue(p)).join(';'));
    for (let i = 0; i < src.children.length; i++) copierStyles(src.children[i], dst.children[i]);
  }
  function exporterPNG() {
    const E = 2;
    const W = 1920 * E;
    const H = 1080 * E;
    const clone = svg.cloneNode(true);
    copierStyles(svg, clone);
    clone.setAttribute('xmlns', NS);
    clone.setAttribute('width', W);
    clone.setAttribute('height', H);
    // Les majuscules CSS ne passent pas dans l'image : on les applique au texte
    clone.querySelectorAll('.couche-nom').forEach((t) => { t.textContent = t.textContent.toUpperCase(); });
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(W * 0.58, H * 0.5, 0, W * 0.58, H * 0.5, W * 0.6);
      grad.addColorStop(0, cssVal('--halo'));
      grad.addColorStop(0.7, cssVal('--scene'));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      // En-tête de l'image
      const police = cssVal('--police');
      ctx.fillStyle = cssVal('--encre-3');
      ctx.font = '600 ' + 12 * E + 'px ' + police;
      ctx.fillText((D.meta.surtitre || '').toUpperCase(), 40 * E, 46 * E);
      ctx.fillStyle = cssVal('--encre');
      ctx.font = '650 ' + 44 * E + 'px ' + police;
      ctx.fillText(D.meta.titre, 40 * E, 96 * E);
      ctx.fillStyle = cssVal('--encre-3');
      ctx.font = 14 * E + 'px ' + police;
      ctx.fillText('Source : ' + D.meta.sourceCourte, 40 * E, 124 * E);
      if (etat.lecture.active) {
        const e = etapes[etat.lecture.index];
        ctx.fillStyle = cssVal('--encre');
        ctx.font = '650 ' + 26 * E + 'px ' + police;
        ctx.fillText(deux(etat.lecture.index + 1) + ' · ' + e.titre, 40 * E, 1020 * E);
        ctx.fillStyle = cssVal('--encre-2');
        ctx.font = 15 * E + 'px ' + police;
        ctx.fillText(e.ou + '  ·  ' + e.fichier, 40 * E, 1048 * E);
      }
      c.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'hermes-atlas-' + (etat.lecture.active ? 'etape-' + (etat.lecture.index + 1) : etat.selection ? etat.selection : 'vue') + '.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  }
  document.getElementById('btn-export').addEventListener('click', exporterPNG);

  /* ============ 13. Clavier, adresse, démarrage ============ */

  function adresse(fragment) {
    try { history.replaceState(null, '', fragment ? '#' + fragment : location.pathname + location.search); }
    catch (err) { /* sans conséquence */ }
  }

  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const saisie = t && (t.tagName === 'INPUT' && t.type !== 'range');
    if (saisie) return;
    const dansBouton = t && (t.tagName === 'BUTTON');
    if (e.key === ' ' && !dansBouton) { e.preventDefault(); basculerLecture(); }
    else if (e.key === 'Escape') {
      if (etat.lecture.active) quitterLecture(false);
      else if (etat.selection) fermerCarte();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (t && t.type === 'range') return;
      if (!etat.lecture.active) { if (e.key === 'ArrowRight') demarrerLecture(0, false); return; }
      e.preventDefault();
      pause();
      allerEtape(etat.lecture.index + (e.key === 'ArrowRight' ? 1 : -1));
    } else if (e.key === '0' && !e.metaKey && !e.ctrlKey) recentrer();
    else if ((e.key === '+' || e.key === '=') && !e.metaKey && !e.ctrlKey) zoomer(1.25);
    else if (e.key === '-' && !e.metaKey && !e.ctrlKey) zoomer(0.8);
    else if (e.key === '/') { e.preventDefault(); champ.focus(); }
  });

  // Textes de la scène
  document.getElementById('surtitre').textContent = D.meta.surtitre || '';
  document.getElementById('titre').textContent = D.meta.titre;
  document.title = D.meta.titre;
  const sl = document.getElementById('sous-ligne');
  [[D.blocs.length, ' composants'], [couches.length, ' couches'], [liens.length, ' flux'], [etapes.length, ' étapes de parcours']]
    .forEach((p, i) => {
      if (i) sl.appendChild(document.createTextNode('  ·  '));
      el('b', null, String(p[0]), sl);
      sl.appendChild(document.createTextNode(p[1]));
    });
  document.getElementById('source').textContent = 'Source : ' + D.meta.sourceCourte;

  appliquerVue();
  construirePanneau();

  // Adresse d'arrivée : #bloc=bl, #etape=8, #eclat=40 (pour préparer un cours ou une capture)
  const params = new URLSearchParams(location.hash.slice(1));
  const eclatDemande = params.get('eclat');
  if (eclatDemande !== null || params.get('bloc') || params.get('etape') || mouvementReduit) {
    reglerEclat(eclatDemande !== null ? parseInt(eclatDemande, 10) / 100 : 1);
  } else {
    // À l'ouverture : le programme se déploie en neuf couches
    reglerEclat(0);
    setTimeout(() => animerEclat(0, 1, R.dureeIntro), 350);
  }
  appliquerFiltres();
  if (params.get('bloc') && blocs[params.get('bloc')]) ouvrirFiche(params.get('bloc'));
  else if (params.get('etape')) demarrerLecture(parseInt(params.get('etape'), 10) - 1, false);
})();
