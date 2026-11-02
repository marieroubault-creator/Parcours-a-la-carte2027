/* =====================================================
   DONNÉES DE LA CHASSE AU TRÉSOR – Saint-Malo intra-muros
   Tout ce qui se modifie (lieu de rendez-vous, énigmes,
   réponses acceptées, photos) est regroupé dans ce fichier.
   ===================================================== */

/* Point de ralliement : laisser vide pour n'afficher qu'un message générique.
   Exemple : "Place Chateaubriand – 9h30" */
const RALLIEMENT = "";

/* Photos HD libres de droits (Wikimedia Commons). */
const commons = (file, w = 2000) =>
  "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=" + w;

const PHOTOS = {
  remparts:  { file: "Remparts-st-malo-cote-port-.jpg",                       title: "Les remparts",            credit: "Pline · Wikimedia Commons" },
  chateau:   { file: "Saint-Malo - château depuis le Sillon.jpg",             title: "Le château",              credit: "Guillaume Piolle · Wikimedia Commons" },
  fort:      { file: "Fort-National-DSC 6293.jpg",                            title: "Le Fort National",        credit: "Pline · Wikimedia Commons" },
  vue:       { file: "Saint-Malo 20180530 40.jpg",                            title: "Saint-Malo intra-muros",  credit: "Georges Seguin (Okki) · Wikimedia Commons" },
  cathedrale:{ file: "Saint-Malo - Cathédrale Saint-Vincent - Choeur.jpg",    title: "La cathédrale Saint-Vincent", credit: "Jean-Christophe Benoist · Wikimedia Commons" },
  hermine:   { file: "Saint-Malo - armes de Bretagne.jpg",                    title: "Les armes de Bretagne",   credit: "Wikimedia Commons" }
};

/* Les 5 établissements (tous intra-muros).
   Médias optionnels, détectés automatiquement s'ils existent :
     media/etablissements/<id>.jpg  (photo HD de l'établissement)
     media/etablissements/<id>.mp4  (vidéo de l'établissement)
   À défaut, une photo HD de Saint-Malo est affichée. */
const STOPS = {
  monsieur: {
    id: "monsieur", name: "Monsieur Madame",
    coords: [48.64652164024668, -2.0263622722532184],
    address: "2 rue de Dinan, 35400 Saint-Malo",
    website: "https://monsieurmadamebrasserie.com/fr",
    photo: PHOTOS.vue
  },
  armoricaine: {
    id: "armoricaine", name: "La Brasserie Armoricaine",
    coords: [48.6490533769641, -2.0273456587614365],
    address: "6 rue du Boyer, 35400 Saint-Malo",
    website: "https://www.hotel-armoricaine.com/",
    photo: PHOTOS.remparts
  },
  ginette: {
    id: "ginette", name: "Le Croiseur Ginette",
    coords: [48.64973426972223, -2.024604330109633],
    address: "2 place de la Poissonnerie, 35400 Saint-Malo",
    website: "https://www.lecroiseur-ginette.com/",
    photo: PHOTOS.chateau
  },
  cavoua: {
    id: "cavoua", name: "Cavoua Coffee Spot",
    coords: [48.65025552662146, -2.0239766293855572],
    address: "3 rue des Orbettes, 35400 Saint-Malo",
    website: "https://bonjour.cavoua.fr/summer",
    photo: PHOTOS.cathedrale
  },
  cambusier: {
    id: "cambusier", name: "Le Cambusier",
    coords: [48.64801544576959, -2.024409816433667],
    address: "6 rue des Cordiers, 35400 Saint-Malo",
    website: "https://www.cambusier.fr/",
    photo: PHOTOS.hermine
  }
};

/* Les deux parcours : même cadre, ordre et énigmes différents.
   accept = réponses acceptées (accents, majuscules, articles et tirets ignorés). */
const PARCOURS = {
  1: {
    title: "Parcours n°1",
    steps: [
      { stop: "monsieur",    q: "Quel est le plat emblématique de l'Ille-et-Vilaine ?",
        accept: ["galette saucisse"], hint: "Ça se mange avec les doigts, et c'est une crêpe de sarrasin roulée autour d'une saucisse grillée." },
      { stop: "armoricaine", q: "Comment s'appelle la muraille qui entoure la vieille ville ?",
        accept: ["remparts", "rempart"], hint: "On peut en faire le tour à pied : environ 2 km au-dessus de la mer." },
      { stop: "ginette",     q: "Comment s'appelle le palais de Saint-Malo ?",
        accept: ["palais du grand large", "grand large"], hint: "Son nom parle d'horizons lointains et d'océan…", photo: PHOTOS.chateau },
      { stop: "cavoua",      q: "Comment s'appelle la fête foraine de Saint-Malo ?",
        accept: ["sainte ouine", "la sainte ouine"], hint: "Elle porte le nom d'une sainte… qui n'existe pas vraiment !" },
      { stop: "cambusier",   q: "Quel animal est l'emblème de la Bretagne ?",
        accept: ["hermine", "l'hermine"], hint: "Son pelage blanc, moucheté de noir, figure sur le drapeau breton (le Gwenn-ha-du)." }
    ]
  },
  2: {
    title: "Parcours n°2",
    steps: [
      { stop: "monsieur",    q: "Quel est le plat emblématique de l'Ille-et-Vilaine ?",
        accept: ["galette saucisse"], hint: "Ça se mange avec les doigts, et c'est une crêpe de sarrasin roulée autour d'une saucisse grillée." },
      { stop: "cambusier",   q: "Quel animal est l'emblème de la Bretagne ?",
        accept: ["hermine", "l'hermine"], hint: "Son pelage blanc, moucheté de noir, figure sur le drapeau breton (le Gwenn-ha-du)." },
      { stop: "cavoua",      q: "Comment s'appelle la fête foraine de Saint-Malo ?",
        accept: ["sainte ouine", "la sainte ouine"], hint: "Elle porte le nom d'une sainte… qui n'existe pas vraiment !" },
      { stop: "ginette",     q: "Qui est le corsaire le plus connu de Saint-Malo ?",
        accept: ["surcouf", "robert surcouf"], hint: "Il a capturé le navire anglais « Kent » en 1800.", photo: PHOTOS.fort },
      { stop: "armoricaine", q: "Comment s'appelle la muraille qui entoure la vieille ville ?",
        accept: ["remparts", "rempart"], hint: "On peut en faire le tour à pied : environ 2 km au-dessus de la mer." }
    ]
  }
};
