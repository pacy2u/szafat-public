'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { usePushSubscription } from '@/hooks/use-push-subscription';
import type { UserSettings } from '@/types';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushSubscription();

  useEffect(() => {
    fetch('/api/user/settings')
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function updateSetting(key: string, value: string) {
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
      if (key === 'locale') {
        document.cookie = `locale=${value.toLowerCase()};path=/;max-age=31536000`;
        window.location.reload();
      }
    }
  }

  if (!settings) return <div className="p-4">...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">{t('title')}</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('language')}</h2>
        <div className="flex gap-2">
          <Button
            variant={settings.locale === 'EN' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateSetting('locale', 'EN')}
          >
            English
          </Button>
          <Button
            variant={settings.locale === 'PL' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateSetting('locale', 'PL')}
          >
            Polski
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('dateFormat')}</h2>
        <div className="flex gap-2">
          <Button
            variant={settings.dateFormat === 'DD_MM_YYYY' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateSetting('dateFormat', 'DD_MM_YYYY')}
          >
            DD/MM/YYYY
          </Button>
          <Button
            variant={settings.dateFormat === 'MM_DD_YYYY' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateSetting('dateFormat', 'MM_DD_YYYY')}
          >
            MM/DD/YYYY
          </Button>
        </div>
      </section>

      {isSupported && (
        <section className="space-y-2">
          <h2 className="font-semibold">{t('notifications')}</h2>
          {isSubscribed ? (
            <Button variant="secondary" size="sm" onClick={unsubscribe}>
              {t('disableNotifications')}
            </Button>
          ) : (
            <Button size="sm" onClick={subscribe}>
              {t('enableNotifications')}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
