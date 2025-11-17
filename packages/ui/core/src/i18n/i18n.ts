// src/i18n/ensureI18n.ts
import * as i18nCore from 'i18next';
import {initReactI18next} from 'react-i18next';
import {NS, RESOURCES} from './resources';

// CJS/ESM safe getter
const i18next = ((i18nCore as any).default ??
  i18nCore) as typeof import('i18next');

function store() {
  (globalThis as any).__WMS__ ??= {};
  return (globalThis as any).__WMS__;
}

export function ensureI18n(lang: string = 'ja') {
  const s = store();

  if (!s.i18n) {
    const inst = i18next.createInstance();
    inst.use(initReactI18next).init({
      lng: lang,
      fallbackLng: 'en',
      resources: RESOURCES,
      ns: NS as unknown as string[],
      defaultNS: 'common',
      interpolation: {escapeValue: false},
      react: {useSuspense: false},
      initAsync: false,
    });
    s.i18n = inst;
  } else if (lang && s.i18n.language !== lang) {
    void s.i18n.changeLanguage(lang);
  }

  // ensure bundles exist
  for (const ns of NS) {
    if (!s.i18n.hasResourceBundle(lang, ns)) {
      s.i18n.addResources(lang, ns, (RESOURCES as any)[lang]?.[ns] ?? {});
    }
  }

  return s.i18n as i18nCore.i18n;
}
