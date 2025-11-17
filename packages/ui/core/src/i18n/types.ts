import type {i18n as I18nType, InitOptions} from 'i18next';

export type I18nInitOptions = InitOptions & {
  defaultLng?: string;
};

export type I18nInstance = I18nType;
