// src/i18n/resources.ts
import type {Resource} from 'i18next';

import enCommon from './locales/en/common.json';
import enGantt from './locales/en/gantt.json';
import enTable from './locales/en/table.json';
import jaCommon from './locales/ja/common.json';
import jaGantt from './locales/ja/gantt.json';
import jaTable from './locales/ja/table.json';
import viCommon from './locales/vi/common.json';
import viGantt from './locales/vi/gantt.json';
import viTable from './locales/vi/table.json';

export const NS = ['common', 'gantt', 'table'] as const;

export const RESOURCES: Resource = {
  en: {common: enCommon, gantt: enGantt, table: enTable},
  vi: {common: viCommon, gantt: viGantt, table: viTable},
  ja: {common: jaCommon, gantt: jaGantt, table: jaTable},
};
