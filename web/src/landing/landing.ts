/* Comportamiento de la landing publica.
 *
 * Todo lo de aqui es progresivo: si este script no llega a ejecutarse, la pagina sigue
 * siendo legible y navegable en castellano, con el tema claro y el precio anual. Es la
 * razon de que el estado inicial del scroll-reveal dependa de una clase que pone el
 * propio script (.js-reveal) y no de una regla suelta en el CSS.
 *
 * Comparte con la app las dos claves de localStorage — "trazza:theme" y
 * "trazza:language" — a proposito: quien pone la pagina en ingles y en oscuro se
 * encuentra la app en ingles y en oscuro, sin volver a elegir.
 */

import { inject } from "@vercel/analytics";

import "./landing.css";

type Language = "es" | "en";
type Theme = "light" | "dark";

const THEME_KEY = "trazza:theme";
const LANGUAGE_KEY = "trazza:language";

/* localStorage tira una excepcion (no devuelve null) en Safari con cookies bloqueadas y
   en cualquier navegador con el almacenamiento de sitio desactivado. Sin este envoltorio
   una configuracion de privacidad del visitante tumbaria el script entero. */
function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Sin almacenamiento la eleccion no sobrevive a la recarga, pero la sesion funciona. */
  }
}

/* ─── TRADUCCION ────────────────────────────────────────────────────────────────
 *
 * El castellano vive en el HTML y este diccionario solo contiene el ingles. Es
 * deliberado: asi no hay dos copias del texto que puedan divergir, el contenido real
 * viaja en el documento (que es lo que lee Google) y la pagina no depende del script
 * para tener texto. La contrapartida es que una clave sin traducir no da error, solo se
 * queda en castellano — por eso el aviso en consola de mas abajo, que solo corre en
 * desarrollo. */
const en: Record<string, string> = {
  "nav.skip": "Skip to content",
  "nav.sectionsAria": "Sections",
  "nav.journal": "Journal",
  "nav.product": "Product",
  "nav.finance": "Finances",
  "nav.pricing": "Pricing",
  "nav.languageAria": "Cambiar a español",
  "nav.themeAria": "Switch theme",
  "nav.signin": "Log in",
  "nav.signup": "Sign up",

  "hero.eyebrow": "14 days free, no card",
  "hero.titleA": "Trading journal and finances",
  "hero.titleB": "in one place.",
  "hero.lede":
    "Log your trades, track accounts, costs, payouts and discipline. Trazza adds up what you make and subtracts what it costs you, so you see the result you actually keep.",
  "hero.ctaPrimary": "Start 14-day free trial",
  "hero.ctaSecondary": "See how it works",
  "hero.trust1": "No card to get started",
  "hero.trust2": "Cancel whenever you want",
  "hero.trust3": "Your data stays yours",

  "journal.kicker": "Journal",
  "journal.title": "Turn every session into something you can use.",
  "journal.lede":
    "Screenshot, instrument, direction, discipline, mindset, mistakes and P&L all live in the same entry. Reviewing your week stops being an act of memory.",
  "journal.f1.title": "Visual journal",
  "journal.f1.text":
    "Save every trade with its screenshot, your notes and the mistakes you made, so you can see fast what works and what keeps repeating.",
  "journal.f2.title": "P&L calendar",
  "journal.f2.text":
    "Green days, red days, weekly totals and the month's shape without adding anything up by hand. Streaks show up before they hurt.",
  "journal.f3.title": "Metrics that mean something",
  "journal.f3.text":
    "Winrate, profit factor, avg win/loss and discipline computed from your real entries. Not one figure you had to type twice.",

  "product.kicker": "Product",
  "product.title": "From a single trade to the whole picture.",
  "product.lede":
    "The dashboard sums up how you are doing. The detail views let you drop down to one specific trade when you need the context. Same data, told at two altitudes.",
  "product.b1": "Filters by firm, account, period and instrument",
  "product.b2": "Account rules — target and drawdown — always in sight",
  "product.b3": "Evaluation and funded accounts linked, with one shared history",
  "product.b4": "Privacy mode to review in public without showing figures",

  "finance.kicker": "Finances",
  "finance.title": "It also measures the money leaving the account.",
  "finance.lede":
    "Challenge purchases, resets, activations, subscriptions and fees never show up in your P&L, but they come out of your pocket. Trazza puts them next to the result.",
  "finance.s1.label": "Real net",
  "finance.s1.text": "What is left after costs and withdrawals.",
  "finance.s2.label": "ROI",
  "finance.s2.text": "Return on what you have put in.",
  "finance.s3.label": "Break-even",
  "finance.s3.text": "How far you are from flat.",
  "finance.s4.label": "Drawdown",
  "finance.s4.text": "Room left before you break the rule.",
  "finance.l1": "Challenge purchase · Alpha Futures 50K",
  "finance.l2": "Payout · Alpha Futures 50K",
  "finance.l3": "Reset · Topstep 100K",
  "finance.l4": "Activation · Topstep 100K",

  "pricing.kicker": "Pricing",
  "pricing.title": "One simple plan, no surprises.",
  "pricing.lede":
    "14 days free, no card. After that, a single plan with everything included.",
  "pricing.switchAria": "Billing period",
  "pricing.monthly": "Monthly",
  "pricing.annual": "Yearly",
  "pricing.save": "Save 30%",
  "pricing.plan": "Trazza complete",
  "pricing.f1": "Unlimited accounts, firms and movements",
  "pricing.f2": "Full journal with calendar and metrics",
  "pricing.f3": "Export your data whenever you want",
  "pricing.f4": "Cancel from inside the app, no emails to write",
  "pricing.cta": "Start free trial",
  "pricing.fine": "14 days free · We do not ask for a card",

  "closing.title": "Start reading your trading with data.",
  "closing.text":
    "Fourteen days to load your accounts, log your sessions and finally see what your real result is.",
  "closing.cta": "Start 14-day free trial",

  "footer.tagline": "Trading journal and finances.",
  "footer.navAria": "Legal",
  "footer.legal": "Legal notice",
  "footer.privacy": "Privacy",
  "footer.cookies": "Cookies",
  "footer.terms": "Terms",
};

