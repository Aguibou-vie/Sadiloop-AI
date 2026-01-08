// ✅ Mets ton numero WhatsApp (sans +, sans espaces)
const WHATSAPP_NUMBER = "34604899711"; // ex: "34612345678"
window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;

// helpers
const prefill = (text) =>
  "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);

function initYear(){
  const y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();
}

function initReveal(){
  const els = document.querySelectorAll(".fade-up");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting) en.target.classList.add("show");
    });
  }, {threshold: 0.12});
  els.forEach(el=>io.observe(el));
}

function initWhatsAppButtons(){
  const waFloat = document.getElementById("waFloat");
  if(waFloat){
    waFloat.href = prefill("Salut Sadiloop AI 👋 Je veux une démo d'automatisation IA (WhatsApp / Instagram / Facebook / Gmail).");
  }

  const waLinks = document.querySelectorAll("[data-wa]");
  waLinks.forEach(link=>{
    const msg = link.getAttribute("data-wa") || "Salut Sadiloop AI, je veux une démo.";
    link.setAttribute("href", prefill(msg));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
  });
}

function handleLeadForm(e){
  e.preventDefault();
  const form = e.target;

  const name = form.querySelector("[name='name']").value.trim();
  const business = form.querySelector("[name='business']").value.trim();
  const volume = (form.querySelector("[name='volume']") || {}).value || "";
  const channel = form.querySelector("[name='channel']").value;
  const country = form.querySelector("[name='country']").value;
  const goal = form.querySelector("[name='goal']").value.trim();
  const priority = (form.querySelector("[name='priority']") || {}).value || "";

  const msg =
`Salut Sadiloop AI 👋
Je veux une démo d'automatisation IA.

Nom: ${name}
Business: ${business}
Volume messages/mois: ${volume || "-"}
Canal: ${channel}
Pays: ${country}
Objectif: ${goal}
Priorite: ${priority || "-"}

Je veux automatiser mes messages clients 24/7.`;

  window.open(prefill(msg), "_blank");
  return false;
}

function initLeadForm(){
  const form = document.getElementById("leadForm");
  if(form) form.addEventListener("submit", handleLeadForm);
}

document.addEventListener("DOMContentLoaded", ()=>{
  initYear();
  initReveal();
  initWhatsAppButtons();
  initLeadForm();
});
