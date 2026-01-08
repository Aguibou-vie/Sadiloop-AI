/* =========================================================
   SADILOOP AI - CHATBOT WEB (V3)
   ---------------------------------------------------------
   Objectif:
   - Chatbot moderne + robot anime
   - Reponses claires (FAQ)
   - Parcours "vente" (demo -> questions -> reco offre -> WhatsApp)
   - Sans API OpenAI (gratuit)
   ---------------------------------------------------------
   IMPORTANT:
   - Dans assets/js/app.js tu dois avoir:
       const WHATSAPP_NUMBER = "3460.....";
       window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
   - Sur index.html:
       <script src="assets/js/chatbot.js"></script>
   - Sur pages/*.html:
       <script src="../assets/js/chatbot.js"></script>
   ========================================================= */

(function () {
  /* =========================
     1) Numero WhatsApp
     - On recupere window.WHATSAPP_NUMBER depuis app.js
     - Fallback si jamais tu as oublie (a remplacer)
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
     2) Helpers DOM
     ========================= */
  function el(tag, attrs = {}, html = "") {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    e.innerHTML = html;
    return e;
  }

  function nl2br(text) {
    return String(text).replace(/\n/g, "<br>");
  }

  function addMsg(body, who, text) {
    const msg = el("div", { class: `sadi-msg ${who}` });
    const bubble = el("div", { class: "sadi-bubble" }, nl2br(text));
    msg.appendChild(bubble);
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function addTyping(body) {
    const msg = el("div", { class: "sadi-msg bot", id: "sadi-typing" });
    const bubble = el("div", { class: "sadi-bubble" }, "...");
    msg.appendChild(bubble);
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("sadi-typing");
    if (t) t.remove();
  }

  /* =========================
     3) Mini "etat" conversation
     - On stocke des infos pour recommander une offre
     ========================= */
  const lead = {
    activity: "",
    country: "",
    channel: "",
  };

  // petites listes pour reconnaitre vite
  const ACTIVITY_WORDS = [
    "restaurant",
    "resto",
    "salon",
    "coiffeur",
    "coiffure",
    "boutique",
    "shop",
    "magasin",
    "barber",
    "barbier",
    "garage",
    "immobilier",
    "agence",
    "consultant",
    "artisan",
  ];

  const CHANNEL_WORDS = ["whatsapp", "instagram", "gmail", "email", "mail", "facebook", "messenger"];

  const COUNTRY_WORDS = [
    "senegal",
    "sénégal",
    "dakar",
    "espagne",
    "spain",
    "madrid",
    "barcelona",
    "france",
    "europe",
    "international",
  ];

  function looksLikeActivity(txt) {
    const t = txt.toLowerCase();
    return ACTIVITY_WORDS.some((w) => t.includes(w));
  }
  function looksLikeChannel(txt) {
    const t = txt.toLowerCase();
    return CHANNEL_WORDS.some((w) => t.includes(w));
  }
  function looksLikeCountry(txt) {
    const t = txt.toLowerCase();
    return COUNTRY_WORDS.some((w) => t.includes(w));
  }

  function normalizeChannel(txt) {
    const t = txt.toLowerCase();
    if (t.includes("whatsapp")) return "WhatsApp";
    if (t.includes("instagram")) return "Instagram";
    if (t.includes("gmail") || t.includes("mail") || t.includes("email")) return "Gmail";
    if (t.includes("facebook") || t.includes("messenger")) return "Facebook";
    return "";
  }

  function recommendOffer() {
    // logique simple:
    // - si plusieurs canaux / gmail mentionne -> Premium
    // - si canal IG/FB + WA (ou business "agence/immobilier/consultant") -> Pro
    // - sinon Starter

    const a = (lead.activity || "").toLowerCase();
    const c = (lead.channel || "").toLowerCase();

    const isAdvanced =
      c.includes("gmail") ||
      a.includes("agence") ||
      a.includes("immobilier") ||
      a.includes("consultant");

    // si user parle "plusieurs" dans l'activite (rare), on garde advanced
    if (isAdvanced) return "PRO";

    if (c.includes("facebook")) return "PRO";
    if (c.includes("instagram")) return "PRO";
    if (c.includes("whatsapp")) return "STARTER";

    return "STARTER";
  }

  function examplesForActivity(activity) {
    const a = (activity || "").toLowerCase();
    if (a.includes("restaurant") || a.includes("resto")) {
      return (
        "🍽️ Exemples restaurant:\n" +
        "• menu + prix en auto\n" +
        "• reservation de table\n" +
        "• commandes a emporter\n" +
        "• relance avis Google"
      );
    }
    if (a.includes("salon") || a.includes("coiff")) {
      return (
        "💇 Exemples salon:\n" +
        "• prise de RDV\n" +
        "• choix prestation + prix\n" +
        "• rappels de RDV\n" +
        "• upsell soins"
      );
    }
    if (a.includes("boutique") || a.includes("shop") || a.includes("magasin")) {
      return (
        "🛍️ Exemples boutique:\n" +
        "• dispo produit\n" +
        "• suivi livraison\n" +
        "• paniers abandonnes\n" +
        "• promo personnalisable"
      );
    }
    if (a.includes("immobilier") || a.includes("agence")) {
      return (
        "🏠 Exemples immobilier:\n" +
        "• qualification acheteur\n" +
        "• prise de RDV visite\n" +
        "• envoi fiches biens\n" +
        "• relance automatique"
      );
    }
    return (
      "✨ Exemples generiques:\n" +
      "• prise de RDV\n" +
      "• devis / infos prix\n" +
      "• qualification prospects\n" +
      "• support client 24/7"
    );
  }

  function offerText(offer) {
    if (offer === "PREMIUM") {
      return (
        "🚀 Je te conseille: OFFRE PREMIUM\n\n" +
        "• WhatsApp + Instagram + Facebook + Gmail\n" +
        "• routage intelligent (support/vente/RDV)\n" +
        "• support prioritaire\n\n" +
        "💰 Installation: 1199€\n" +
        "🔁 Abonnement: 199€/mois\n\n" +
        "👉 Clique sur “WhatsApp direct” pour une demo personnalisee."
      );
    }
    if (offer === "PRO") {
      return (
        "👍 Je te conseille: OFFRE PRO\n\n" +
        "• WhatsApp + Instagram (ou Facebook)\n" +
        "• qualification prospects\n" +
        "• prise de RDV\n" +
        "• transfert humain intelligent\n\n" +
        "💰 Installation: 799€\n" +
        "🔁 Abonnement: 129€/mois\n\n" +
        "👉 Clique sur “WhatsApp direct” pour une demo personnalisee."
      );
    }
    // STARTER
    return (
      "👍 Je te conseille: OFFRE STARTER\n\n" +
      "• 1 canal (souvent WhatsApp)\n" +
      "• FAQ + horaires + services\n" +
      "• reponses 24/7\n" +
      "• installation rapide\n\n" +
      "💰 Installation: 499€\n" +
      "🔁 Abonnement: 79€/mois\n\n" +
      "👉 Clique sur “WhatsApp direct” pour une demo personnalisee."
    );
  }

  /* =========================
     4) FAQ (reponses)
     - Base mots-cles -> reponse
     - On garde ca simple + utile
     ========================= */
  const FAQ = [
    {
      keys: ["qui es tu", "qui es-tu", "qui est sadiloop", "sadiloop", "about"],
      answer:
        "🤖 Sadiloop AI aide les PME a automatiser leurs messages.\n" +
        "On connecte WhatsApp, Instagram, Facebook et Gmail pour:\n" +
        "• repondre vite\n" +
        "• qualifier les prospects\n" +
        "• prendre des RDV\n" +
        "• transferer a l'humain si besoin",
    },
    {
      keys: ["parcours", "experience", "expérience", "historique"],
      answer:
        "📘 Parcours Sadiloop AI:\n" +
        "• automatisations pour PME locales\n" +
        "• focus Espagne, Europe, Senegal\n" +
        "• livraisons rapides (72h)\n" +
        "• optimisation continue selon les resultats",
    },
    {
      keys: ["prix", "tarif", "combien", "price", "cost"],
      answer:
        "💰 Offres & prix:\n" +
        "• Installation (une seule fois)\n" +
        "• Abonnement mensuel (support + optimisation)\n\n" +
        "Starter: 499€ + 79€/mois\n" +
        "Pro: 799€ + 129€/mois\n" +
        "Premium: 1199€ + 199€/mois\n\n" +
        "Tu veux WhatsApp seul ou Omnichannel ?",
    },
    {
      keys: ["donnee", "donnees", "donnée", "data", "collecte", "collecter"],
      answer:
        "🔐 Donnees collectees (minimum):\n" +
        "• nom\n" +
        "• business/secteur\n" +
        "• canal principal\n" +
        "• pays\n" +
        "• objectif\n\n" +
        "Ces infos servent a personnaliser ta demo et l'automatisation.",
    },
    {
      keys: ["securite", "sécurité", "confidentialite", "confidentialité"],
      answer:
        "🛡️ Securite & confidentialite:\n" +
        "• configuration adaptee a ton business\n" +
        "• acces limite aux outils\n" +
        "• pas de revente de donnees\n\n" +
        "Si tu veux, on detaille ensemble les permissions.",
    },
    {
      keys: ["support", "maintenance", "assistance"],
      answer:
        "🧰 Support:\n" +
        "• maintenance continue\n" +
        "• ajustements de scenario\n" +
        "• reponses optimisee selon les retours\n\n" +
        "Le niveau depend de l'offre choisie.",
    },
    {
      keys: ["langue", "langues", "francais", "espagnol", "anglais"],
      answer:
        "🌍 Langues:\n" +
        "Le bot peut repondre en francais, espagnol ou anglais selon ton audience.",
    },
    {
      keys: ["paiement", "payer", "facture", "facturation"],
      answer:
        "💳 Paiement:\n" +
        "Installation + abonnement mensuel.\n" +
        "On en parle ensemble selon ton besoin.",
    },
    {
      keys: ["outil", "outils", "integration", "intégration", "make", "zapier"],
      answer:
        "🧩 Integrations:\n" +
        "• Make (scenarios)\n" +
        "• CRM / calendrier / Google Sheets\n" +
        "• WhatsApp / Instagram / Facebook / Gmail\n\n" +
        "Tu as deja des outils en place ?",
    },
    {
      keys: ["automatisation", "opportunite", "opportunités", "use case", "cas d", "exemple"],
      answer:
        "💡 Opportunites d'automatisation:\n" +
        "• prise de RDV\n" +
        "• devis/infos prix\n" +
        "• qualification prospects\n" +
        "• relances paniers abandonnes\n" +
        "• support client 24/7\n\n" +
        "Dis-moi ton secteur et je te propose 3 exemples concrets.",
    },
    {
      keys: ["proverbe", "manga", "motivation"],
      answer:
        "⚡ Proverbe du robot:\n" +
        "\"Un equipage avance vite quand chaque geste est automatisé.\"",
    },
    {
      keys: ["comment ca marche", "comment ça marche", "fonctionne", "process"],
      answer:
        "🧠 Comment ca marche:\n\n" +
        "1) Un client ecrit (WhatsApp / Instagram / Gmail)\n" +
        "2) L'assistant repond automatiquement\n" +
        "3) Il donne les infos (prix, horaires, services)\n" +
        "4) Il propose un RDV ou te transfere le client\n\n" +
        "Resultat:\n" +
        "✅ moins de messages a gerer\n" +
        "✅ plus de clients convertis",
    },
    {
      keys: ["whatsapp", "wa"],
      answer:
        "✅ WhatsApp Business:\n" +
        "• reponses 24/7\n" +
        "• FAQ / horaires / services\n" +
        "• qualification prospects\n" +
        "• prise de RDV\n" +
        "• transfert humain si besoin",
    },
    {
      keys: ["instagram", "ig", "dm"],
      answer:
        "📸 Instagram DM:\n" +
        "• reponses automatiques\n" +
        "• capture de leads\n" +
        "• redirection vers WhatsApp\n" +
        "• prise de RDV",
    },
    {
      keys: ["facebook", "messenger"],
      answer:
        "💬 Facebook Messenger:\n" +
        "• support client\n" +
        "• menus / infos\n" +
        "• reponses selon horaires\n" +
        "• transfert humain",
    },
    {
      keys: ["gmail", "email", "mail"],
      answer:
        "📧 Gmail:\n" +
        "• tri automatique\n" +
        "• reponses types\n" +
        "• relances\n" +
        "• organisation back-office",
    },
    {
      keys: ["delai", "délai", "temps", "quand", "combien de temps"],
      answer:
        "⏱️ Delai:\n" +
        "• 24h a 72h pour une premiere version simple\n" +
        "• puis optimisation continue",
    },

    // Pays (A3)
    {
      keys: ["senegal", "sénégal", "dakar"],
      answer:
        "🇸🇳 Senegal:\n" +
        "WhatsApp est souvent le canal n°1.\n" +
        "L'automatisation aide a:\n" +
        "• repondre vite\n" +
        "• donner prix / services\n" +
        "• prendre RDV ou commandes\n\n" +
        "👉 Tu es plutot restaurant, salon ou boutique ?",
    },
    {
      keys: ["espagne", "spain", "madrid", "barcelona"],
      answer:
        "🇪🇸 Espagne:\n" +
        "WhatsApp + Instagram marchent tres bien.\n" +
        "L'automatisation aide a:\n" +
        "• repondre 24/7\n" +
        "• qualifier les prospects\n" +
        "• prendre des RDV\n\n" +
        "👉 Quel est ton type de business ?",
    },
    {
      keys: ["france", "europe", "international"],
      answer:
        "🌍 International:\n" +
        "On adapte selon ton pays et les habitudes clients.\n\n" +
        "👉 Dis-moi ton activite pour te conseiller la meilleure config.",
    },

    // Demo (A2)
    {
      keys: ["demo", "démo", "demonstration", "voir une demo"],
      answer:
        "🎬 Super.\n\n" +
        "Pour te montrer une demo adaptee, j'ai besoin de 2 infos:\n" +
        "1) ton activite (ex: restaurant, salon...)\n" +
        "2) ton pays (Senegal / Espagne / autre)",
    },
  ];

  function findFAQAnswer(userText) {
    const t = userText.toLowerCase();
    for (const f of FAQ) {
      if (f.keys.some((k) => t.includes(k))) return f.answer;
    }
    return "";
  }

  /* =========================
     5) "Cerveau" du bot (sans API)
     - 1) detecte si user donne activite/pays/canal
     - 2) sinon essaye FAQ
     - 3) sinon fallback propre
     ========================= */
  function botAnswer(userText) {
    const text = userText.trim();
    const t = text.toLowerCase();

    if (t.includes("exemple") || t.includes("cas") || t.includes("use case")) {
      if (lead.activity) return examplesForActivity(lead.activity);
      return (
        "Dis-moi ton activite (ex: restaurant, salon, boutique) pour que je donne des exemples precis."
      );
    }

    // 5.1 - capture activite
    if (!lead.activity && looksLikeActivity(t)) {
      lead.activity = text;
      return (
        "Parfait 👍\n\n" +
        "Maintenant dis-moi ton pays:\n" +
        "👉 Senegal / Espagne / autre"
      );
    }

    // 5.2 - capture pays
    if (!lead.country && looksLikeCountry(t)) {
      lead.country = text;

      // message perso selon pays (A3)
      if (t.includes("senegal") || t.includes("sénégal") || t.includes("dakar")) {
        return (
          "🇸🇳 Top, Senegal.\n\n" +
          "Derniere question:\n" +
          "Sur quel canal tu reçois le plus de messages ?\n" +
          "👉 WhatsApp / Instagram / Gmail"
        );
      }
      if (t.includes("espagne") || t.includes("spain") || t.includes("madrid") || t.includes("barcelona")) {
        return (
          "🇪🇸 Top, Espagne.\n\n" +
          "Derniere question:\n" +
          "Sur quel canal tu reçois le plus de messages ?\n" +
          "👉 WhatsApp / Instagram / Gmail"
        );
      }

      return (
        "Parfait 🌍\n\n" +
        "Derniere question:\n" +
        "Sur quel canal tu reçois le plus de messages ?\n" +
        "👉 WhatsApp / Instagram / Gmail"
      );
    }

    // 5.3 - capture canal
    if (!lead.channel && looksLikeChannel(t)) {
      const ch = normalizeChannel(t);
      lead.channel = ch || text;

      // closing (A4): reco offre + pousser WhatsApp
      // si Gmail -> Premium direct (simple)
      if ((lead.channel || "").toLowerCase().includes("gmail")) {
        return offerText("PREMIUM");
      }
      const reco = recommendOffer();
      return offerText(reco);
    }

    // 5.4 - FAQ classique
    const faq = findFAQAnswer(text);
    if (faq) return faq;

    // 5.5 - fallback
    return (
      "Je peux t'aider ✅\n\n" +
      "Tu peux me demander:\n" +
      "• prix\n" +
      "• demo\n" +
      "• comment ca marche\n" +
      "• opportunites d'automatisation\n" +
      "• donnees collectees\n" +
      "• support / maintenance\n" +
      "• langues\n" +
      "• Senegal / Espagne\n\n" +
      "Ou donne-moi:\n" +
      "👉 ton activite\n" +
      "👉 ton pays\n" +
      "👉 ton canal (WhatsApp/Instagram/Gmail)"
    );
  }

  /* =========================
     6) CSS injecte (robot + animations + UI)
     - Le robot est au-dessus du bouton WhatsApp
     - La fenetre est au-dessus des 2 boutons
     ========================= */
  function injectStyles() {
    const style = el(
      "style",
      {},
      `
/* Robot launcher */
.sadi-robot{
  position:fixed;
  right:18px;
  bottom:88px; /* au-dessus du bouton WhatsApp */
  z-index:1100;
  width:58px;
  height:58px;
  border-radius:18px;
  border:1px solid rgba(255,255,255,.14);
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px rgba(0,0,0,.38);
  display:grid;
  place-items:center;
  cursor:pointer;
  animation: sadi-float 2.2s ease-in-out infinite;
}
@keyframes sadi-float{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-6px); }
}

/* Robot face */
.sadi-robot .face{
  width:34px;height:34px;border-radius:14px;
  background: linear-gradient(90deg, #6D5BFF, #22D3EE);
  display:grid;place-items:center;
  position:relative;
}
.sadi-robot .eyes{
  position:absolute; top:12px; left:8px; right:8px;
  display:flex; justify-content:space-between;
}
.sadi-robot .eye{
  width:6px; height:6px; border-radius:999px;
  background: rgba(7,10,20,.85);
}
.sadi-robot .mouth{
  position:absolute; bottom:8px; left:11px; right:11px;
  height:4px; border-radius:999px;
  background: rgba(7,10,20,.55);
}
.sadi-robot .ping{
  position:absolute; top:-6px; right:-6px;
  width:10px;height:10px;border-radius:999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34,197,94,.55);
  animation: sadi-ping 1.4s infinite;
}
@keyframes sadi-ping{
  0%{ box-shadow:0 0 0 0 rgba(34,197,94,.55); }
  70%{ box-shadow:0 0 0 10px rgba(34,197,94,0); }
  100%{ box-shadow:0 0 0 0 rgba(34,197,94,0); }
}

/* Welcome bubble */
.sadi-welcome{
  position:fixed;
  right:86px;
  bottom:98px;
  z-index:1100;
  padding:10px 12px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(11,16,36,.92);
  color:#EAF0FF;
  font-size:13px;
  max-width:260px;
  box-shadow:0 18px 40px rgba(0,0,0,.35);
  opacity:0;
  transform: translateY(8px);
  transition:.25s ease;
  pointer-events:none;
}
.sadi-welcome.show{
  opacity:1;
  transform: translateY(0);
}

/* Chat window */
.sadi-chat{
  position:fixed;
  right:18px;
  bottom:160px;
  z-index:1100;
  width:390px;
  max-width: calc(100vw - 36px);
  border-radius:18px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(11,16,36,.92);
  backdrop-filter: blur(10px);
  box-shadow:0 24px 80px rgba(0,0,0,.55);
  opacity:0;
  transform: translateY(12px) scale(.98);
  pointer-events:none;
  transition:.25s ease;
}
.sadi-chat.show{
  opacity:1;
  transform: translateY(0) scale(1);
  pointer-events:auto;
}

/* Header */
.sadi-chat header{
  padding:14px 14px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  border-bottom:1px solid rgba(255,255,255,.10);
  color:#EAF0FF;
  background: rgba(255,255,255,.04);
}
.sadi-chat header .title{
  font-weight:900;
}
.sadi-chat header .sub{
  font-size:12px;
  color: rgba(234,240,255,.70);
}
.sadi-chat header button{
  border:0;
  background:transparent;
  color: rgba(234,240,255,.85);
  font-size:18px;
  cursor:pointer;
}

/* Body + messages */
.sadi-body{
  padding:12px;
  max-height:360px;
  overflow:auto;
}
.sadi-msg{margin:10px 0; display:flex;}
.sadi-msg.user{justify-content:flex-end;}
.sadi-msg.bot{justify-content:flex-start;}
.sadi-bubble{
  max-width: 86%;
  padding:10px 12px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.10);
  font-size:14px;
  color:#EAF0FF;
}
.sadi-msg.bot .sadi-bubble{background: rgba(255,255,255,.06);}
.sadi-msg.user .sadi-bubble{background: rgba(109,91,255,.20); border-color: rgba(109,91,255,.30);}

/* Quick replies */
.sadi-quick{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  padding:10px 12px;
  border-top:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
}
.sadi-chip{
  padding:8px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color:#EAF0FF;
  font-weight:800;
  font-size:13px;
  cursor:pointer;
  user-select:none;
  transition:.15s ease;
}
.sadi-chip:hover{ transform: translateY(-1px); }

/* Input */
.sadi-input{
  display:flex;
  gap:8px;
  padding:10px 12px;
  border-top:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
}
.sadi-input input{
  flex:1;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.14);
  background: transparent;
  color:#EAF0FF;
  padding:10px 12px;
  outline:none;
}
.sadi-input button{
  border:0;
  border-radius:12px;
  padding:10px 12px;
  font-weight:900;
  cursor:pointer;
  background: linear-gradient(90deg, #6D5BFF, #22D3EE);
  color:#071024;
}
`
    );
    document.head.appendChild(style);
  }

  /* =========================
     7) Init UI + events
     ========================= */
  function init() {
    injectStyles();

    // Robot
    const robot = el(
      "div",
      { class: "sadi-robot", role: "button", "aria-label": "Open chat" },
      `
      <div class="ping"></div>
      <div class="face">
        <div class="eyes">
          <div class="eye"></div>
          <div class="eye"></div>
        </div>
        <div class="mouth"></div>
      </div>
    `
    );

    // Bubble bienvenue
    const welcome = el(
      "div",
      { class: "sadi-welcome" },
      `🤖 Salut ! Comment je peux vous aider ?<br><span style="color:rgba(234,240,255,.70)">Prix • Demo • Exemples • Automatisation…</span>`
    );

    // Box chat
    const box = el("div", { class: "sadi-chat" });
    box.innerHTML = `
      <header>
        <div>
          <div class="title">Sadiloop AI</div>
          <div class="sub">Assistant - Automatisation Omnichannel</div>
        </div>
        <button id="sadiClose" type="button">✕</button>
      </header>

      <div class="sadi-body" id="sadiBody"></div>

      <div class="sadi-quick">
        <div class="sadi-chip" data-q="prix">💰 Offres & prix</div>
        <div class="sadi-chip" data-q="comment ca marche">🧠 Comment ca marche</div>
        <div class="sadi-chip" data-q="exemples">✨ Exemples utiles</div>
        <div class="sadi-chip" data-q="automatisation">⚙️ Automatisation</div>
        <div class="sadi-chip" data-q="donnees">🔐 Donnees</div>
        <a class="sadi-chip" id="sadiWA" style="text-decoration:none" href="#">📲 WhatsApp direct</a>
      </div>

      <div class="sadi-input">
        <input id="sadiInput" placeholder="Pose ta question (prix, demo, Senegal...)" />
        <button id="sadiSend" type="button">Envoyer</button>
      </div>
    `;

    document.body.appendChild(robot);
    document.body.appendChild(welcome);
    document.body.appendChild(box);

    const body = document.getElementById("sadiBody");
    const input = document.getElementById("sadiInput");
    const sendBtn = document.getElementById("sadiSend");
    const closeBtn = document.getElementById("sadiClose");
    const waBtn = document.getElementById("sadiWA");

    // Lien WhatsApp (message propre)
    waBtn.href = waLink(
      "Salut Sadiloop AI 👋\n" +
        "Je viens du chatbot du site.\n" +
        "Mon activite: ...\n" +
        "Mon pays: ...\n" +
        "Canal principal: ...\n" +
        "Je veux une demo personnalisee."
    );

    // Accueil (A1)
    addMsg(
      body,
      "bot",
      "Salut 👋\n" +
        "Je suis l'assistant Sadiloop AI 🤖\n\n" +
        "Je peux t'aider a:\n" +
        "1) Voir les offres & prix\n" +
        "2) Comprendre comment ca marche\n" +
        "3) Donner des exemples utiles\n" +
        "4) Verifier si c'est adapte a ton business\n" +
        "5) Demander une demo\n\n" +
        "Clique sur un bouton ci-dessous 👇"
    );

    // Bubble au chargement
    setTimeout(() => welcome.classList.add("show"), 800);
    setTimeout(() => welcome.classList.remove("show"), 7000);

    // Open / close
    function openChat() {
      box.classList.add("show");
      welcome.classList.remove("show");
      setTimeout(() => input.focus(), 150);
    }
    function closeChat() {
      box.classList.remove("show");
    }

    robot.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);

    // Quick replies
    box.querySelectorAll(".sadi-chip[data-q]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const q = chip.getAttribute("data-q");
        addMsg(body, "user", q);

        addTyping(body);
        setTimeout(() => {
          removeTyping();
          addMsg(body, "bot", botAnswer(q));
        }, 450);
      });
    });

    // Send message
    function send() {
      const text = input.value.trim();
      if (!text) return;

      addMsg(body, "user", text);

      addTyping(body);
      setTimeout(() => {
        removeTyping();
        addMsg(body, "bot", botAnswer(text));
      }, 450);

      input.value = "";
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
