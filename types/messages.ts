import type { Locale } from "./locale";

export type NavMessages = {
  home: string;
  projects: string;
  faq: string;
  contact: string;
  dashboard: string;
};

export type SystemsCategory = {
  key: string;
  label: string;
  items: string[];
};

export type Messages = {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    name: string;
    tagline: string;
  };
  nav: NavMessages;
  theme: {
    dark: string;
    light: string;
  };
  social: {
    github: string;
    linkedin: string;
    website: string;
    githubLabel: string;
    linkedinLabel: string;
    websiteLabel: string;
  };
  home: {
    statusLine: string;
    valueProp: string;
    supporting: string;
    systemsTitle: string;
    systemsSubtitle: string;
    systemsFigure: string;
    systemsCategories: SystemsCategory[];
    latestTitle: string;
    inspect: string;
    fullRegistry: string;
  };
  projects: {
    title: string;
    subtitle: string;
    filterLabel: string;
    clearFilters: string;
    noMatches: string;
    recordPrefix: string;
    openRecord: string;
  };
  projectDetail: {
    back: string;
    caseLabel: string;
    metaDomain: string;
    metaFocus: string;
    metaStack: string;
    metaTools: string;
    metaStatus: string;
    metaYear: string;
    statusCompleted: string;
    problem: string;
    approach: string;
    technicalStructure: string;
    outcome: string;
    stack: string;
    tools: string;
    links: string;
    github: string;
    live: string;
    gallery: string;
    caseCover: string;
    coverPlaceholder: string;
    noImageAsset: string;
    previousCase: string;
    nextCase: string;
    relatedRecords: string;
  };
  contact: {
    title: string;
    subtitle: string;
    emailLabel: string;
    email: string;
    channels: string;
  };
  faq: {
    title: string;
    subtitle: string;
    noItems: string;
    itemLabel: string;
  };
  footer: {
    rights: string;
  };
  chat: {
    title: string;
    placeholder: string;
    send: string;
    suggestions: string[];
    hint: string;
    /** Shown when chat is locked after a safety response */
    crisisLockedPlaceholder: string;
    /** Shown beside the countdown ring */
    crisisCooldownHint: string;
    /** Admin-only: reset lock + strike tier */
    crisisAdminReset: string;
  };
};

export type MessagesByLocale = Record<Locale, Messages>;
