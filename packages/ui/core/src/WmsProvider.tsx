'use client';
import {MantineProvider, MantineTheme} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';
import {Notifications} from '@mantine/notifications';
import {WmsQueryProvider} from '@wms/qc';
import '@wms/styles';
import {PropsWithChildren, Suspense, useEffect, useState} from 'react';
import {appConfig} from './config/appConfig';
import {API_URL} from './constants';
import {TranslationProvider} from './i18n';
import {AppCredentialsProvider} from './providers/AppCredentialsProvider';
import {customAppTheme} from './theme/customAppTheme';

export type WmsProviderProps = PropsWithChildren<{
  lang?: string;
  rootElement?: () => HTMLElement | null;
  hasMantineProvider?: boolean;
  theme?: MantineTheme | null;
  appId?: string;
  code?: string;
  cssVariablesSelector?: string;
}>;

export function WmsProvider({
  children,
  lang,
  rootElement,
  hasMantineProvider = false,
  theme,
  appId,
  code,
  cssVariablesSelector = '#wms-scope',
}: WmsProviderProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Get portal target from rootElement prop
    if (rootElement) {
      const target = rootElement();
      setPortalTarget(target);

      // Log for debugging
      if (target) {
        console.log('✅ Portal target found:', {
          id: target.id,
          tagName: target.tagName,
          isConnected: target.isConnected,
        });
      } else {
        console.warn('⚠️ Portal target is null');
      }
    }
  }, [rootElement]);

  const _ModalsProvider = !hasMantineProvider
    ? ModalsProvider
    : ({children}: PropsWithChildren) => <>{children}</>;
  
  // Always render notifications - we need our own notification system
  // even if parent has Mantine, because parent might not have notifications set up
  const _Notifications = Notifications;
  
  console.log('🔔 WmsProvider notification setup:', {
    hasMantineProvider,
    willRenderNotifications: true,
    portalTarget: portalTarget?.id || 'none',
  });

  // Determine which theme to use
  const resolvedTheme = theme === null ? undefined : theme || customAppTheme;

  // Get API URL with proper fallback logic
  const apiUrl = appConfig.getApiUrl() || API_URL;

  return (
    <TranslationProvider initOptions={{lng: lang}}>
      <Suspense fallback={null}>
        <MantineProvider
          theme={resolvedTheme}
          forceColorScheme="light"
          classNamesPrefix="wms"
          getRootElement={portalTarget ? () => portalTarget : undefined}
          cssVariablesSelector="#wms-scope">
          <_ModalsProvider>
            <_Notifications
              classNames={{
                notification: 'rounded-sm',
              }}
              position="top-right"
              portalProps={{
                target: portalTarget || undefined,
              }}
            />
            <WmsQueryProvider
              http={{
                baseURL: apiUrl,
              }}>
              <AppCredentialsProvider
                appId={appId || appConfig.getCredentials().appId}
                code={code || appConfig.getCredentials().code}>
                <div data-lang={lang} data-wms-content="true">
                  {children}
                </div>
              </AppCredentialsProvider>
            </WmsQueryProvider>
          </_ModalsProvider>
        </MantineProvider>
      </Suspense>
    </TranslationProvider>
  );
}
