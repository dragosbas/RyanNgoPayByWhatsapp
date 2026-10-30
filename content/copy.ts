/**
 * PLACEHOLDER COPY
 * -----------------
 * Every user-facing string on the site lives in this file.
 * The Romanian text is a draft for the first homepage. It is not final
 * brand or legal copy. Edit it here, then bump `consent.version` whenever
 * the consent sentence changes, so stored consent stays attributable.
 *
 * The hero photo is public/images/hero.jpg. Swap that file and update
 * `home.imageAlt` if the picture changes.
 *
 * Status: placeholder
 */

export const copy = {
  meta: {
    title: "GoodFund — numărul tău de WhatsApp",
    description:
      "Lasă-ne numărul de WhatsApp și te contactăm când GoodFund are o campanie sau o cerere de donație.",
  },
  brand: {
    wordmarkLead: "Good",
    wordmarkTail: "Fund",
    initiative: "o inițiativă a",
    initiativeLinkLabel: "Good Bureau",
    initiativeHref: "https://www.goodbureau.ro/",
    newTab: "se deschide într-o filă nouă",
  },
  nav: {
    privacy: "Confidențialitate",
    unsubscribe: "Dezabonare",
    skip: "Sari la conținut",
  },
  home: {
    headline: "Lasă-ne numărul de WhatsApp.",
    lede: "Îți scriem când GoodFund are o campanie sau o cerere de donație pentru proiectele Good Bureau.",
    imageSrc: "/images/hero.jpg",
    imageAlt: "Mai mulți oameni își pun mâinile una peste alta.",
    successTitle: "Mulțumim.",
    success:
      "Am notat numărul și îți scriem pe WhatsApp când avem o campanie. Te poți dezabona oricând.",
    successLink: "Pagina de dezabonare",
  },
  form: {
    phoneLabel: "Număr de WhatsApp",
    phonePlaceholder: "07xx xxx xxx",
    phoneHint:
      "România (+40) este țara implicită. Poți scrie 07xx xxx xxx sau un număr internațional cu +.",
    submit: "Mă înscriu",
    pending: "Se trimite…",
    honeypot: "Website",
  },
  consent: {
    version: "2026-10-30",
    body: "Sunt de acord ca GoodFund să îmi păstreze numărul și să mă contacteze pe WhatsApp despre campanii și cereri de donație. Mă pot dezabona oricând.",
  },
  errors: {
    phone_required: "Scrie numărul de WhatsApp.",
    invalid_phone:
      "Numărul nu pare valid. Încearcă forma 07xx xxx xxx sau +40 7xx xxx xxx.",
    consent_required:
      "Ca să păstrăm numărul, avem nevoie de acordul tău. Bifează căsuța.",
    rate_limited: "Prea multe încercări. Mai încearcă peste câteva minute.",
    unavailable:
      "Nu am putut salva numărul chiar acum. Te rugăm să încerci din nou.",
  },
  unsubscribe: {
    title: "Nu mai vreau mesaje",
    metaTitle: "Dezabonare",
    lede: "Scrie numărul cu care te-ai înscris. Dacă îl avem, îl oprim și nu te mai contactăm pe WhatsApp.",
    submit: "Dezabonează-mă",
    pending: "Se trimite…",
    success: "Gata. Dacă numărul era la noi, nu te mai contactăm.",
  },
  privacy: {
    title: "Confidențialitate",
    metaTitle: "Confidențialitate",
    intro:
      "GoodFund este o inițiativă a Good Bureau. Pe acest site îți cerem numărul de WhatsApp, ca să te putem contacta despre campanii și donații.",
    storedTitle: "Ce păstrăm",
    stored:
      "Numărul de telefon, în format internațional. Data și ora la care ai fost de acord. Versiunea textului de consimțământ. Dacă te dezabonezi, data retragerii.",
    whyTitle: "De ce",
    basisTitle: "Temeiul",
    basis:
      "Consimțământul tău (art. 6 alin. 1 lit. a din GDPR). Căsuța nu este bifată dinainte. Poți retrage acordul oricând, fără să explici de ce.",
    retentionTitle: "Cât timp",
    retention:
      "Până te dezabonezi. După aceea păstrăm numărul marcat ca retras, ca să nu te mai contactăm și ca să putem arăta că ai cerut oprirea.",
    accessTitle: "Cine are acces",
    access:
      "Doar echipa GoodFund, în cadrul Good Bureau, pentru acele mesaje. Pe acest site nu există plăți, deci nu colectăm date de card.",
    contactBefore: "Pentru alte întrebări despre datele tale, scrie-ne prin",
    contactLink: "pagina de contact Good Bureau",
    contactHref: "https://www.goodbureau.ro/contact/",
    unsubscribeBefore: "Ca să retragi acordul, mergi la",
    unsubscribeLink: "dezabonare",
  },
  footer: {
    note: "Numărul e păstrat doar ca să îți scriem pe WhatsApp.",
  },
  notFound: {
    title: "Pagina nu există",
    body: "Înapoi la pagina principală.",
    home: "GoodFund",
  },
} as const;

export type CopyErrorCode = keyof typeof copy.errors;
