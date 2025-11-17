import React, {useEffect} from 'react';
import {I18nextProvider} from 'react-i18next';
import {ensureI18n} from './i18n';
import type {I18nInitOptions} from './types';

export type TranslationProviderProps = {
  children?: React.ReactNode;
  initOptions?: I18nInitOptions;
};

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  initOptions,
}) => {
  const i18n = ensureI18n(initOptions?.lng);
  const lang = initOptions?.lng;

  useEffect(() => {
    if (lang && i18n.language !== lang) i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
