import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'pl'] as const;
export type AppLocale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as AppLocale) || 'en';

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
