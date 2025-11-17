// 'use client';

// import {DatesProvider} from '@mantine/dates';
// import dayjs from 'dayjs';
// import {PropsWithChildren, useEffect, useState} from 'react';
// import {DEFAULT_LOCALE} from '../constants';
// import {useTranslation} from '../i18n';

// const LOCALE_LOADERS: Record<string, () => Promise<unknown>> = {
//   ja: () => import('dayjs/locale/ja'),
//   en: () => import('dayjs/locale/en'),
//   vi: () => import('dayjs/locale/vi'),
// };

// type DateProviderProps = PropsWithChildren<{}>;
// const DateProvider = ({children}: DateProviderProps) => {
//   const {i18n} = useTranslation();
//   const selectedLocale = i18n.language ?? DEFAULT_LOCALE;
//   const [isLocaleLoaded, setIsLocaleLoaded] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         await (
//           LOCALE_LOADERS[selectedLocale] ?? LOCALE_LOADERS[DEFAULT_LOCALE]
//         )();
//         if (!cancelled)
//           dayjs.locale(
//             LOCALE_LOADERS[selectedLocale] ? selectedLocale : DEFAULT_LOCALE,
//           );
//       } catch (e) {
//         console.error(e);
//         if (!cancelled) dayjs.locale(DEFAULT_LOCALE);
//       } finally {
//         if (!cancelled) setIsLocaleLoaded(true);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [selectedLocale]);

//   return (
//     <DatesProvider
//       settings={{
//         locale: isLocaleLoaded ? selectedLocale : DEFAULT_LOCALE,
//         firstDayOfWeek: 1,
//       }}>
//       {children}
//     </DatesProvider>
//   );
// };

// export default DateProvider;