/* El precio no es una cadena mas: cambia de formato entre idiomas (42 € / €42) y ademas
   depende del periodo elegido. Se mantiene aparte para que las dos variables —idioma y
   ciclo— se combinen en un solo sitio y no en cuatro cadenas sueltas. */
const pricing: Record<Language, Record<"monthly" | "annual", { amount: string; cycle: string; note: string }>> = {
  es: {
    monthly: { amount: "4,99 €", cycle: "/mes", note: "Facturado cada mes" },
    annual: { amount: "42 €", cycle: "/año", note: "Equivale a 3,50 € al mes" },
  },
  en: {
    monthly: { amount: "€4.99", cycle: "/month", note: "Billed every month" },
    annual: { amount: "€42", cycle: "/year", note: "Works out at €3.50 a month" },
  },
};

const spanishText = new Map<Element, string>();
const spanishAria = new Map<Element, string>();

document.querySelectorAll("[data-i18n]").forEach((node) => {
  spanishText.set(node, node.textContent ?? "");
});

document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
  spanishAria.set(node, node.getAttribute("aria-label") ?? "");
});

let language: Language = readStore(LANGUAGE_KEY) === "en" ? "en" : "es";
let cycle: "monthly" | "annual" = "annual";

function applyLanguage(): void {
  document.documentElement.lang = language;

  spanishText.forEach((spanish, node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = language === "en" ? (en[key] ?? spanish) : spanish;
  });

  spanishAria.forEach((spanish, node) => {
    const key = node.getAttribute("data-i18n-aria");
    if (!key) return;
    node.setAttribute("aria-label", language === "en" ? (en[key] ?? spanish) : spanish);
  });

  const label = document.querySelector("[data-language-label]");
  if (label) label.textContent = language.toUpperCase();

  applyPricing();
}

function applyPricing(): void {
  const plan = pricing[language][cycle];
  const amount = document.querySelector("[data-price-amount]");
  const cycleNode = document.querySelector("[data-price-cycle]");
  const note = document.querySelector("[data-price-note]");

  if (amount) amount.textContent = plan.amount;
  if (cycleNode) cycleNode.textContent = plan.cycle;
  if (note) note.textContent = plan.note;

  document.querySelectorAll<HTMLButtonElement>(".pricing-option").forEach((option) => {
    const active = option.dataset.cycle === cycle;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-pressed", String(active));
  });
}

