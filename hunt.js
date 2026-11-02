/* =====================================================
   MOTEUR DE LA CHASSE AU TRÉSOR
   Lit data.js, affiche la carte de Saint-Malo intra-muros
   et dévoile les établissements un par un.
   ===================================================== */
(function () {
  const key = document.body.dataset.parcours;
  const P = PARCOURS[key];
  const steps = P.steps.map(s => Object.assign({}, STOPS[s.stop], s, { photo: s.photo || STOPS[s.stop].photo }));
  const TOTAL = steps.length;
  const DURATION = 50 * 60; // 50 minutes

  let current = -1;       // index de l'établissement en cours
  let found = 0;          // énigmes résolues
  let secondsLeft = DURATION;
  let timer = null;
  let started = false;
  const pins = [];

  /* ---------- Utilitaires ---------- */
  const $ = id => document.getElementById(id);
  const norm = t => t.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’'`\-]/g, " ").replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ").trim()
    .replace(/^(le|la|les|l|un|une)\s+/, "");
  const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  function confettiBurst(times) {
    if (typeof confetti !== "function") return;
    for (let i = 0; i < (times || 3); i++) {
      confetti({ particleCount: 90, spread: 160, origin: { x: Math.random(), y: Math.random() * 0.6 }, gravity: 0.8, zIndex: 20000 });
    }
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2300);
  }

  function openModal(html, cls) {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = '<div class="modal ' + (cls || "") + '">' + html + "</div>";
    document.body.appendChild(bg);
    return bg;
  }

  /* Média : vidéo locale > photo locale > photo HD Commons */
  function mediaHTML(step, alt) {
    const p = step.photo;
    return '<div class="media" data-id="' + step.id + '">' +
      '<img alt="' + alt + '" src="' + commons(p.file) + '" loading="lazy">' +
      '<span class="credit">' + p.credit + "</span></div>";
  }
  function upgradeMedia(root, step) {
    const box = root.querySelector(".media");
    if (!box) return;
    const img = box.querySelector("img");
    // 1) photo de l'établissement si fournie
    const local = new Image();
    local.onload = () => { img.src = local.src; box.querySelector(".credit").textContent = step.name; };
    local.src = "media/etablissements/" + step.id + ".jpg";
    // 2) vidéo de l'établissement si fournie
    const v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.controls = true;
    v.preload = "metadata";
    v.addEventListener("loadeddata", () => { box.insertBefore(v, box.firstChild); v.play().catch(() => {}); });
    v.src = "media/etablissements/" + step.id + ".mp4";
  }

  /* ---------- Carte (limitée à l'intra-muros) ---------- */
  const map = L.map("map", {
    minZoom: 16, maxZoom: 19,
    maxBounds: [[48.6425, -2.0360], [48.6560, -2.0130]],
    maxBoundsViscosity: 0.9
  }).setView([48.6493, -2.0255], 17);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
  setTimeout(() => map.invalidateSize(), 250);
  const route = L.polyline([], { color: "#ea6367", weight: 4, dashArray: "8 10" }).addTo(map);

  function pinIcon(i, state) {
    const inner = state === "done" ? '<i class="fa-solid fa-check"></i>' : i + 1;
    return L.divIcon({ className: "", html: '<div class="pin ' + state + '">' + inner + "</div>", iconSize: [40, 40], iconAnchor: [20, 20] });
  }

  function addPin(i) {
    const m = L.marker(steps[i].coords, { icon: pinIcon(i, "current"), title: steps[i].name }).addTo(map);
    m.on("click", () => { map.flyTo(steps[i].coords, 18, { duration: 0.8 }); if (i === current) openQuestion(); });
    pins[i] = m;
    route.setLatLngs(steps.slice(0, i + 1).map(s => s.coords));
  }

  /* ---------- Carnet de bord ---------- */
  function renderSteps() {
    $("steps").innerHTML = steps.map((s, i) => {
      let cls = "locked", label = "Établissement mystère", sub = "À débloquer";
      if (i < found) { cls = "done"; label = s.name; sub = "CV déposé · énigme résolue"; }
      else if (i === current) { cls = "current"; label = s.name; sub = "Trésor en cours"; }
      const n = i < found ? '<i class="fa-solid fa-check"></i>' : i + 1;
      return '<li class="step ' + cls + '"><span class="n">' + n + "</span><div>" + label + "<small>" + sub + "</small></div></li>";
    }).join("");
    $("score").textContent = found + "/" + TOTAL;
  }

  function showClue() {
    const s = steps[current];
    const box = $("clue");
    box.innerHTML = mediaHTML(s, s.name) +
      '<div class="body">' +
        '<span class="tag">Établissement ' + (current + 1) + " sur " + TOTAL + "</span>" +
        '<h3 class="title">' + s.name + "</h3>" +
        '<p class="addr"><i class="fa-solid fa-location-dot"></i> ' + s.address + '<br>' +
          '<a href="' + s.website + '" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Site web</a></p>' +
        '<div class="mission"><b>Ta mission :</b> entre, présente-toi et <b>dépose ton CV</b>. Échange avec l\'équipe : c\'est ta clé pour résoudre l\'énigme et débloquer le prochain établissement.</div>' +
        '<button class="btn" id="openQ"><i class="fa-solid fa-key"></i> Résoudre l\'énigme</button>' +
      "</div>";
    box.style.display = "block";
    $("openQ").addEventListener("click", openQuestion);
    upgradeMedia(box, s);
  }

  /* ---------- Déroulé ---------- */
  function reveal(i) {
    current = i;
    addPin(i);
    renderSteps();
    showClue();
    map.flyTo(steps[i].coords, 18, { duration: 1.2 });
    $("clue").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function start() {
    if (started) return;
    started = true;
    $("start-btn").style.display = "none";
    const fog = $("fog"); if (fog) fog.remove();
    $("intro").style.display = "none";
    timer = setInterval(() => {
      secondsLeft--;
      $("timer").textContent = fmt(Math.max(secondsLeft, 0));
      if (secondsLeft <= 0) { clearInterval(timer); finish(false); }
    }, 1000);
    reveal(0);
  }

  function openQuestion() {
    if (current < 0 || current >= TOTAL) return;
    const s = steps[current];
    const bg = openModal(
      '<button class="close-btn" aria-label="Fermer">×</button>' +
      '<span class="kicker">Énigme n°' + (current + 1) + "</span>" +
      '<h3 class="title">' + s.name + "</h3>" +
      '<p class="q">' + s.q + "</p>" +
      '<div class="mission"><i class="fa-solid fa-file-lines"></i> Dépose ton CV dans l\'établissement et discute avec l\'équipe pour trouver la réponse.</div>' +
      '<form id="qForm" autocomplete="off"><input id="answer" type="text" placeholder="Ta réponse…" aria-label="Ta réponse">' +
      '<div class="msg" id="msg"></div>' +
      '<div class="modal-actions"><button type="button" class="b-alt" id="hintBtn"><i class="fa-solid fa-lightbulb"></i> Indice</button>' +
      '<button type="submit" class="b-main"><i class="fa-solid fa-unlock"></i> Valider</button></div></form>'
    );
    const modal = bg.querySelector(".modal");
    bg.querySelector(".close-btn").onclick = () => bg.remove();
    const input = bg.querySelector("#answer"); input.focus();
    const msg = bg.querySelector("#msg");

    bg.querySelector("#hintBtn").onclick = () => { msg.className = "msg hint"; msg.textContent = "Indice : " + s.hint; };

    bg.querySelector("#qForm").addEventListener("submit", e => {
      e.preventDefault();
      const v = norm(input.value);
      if (!v) return;
      if (s.accept.some(a => norm(a) === v)) {
        bg.remove();
        solved();
      } else {
        msg.className = "msg err";
        msg.textContent = "Ce n'est pas la bonne réponse, réessaie !";
        modal.classList.remove("shake"); void modal.offsetWidth; modal.classList.add("shake");
        input.select();
      }
    });
  }

  function solved() {
    pins[current].setIcon(pinIcon(current, "done"));
    found++;
    confettiBurst(3);
    toast('<i class="fa-solid fa-stamp"></i> Étape validée !');
    if (found >= TOTAL) {
      renderSteps();
      $("clue").style.display = "none";
      clearInterval(timer);
      setTimeout(() => finish(true), 900);
    } else {
      setTimeout(() => reveal(current + 1), 700);
    }
  }

  function finish(win) {
    const used = DURATION - Math.max(secondsLeft, 0);
    const html = win
      ? '<div class="chest"><i class="fa-solid fa-gem"></i></div>' +
        '<h3 class="title">Trésor trouvé !</h3>' +
        "<p>Bravo, tu as visité les " + TOTAL + " établissements et déposé tes CV dans l'intra-muros de Saint-Malo.</p>" +
        '<div class="result"><div><b>' + found + "/" + TOTAL + "</b>énigmes</div><div><b>" + fmt(used) + "</b>temps</div></div>"
      : '<div class="chest"><i class="fa-solid fa-hourglass-end"></i></div>' +
        '<h3 class="title">Temps écoulé !</h3>' +
        "<p>Tu as trouvé " + found + " trésor" + (found > 1 ? "s" : "") + " sur " + TOTAL + ". Bien joué, la chasse continue sur le terrain !</p>";
    const bg = openModal(
      html + '<div class="modal-actions">' +
      '<a class="b-gold" href="questionnaire.html"><i class="fa-solid fa-comment-dots"></i> Donner mon avis</a>' +
      '<a class="b-alt" href="index.html"><i class="fa-solid fa-house"></i> Accueil</a></div>'
    );
    if (win) { confettiBurst(5); setTimeout(() => confettiBurst(4), 900); }
    void bg;
  }

  /* ---------- Initialisation ---------- */
  $("timer").textContent = fmt(DURATION);
  $("score").textContent = "0/" + TOTAL;
  $("start-btn").addEventListener("click", start);
  $("fog-start").addEventListener("click", start);
  renderSteps();
})();
