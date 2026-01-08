/* =========================================================
   SADILOOP AI - CHATBOT WEB (V4)
   ---------------------------------------------------------
   Ce chatbot est 100% "gratuit" (sans API OpenAI) :
   - UI moderne + robot anime
   - FAQ + conseils business (automatisation)
   - Il pose des questions pour mieux orienter le visiteur
   - Il memorise quelques infos dans le navigateur (localStorage)
   - Il propose une offre (Starter / Pro / Premium) + lien WhatsApp
   ---------------------------------------------------------
   Notes:
   - Le numero WhatsApp est recupere depuis assets/js/app.js :
       window.WHATSAPP_NUMBER = "34XXXXXXXXX";
   - Tu peux modifier les textes / offres facilement dans ce fichier.
   ========================================================= */

(function () {
  "use strict";

  /* =========================
     1) WhatsApp helper
     ========================= */
  const WHATSAPP_NUMBER = (window.WHATSAPP_NUMBER || "34XXXXXXXXX")
    .toString()
    .replace(/\D/g, "");

  function waLink(text) {
    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(text)
    );
  }

  /* =========================
     2) Mini "memoire" (localStorage)
     ========================= */
  const MEM_KEY = "sadiloop_ai_profile_v1";
  const defaultProfile = {
    name: "",
    country: "",
    activity: "",
    channel: "", // whatsapp / instagram / facebook / email / site
    goal: "", // gagner du temps / plus de clients / support / rdv
    volume: "", // messages par jour/semaine
    budget: "", // petit / moyen / grand
  };

  function loadProfile() {
    try {
      const raw = localStorage.getItem(MEM_KEY);
      if (!raw) return { ...defaultProfile };
      const parsed = JSON.parse(raw);
      return { ...defaultProfile, ...(parsed || {}) };
    } catch {
      return { ...defaultProfile };
    }
  }

  function saveProfile(p) {
    try {
      localStorage.setItem(MEM_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  }

  let profile = loadProfile();

  /* =========================
     3) Proverbes "shonen" originaux (safe copyright)
     ========================= */
  const SHONEN_QUOTES = [
    "La force d’un equipage, c’est quand chaque geste repetitif devient automatique.",
    "Quand le temps est rare, l’automatisation devient une arme.",
    "Un vrai boss ne fait pas tout: il cree un systeme.",
    "Ta vision est grande ? Alors ton workflow doit etre plus rapide que tes concurrents.",
    "Si tu veux gagner des clients, reponds plus vite que la hesitation.",
    "Les heros s’entrainent. Les entreprises s’automatisent.",
    "Le futur n’attend pas: automatise aujourd’hui, gagne demain.",
  ];

  function shonenQuote() {
    const q = SHONEN_QUOTES[Math.floor(Math.random() * SHONEN_QUOTES.length)];
    return `🤖⚡ Proverbe du robot: “${q}”`;
  }

  /* =========================
     4) Base de connaissances (FAQ + demos)
     ========================= */
  const DEMOS = [
    {
      key: "restaurant",
      title: "Restaurant / Livraison",
      what: "Réservation, menu, horaires, livraison, promos.",
      stack: "WhatsApp + Google Sheets + Make + notifications",
    },
    {
      key: "salon",
      title: "Salon / Beauté",
      what: "RDV auto, confirmation, rappel, annulation.",
      stack: "Instagram DM + Calendrier + Make + SMS/Email",
    },
    {
      key: "immobilier",
      title: "Immobilier",
      what: "Qualification lead, visite, documents, relance.",
      stack: "Facebook Lead Ads + CRM + Make + Email",
    },
    {
      key: "ecommerce",
      title: "E‑commerce",
      what: "Suivi commande, retours, FAQ, SAV.",
      stack: "Site + Email + WhatsApp + Helpdesk",
    },
    {
      key: "coaching",
      title: "Coach / Formation",
      what: "Vente, paiement, onboarding, planification.",
      stack: "Landing + Stripe + Calendrier + Email",
    },
    {
      key: "support",
      title: "Support IT (PME)",
      what: "Tickets auto, priorisation, alertes, base FAQ.",
      stack: "Formulaire + Helpdesk + Slack + Make",
    },
    {
      key: "rh",
      title: "Recrutement",
      what: "Tri CV, prise de RDV, réponses automatiques.",
      stack: "Email + Sheets + Notion + Make",
    },
    {
      key: "events",
      title: "Événements",
      what: "Inscriptions, rappels, QR check‑in, feedback.",
      stack: "Formulaire + Email + QR + Sheets",
    },
  ];

  const FAQ = [
    {
      match: ["prix", "tarif", "offre", "pack", "abonnement"],
      answer: () =>
        "💸 Offres (exemple):\n" +
        "- Starter: 1 canal + 1 automatisation + support.\n" +
        "- Pro: omnichannel + 3 automatisations + reporting.\n" +
        "- Premium: IA + CRM + tunnel complet + suivi.\n\n" +
        "Si tu me dis: activité + pays + objectif, je te conseille la meilleure offre.",
    },
    {
      match: ["whatsapp", "instagram", "facebook", "gmail", "email"],
      answer: () =>
        "📲 Omnichannel = WhatsApp + Instagram + Facebook + Email.\n" +
        "On peut: répondre automatiquement, qualifier le client, proposer une démo, créer un ticket, ou prendre un RDV.",
    },
    {
      match: ["make", "n8n", "zapier"],
      answer: () =>
        "⚙️ Outils:\n" +
        "- Make: très bon pour démarrer (visuel).\n" +
        "- n8n: plus flexible (self-host / logique avancée).\n" +
        "- Zapier: simple, mais peut coûter cher.\n" +
        "Je peux te proposer un workflow adapté à ton business.",
    },
    {
      match: ["openai", "api", "gpt", "chatgpt"],
      answer: () =>
        "🧠 API IA: utile si tu veux des réponses plus 'intelligentes' et personnalisées.\n" +
        "Sans API, on peut déjà faire: FAQ, menus, prises de RDV, tri, relance.\n" +
        "Avec API, on ajoute: compréhension plus naturelle, résumé, extraction d'infos, personnalisation par client.",
    },
    {
      match: ["roi", "retour", "gain", "temps"],
      answer: () =>
        "📈 ROI typique:\n" +
        "- Réponse instantanée = + conversions.\n" +
        "- Relances auto = + ventes.\n" +
        "- RDV automatiques = - pertes de clients.\n" +
        "- Support trié = - temps perdu.\n" +
        "Dis-moi ton volume de messages (par jour/semaine) et je t'estime l'impact.",
    },
  ];

  function findFAQ(text) {
    const t = (text || "").toLowerCase();
    for (const item of FAQ) {
      if (item.match.some((m) => t.includes(m))) return item.answer();
    }
    return null;
  }

  /* =========================
     5) Reco d'offre (simple heuristique)
     ========================= */
  function recommendOffer(p) {
    const goal = (p.goal || "").toLowerCase();
    const vol = (p.volume || "").toLowerCase();
    const omni = ["instagram", "facebook", "email", "gmail", "site"].some((x) =>
      (p.channel || "").toLowerCase().includes(x)
    );

    // grosse charge
    const highVolume =
      /\b(50|100|200|300|500|1000)\b/.test(vol) ||
      vol.includes("beaucoup") ||
      vol.includes("énorme");

    if (highVolume || (omni && goal.includes("support"))) {
      return {
        name: "Premium",
        why: "volume élevé / support + omnichannel + IA + CRM",
      };
    }
    if (omni || goal.includes("rdv") || goal.includes("clients")) {
      return { name: "Pro", why: "omnichannel + tunnel (qualif → RDV → relance)" };
    }
    return { name: "Starter", why: "parfait pour démarrer vite sur 1 canal" };
  }

  /* =========================
     6) UI helpers
     ========================= */
  function el(tag, attrs = {}, html = "") {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (html) e.innerHTML = html;
    return e;
  }

  function injectStyles() {
    if (document.getElementById("sadi-chatbot-styles")) return;
    const style = el("style", { id: "sadi-chatbot-styles" });
    style.textContent = `
/* === Sadiloop Chatbot V4 === */
.sadi-robot{
  position:fixed; right:18px; bottom:88px; z-index:9999;
  width:68px; height:68px; border-radius:20px;
  background: radial-gradient(circle at 30% 20%, rgba(34,211,238,.75), rgba(109,91,255,.85));
  box-shadow: 0 18px 50px rgba(0,0,0,.45), 0 0 40px rgba(34,211,238,.25);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; user-select:none;
  animation: sadiFloat 3.2s ease-in-out infinite;
}
.sadi-robot:before{
  content:"";
  position:absolute; inset:-10px; border-radius:26px;
  background: conic-gradient(from 0deg, rgba(34,211,238,.35), rgba(109,91,255,.25), rgba(34,211,238,.35));
  filter: blur(10px);
  opacity:.85;
  z-index:-1;
}
.sadi-robot span{
  font-size:30px;
  filter: drop-shadow(0 10px 16px rgba(0,0,0,.35));
}
@keyframes sadiFloat{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

.sadi-panel{
  position:fixed; right:18px; bottom:18px; z-index:9999;
  width:min(410px, calc(100vw - 36px));
  height:560px;
  background: rgba(11,16,36,.78);
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0,0,0,.55);
  overflow:hidden;
  display:none;
}
.sadi-panel.open{ display:flex; flex-direction:column; }

.sadi-top{
  padding:14px 14px 12px;
  display:flex; align-items:center; justify-content:space-between;
  background: linear-gradient(90deg, rgba(109,91,255,.35), rgba(34,211,238,.18));
  border-bottom:1px solid rgba(255,255,255,.10);
}
.sadi-title{ font-weight:900; letter-spacing:.02em; }
.sadi-sub{ font-size:12px; opacity:.8; margin-top:2px; }
.sadi-close{
  border:0; width:36px; height:36px; border-radius:12px;
  background: rgba(255,255,255,.10);
  color:#fff; font-weight:900; cursor:pointer;
}

.sadi-body{
  padding:14px;
  overflow:auto;
  flex:1;
}
.sadi-msg{ display:flex; gap:10px; margin:10px 0; }
.sadi-msg.user{ justify-content:flex-end; }
.sadi-bubble{
  max-width:78%;
  padding:10px 12px;
  border-radius: 14px;
  line-height:1.25;
  font-size:14px;
  border:1px solid rgba(255,255,255,.10);
}
.sadi-msg.bot .sadi-bubble{
  background: rgba(255,255,255,.06);
}
.sadi-msg.user .sadi-bubble{
  background: linear-gradient(90deg, rgba(109,91,255,.65), rgba(34,211,238,.35));
}
.sadi-chiprow{ display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 0; }
.sadi-chip{
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#fff;
  padding:7px 10px;
  border-radius:999px;
  font-size:12px;
  cursor:pointer;
}
.sadi-footer{
  padding:12px;
  border-top:1px solid rgba(255,255,255,.10);
  display:flex; gap:8px;
}
.sadi-input{
  flex:1;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#fff;
  padding:10px 12px;
  outline:none;
}
.sadi-send{
  border:0;
  border-radius:12px;
  padding:10px 12px;
  font-weight:900;
  cursor:pointer;
  background: linear-gradient(90deg, #6D5BFF, #22D3EE);
  color:#071024;
}
.sadi-mini{
  margin-top:6px;
  font-size:12px;
  opacity:.85;
}
.sadi-link{
  color:#22D3EE;
  text-decoration:none;
  font-weight:800;
}
    `;
    document.head.appendChild(style);
  }

  /* =========================
     7) UI build
     ========================= */
  let robot, panel, bodyEl, inputEl;

  function addMsg(from, text) {
    const msg = el("div", { class: "sadi-msg " + (from === "user" ? "user" : "bot") });
    const bubble = el("div", { class: "sadi-bubble" });
    bubble.textContent = text;
    msg.appendChild(bubble);
    bodyEl.appendChild(msg);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function addChips(chips) {
    const row = el("div", { class: "sadi-chiprow" });
    chips.forEach((c) => {
      const b = el("button", { class: "sadi-chip", type: "button" });
      b.textContent = c;
      b.addEventListener("click", () => {
        handleUserText(c);
      });
      row.appendChild(b);
    });
    bodyEl.appendChild(row);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function openPanel() {
    panel.classList.add("open");
  }
  function closePanel() {
    panel.classList.remove("open");
  }

  /* =========================
     8) Conversation logic
     ========================= */
  function missingFields(p) {
    const miss = [];
    if (!p.activity) miss.push("activity");
    if (!p.country) miss.push("country");
    if (!p.goal) miss.push("goal");
    if (!p.channel) miss.push("channel");
    return miss;
  }

  function askNextQuestion() {
    const miss = missingFields(profile);
    if (miss.length === 0) return null;

    const next = miss[0];
    if (next === "activity")
      return {
        text: "Tu es dans quel secteur ? (ex: restaurant, salon, immobilier, e‑commerce, IT...)",
        chips: ["Restaurant", "Salon", "Immobilier", "E‑commerce", "Support IT", "Autre"],
      };
    if (next === "country")
      return {
        text: "Tu es dans quel pays ? (Espagne, France, Sénégal, autre)",
        chips: ["Espagne", "France", "Sénégal", "Autre"],
      };
    if (next === "goal")
      return {
        text: "Ton objectif principal ?",
        chips: ["Gagner du temps", "Plus de clients", "Support/SAV", "Prise de RDV"],
      };
    if (next === "channel")
      return {
        text: "Ton canal le plus important aujourd’hui ?",
        chips: ["WhatsApp", "Instagram", "Facebook", "Email/Gmail", "Site web"],
      };
    return null;
  }

  function updateProfileFromAnswer(text) {
    const t = (text || "").trim();
    if (!t) return;

    // Heuristiques simples
    const low = t.toLowerCase();

    // activity
    if (!profile.activity) {
      if (["restaurant", "resto"].some((x) => low.includes(x))) profile.activity = "Restaurant";
      else if (["salon", "coiff", "beaut"].some((x) => low.includes(x))) profile.activity = "Salon/Beauté";
      else if (["immobilier", "appart", "maison"].some((x) => low.includes(x))) profile.activity = "Immobilier";
      else if (["e-commerce", "ecommerce", "shop", "boutique"].some((x) => low.includes(x))) profile.activity = "E‑commerce";
      else if (["support", "it", "informat"].some((x) => low.includes(x))) profile.activity = "Support IT";
      else if (t.length >= 3 && t.length <= 40) profile.activity = t;
    }

    // country
    if (!profile.country) {
      if (low.includes("esp")) profile.country = "Espagne";
      else if (low.includes("fr")) profile.country = "France";
      else if (low.includes("sen")) profile.country = "Sénégal";
      else if (t.length >= 3 && t.length <= 30) profile.country = t;
    }

    // goal
    if (!profile.goal) {
      if (low.includes("temps")) profile.goal = "Gagner du temps";
      else if (low.includes("client") || low.includes("vente")) profile.goal = "Plus de clients";
      else if (low.includes("support") || low.includes("sav")) profile.goal = "Support/SAV";
      else if (low.includes("rdv") || low.includes("rendez")) profile.goal = "Prise de RDV";
    }

    // channel
    if (!profile.channel) {
      if (low.includes("whatsapp")) profile.channel = "WhatsApp";
      else if (low.includes("insta")) profile.channel = "Instagram";
      else if (low.includes("face")) profile.channel = "Facebook";
      else if (low.includes("mail") || low.includes("gmail")) profile.channel = "Email/Gmail";
      else if (low.includes("site")) profile.channel = "Site web";
    }

    saveProfile(profile);
  }

  function proposeNextSteps() {
    const rec = recommendOffer(profile);
    const demo = DEMOS.find((d) =>
      (profile.activity || "").toLowerCase().includes(d.title.split(" / ")[0].toLowerCase())
    );

    const demoText = demo
      ? `🎬 Démo conseillée: ${demo.title}\n- ${demo.what}\n- Stack: ${demo.stack}`
      : "🎬 Je peux te montrer une démo adaptée (restaurant, salon, immobilier, e‑commerce, support IT...).";

    const summary =
      `✅ Profil détecté:\n` +
      `- Secteur: ${profile.activity || "?"}\n` +
      `- Pays: ${profile.country || "?"}\n` +
      `- Objectif: ${profile.goal || "?"}\n` +
      `- Canal: ${profile.channel || "?"}\n\n` +
      `🏷️ Offre recommandée: ${rec.name} (${rec.why})`;

    const waMsg =
      "Salut Sadiloop 👋\n" +
      "Je viens du site.\n\n" +
      `Secteur: ${profile.activity}\n` +
      `Pays: ${profile.country}\n` +
      `Objectif: ${profile.goal}\n` +
      `Canal: ${profile.channel}\n\n` +
      `Je veux une proposition d'automatisation + l'offre ${rec.name}.`;

    addMsg("bot", demoText);
    addMsg("bot", summary);
    addMsg("bot", "📩 Si tu veux, je te mets en contact sur WhatsApp pour une proposition claire.");
    addMsg("bot", `Lien WhatsApp: ${waLink(waMsg)}`);
    addChips(["Voir les 8 démos", "Estimer mon ROI", "Parler à un humain (WhatsApp)"]);
  }

  function listDemos() {
    let text = "🔥 8 démos utiles (marché):\n";
    DEMOS.forEach((d, i) => {
      text += `${i + 1}) ${d.title} — ${d.what}\n`;
    });
    addMsg("bot", text.trim());
    addMsg("bot", "Tu veux quelle démo ? (ex: Restaurant, Salon, Immobilier...)");
  }

  function estimateROI() {
    addMsg(
      "bot",
      "Pour estimer ton ROI, dis-moi ton volume: tu reçois combien de messages / demandes par jour ou par semaine ?"
    );
  }

  function handleUserText(text) {
    const t = (text || "").trim();
    if (!t) return;

    addMsg("user", t);

    // 1) commandes rapides
    const low = t.toLowerCase();
    if (low.includes("reset")) {
      profile = { ...defaultProfile };
      saveProfile(profile);
      addMsg("bot", "🔄 Reset OK. On recommence.");
      addMsg("bot", shonenQuote());
      const q = askNextQuestion();
      if (q) {
        addMsg("bot", q.text);
        addChips(q.chips);
      }
      return;
    }

    if (low.includes("8 démo") || low.includes("8 demo") || low.includes("demos")) {
      listDemos();
      return;
    }

    if (low.includes("roi")) {
      estimateROI();
      return;
    }

    if (low.includes("humain") || low.includes("whatsapp")) {
      const waMsg =
        "Salut Sadiloop 👋 Je veux parler avec toi.\n" +
        `Secteur: ${profile.activity || "?"}\nPays: ${profile.country || "?"}\nObjectif: ${profile.goal || "?"}\nCanal: ${profile.channel || "?"}`;
      addMsg("bot", `✅ Voilà le lien WhatsApp: ${waLink(waMsg)}`);
      return;
    }

    // 2) FAQ
    const faq = findFAQ(t);
    if (faq) {
      addMsg("bot", faq);
      const q = askNextQuestion();
      if (q) {
        addMsg("bot", q.text);
        addChips(q.chips);
      } else {
        proposeNextSteps();
      }
      return;
    }

    // 3) essayer de remplir le profil
    updateProfileFromAnswer(t);

    // 4) si la personne donne un volume -> on stocke
    if (!profile.volume) {
      const hasNumber = /\d+/.test(low);
      if (hasNumber && (low.includes("jour") || low.includes("semaine") || low.includes("mois"))) {
        profile.volume = t;
        saveProfile(profile);
      }
    } else if (!profile.volume && /\d+/.test(low)) {
      profile.volume = t;
      saveProfile(profile);
    }

    // 5) flow: questions manquantes
    const q = askNextQuestion();
    if (q) {
      addMsg("bot", shonenQuote());
      addMsg("bot", q.text);
      addChips(q.chips);
      return;
    }

    // 6) Si tout est rempli, proposer
    if (missingFields(profile).length === 0) {
      addMsg("bot", shonenQuote());
      proposeNextSteps();
      return;
    }

    // fallback
    addMsg(
      "bot",
      "Je peux t'aider avec: prix/offres, démos, Make vs n8n, WhatsApp/Instagram, ROI.\n" +
        "Dis-moi: activité + pays + objectif, et je te fais une proposition."
    );
    addChips(["Prix / offres", "8 démos utiles", "Make vs n8n", "Estimer ROI", "Reset"]);
  }

  function init() {
    injectStyles();

    robot = el("div", { class: "sadi-robot", role: "button", "aria-label": "Ouvrir le chatbot" });
    robot.innerHTML = "<span>🤖</span>";
    panel = el("div", { class: "sadi-panel", "aria-live": "polite" });

    const top = el("div", { class: "sadi-top" });
    const left = el("div", {});
    left.innerHTML =
      `<div class="sadi-title">Sadiloop AI</div>` +
      `<div class="sadi-sub">Automatisation • Omnichannel • ROI</div>`;
    const closeBtn = el("button", { class: "sadi-close", type: "button", "aria-label": "Fermer" }, "✕");
    closeBtn.addEventListener("click", closePanel);
    top.appendChild(left);
    top.appendChild(closeBtn);

    bodyEl = el("div", { class: "sadi-body" });

    const footer = el("div", { class: "sadi-footer" });
    inputEl = el("input", {
      class: "sadi-input",
      placeholder: "Ecris ici… (ex: restaurant Espagne plus de clients)",
      type: "text",
    });
    const sendBtn = el("button", { class: "sadi-send", type: "button" }, "Envoyer");
    sendBtn.addEventListener("click", () => {
      const v = inputEl.value;
      inputEl.value = "";
      handleUserText(v);
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });

    footer.appendChild(inputEl);
    footer.appendChild(sendBtn);

    panel.appendChild(top);
    panel.appendChild(bodyEl);
    panel.appendChild(footer);

    document.body.appendChild(robot);
    document.body.appendChild(panel);

    robot.addEventListener("click", () => {
      if (panel.classList.contains("open")) closePanel();
      else openPanel();
    });

    // Hello
    addMsg("bot", "Salut 👋 je suis le robot Sadiloop. Je peux te proposer une automatisation adaptée.");
    addMsg("bot", shonenQuote());

    const q = askNextQuestion();
    if (q) {
      addMsg("bot", q.text);
      addChips(q.chips);
    } else {
      proposeNextSteps();
    }

    // Astuce
    addMsg("bot", "Astuce: tape 'reset' pour recommencer.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();