document.querySelector("[data-language-toggle]")?.addEventListener("click", () => {
  language = language === "es" ? "en" : "es";
  writeStore(LANGUAGE_KEY, language);
  applyLanguage();
});

document.querySelectorAll<HTMLButtonElement>(".pricing-option").forEach((option) => {
  option.addEventListener("click", () => {
    const next = option.dataset.cycle;
    if (next !== "monthly" && next !== "annual") return;
    cycle = next;
    applyPricing();
  });
});

/* ─── TEMA ──────────────────────────────────────────────────────────────────── */

const icons = {
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.99 13.18A9 9 0 1 1 10.82 3.01 7 7 0 0 0 20.99 13.18Z"/></svg>',
};

const themeButton = document.querySelector("[data-theme-toggle]");

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function paintThemeButton(): void {
  if (!themeButton) return;
  /* Mismo criterio que la app: el boton enseña el icono de a donde vas, no de donde
     estas. En oscuro se ve un sol porque pulsarlo te lleva al claro. */
  themeButton.innerHTML = currentTheme() === "dark" ? icons.sun : icons.moon;
}

themeButton?.addEventListener("click", () => {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  writeStore(THEME_KEY, next);
  paintThemeButton();
});

/* ─── CABECERA Y ENTRADA POR SCROLL ─────────────────────────────────────────── */

const header = document.querySelector(".site-header");

function paintHeader(): void {
  header?.classList.toggle("is-stuck", window.scrollY > 8);
}

window.addEventListener("scroll", paintHeader, { passive: true });

/* Se marcan los bloques a revelar desde JS y no a mano en el HTML: la lista de que entra
   escalonado es una decision de presentacion, y tenerla aqui evita salpicar el marcado
   con atributos que no significan nada para quien lo lee. */
function setUpReveal(): void {
  if (!("IntersectionObserver" in window)) return;

  const targets = [
    ...document.querySelectorAll(".hero-copy, .hero-figure"),
    ...document.querySelectorAll(".block-head, .feature, .split-copy, .split-figure"),
    ...document.querySelectorAll(".stat, .ledger, .pricing-switch, .price-card, .closing-inner"),
  ];

  if (targets.length === 0) return;

  document.documentElement.classList.add("js-reveal");
  targets.forEach((node) => node.setAttribute("data-reveal", ""));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  targets.forEach((node) => observer.observe(node));

  /* Escalonado por hermanos dentro de cada rejilla: la segunda tarjeta entra 60ms
     despues que la primera, no 60ms despues de que se cruce el umbral. Sin esto las tres
     tarjetas de una fila aparecen a la vez y el efecto no se lee. */
  document.querySelectorAll(".feature-grid, .stat-grid").forEach((grid) => {
    [...grid.children].forEach((child, index) => {
      if (child instanceof HTMLElement) child.style.setProperty("--reveal-delay", `${index * 60}ms`);
    });
  });
}

/* ─── ARRANQUE ──────────────────────────────────────────────────────────────── */

applyLanguage();
paintThemeButton();
paintHeader();
setUpReveal();

/* Analitica de Vercel. Va aqui abajo, despues de pintar, porque no debe retrasar nada de
   lo visible: si fallara, la pagina ya esta montada.
 *
 * Sin cookies y sin identificadores persistentes, asi que no hace falta banner de
 * consentimiento ni tocar legal.html. El script se sirve desde el propio dominio
 * (/_vercel/insights/script.js), no desde un tercero.
 *
 * En desarrollo se detecta solo y manda los eventos a un endpoint de depuracion, de modo
 * que las visitas de trabajo no ensucian los datos reales. Y recoge los parametros utm_*
 * de la URL, que es lo que permite separar que visita viene de cada red. */
inject();

if (import.meta.env.DEV) {
  const missing = [...spanishText.keys(), ...spanishAria.keys()]
    .map((node) => node.getAttribute("data-i18n") ?? node.getAttribute("data-i18n-aria"))
    .filter((key): key is string => Boolean(key) && !(key! in en));

  if (missing.length > 0) {
    console.warn(`[landing] claves sin traducir al ingles: ${[...new Set(missing)].join(", ")}`);
  }
}
