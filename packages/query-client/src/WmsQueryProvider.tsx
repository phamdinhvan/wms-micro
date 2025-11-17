import {QueryClientProvider} from '@tanstack/react-query';
import React, {useMemo} from 'react';
import {setGlobalHttp, type HttpClientOptions} from './http';
import {createQueryClient} from './queryClient';

export type WmsQueryProviderProps = {
  children?: React.ReactNode;
  http?: HttpClientOptions;
};

export const WmsQueryProvider: React.FC<WmsQueryProviderProps> = ({
  children,
  http,
}) => {
  const client = useMemo(() => createQueryClient(), []);
  React.useEffect(() => {
    if (http) setGlobalHttp(http);
  }, [http]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
