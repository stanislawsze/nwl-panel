import { Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { api } from '../../lib/api';
import type { DiscordIntegration } from '../../types';
import { FormError } from '../FormError';

export function DiscordPage() {
  const [integration, setIntegration] = useState<DiscordIntegration | null>(
    null,
  );
  const [error, setError] = useState<unknown>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    api.discordIntegration().then(setIntegration).catch(setError);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaved(false);
    const data = new FormData(event.currentTarget);

    try {
      const updated = await api.saveDiscordIntegration({
        guild_id: String(data.get('guild_id') ?? ''),
        guild_name: String(data.get('guild_name') ?? ''),
        oauth_client_id: String(data.get('oauth_client_id') ?? ''),
        oauth_client_secret: String(data.get('oauth_client_secret') ?? ''),
        oauth_redirect_uri: String(data.get('oauth_redirect_uri') ?? ''),
        bot_token: String(data.get('bot_token') ?? ''),
        bot_enabled: data.get('bot_enabled') === 'on',
        is_active: data.get('is_active') === 'on',
      });
      setIntegration(updated);
      setIsSaved(true);
    } catch (caught) {
      setError(caught);
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Integration</p>
          <h1>Discord</h1>
        </div>
        {integration && (
          <span className="badge">
            {integration.status.is_ready_for_oauth
              ? 'OAuth ready'
              : 'Setup needed'}
          </span>
        )}
      </div>

      <FormError error={error} />

      <form className="panel settings-form" onSubmit={submit}>
        <div className="two-column">
          <label>
            Guild ID
            <input
              defaultValue={integration?.guild_id ?? ''}
              name="guild_id"
              type="text"
            />
          </label>
          <label>
            Guild name
            <input
              defaultValue={integration?.guild_name ?? ''}
              name="guild_name"
              type="text"
            />
          </label>
          <label>
            OAuth client ID
            <input
              defaultValue={integration?.oauth.client_id ?? ''}
              name="oauth_client_id"
              type="text"
            />
          </label>
          <label>
            OAuth redirect URI
            <input
              defaultValue={integration?.oauth.redirect_uri ?? ''}
              name="oauth_redirect_uri"
              type="url"
            />
          </label>
          <label>
            OAuth client secret
            <input
              name="oauth_client_secret"
              placeholder={integration?.oauth.has_client_secret ? 'Stored' : ''}
              type="password"
            />
          </label>
          <label>
            Bot token
            <input
              name="bot_token"
              placeholder={integration?.bot.has_token ? 'Stored' : ''}
              type="password"
            />
          </label>
        </div>
        <div className="toggle-row">
          <label>
            <input
              defaultChecked={integration?.bot_enabled ?? false}
              name="bot_enabled"
              type="checkbox"
            />
            Bot enabled
          </label>
          <label>
            <input
              defaultChecked={integration?.is_active ?? false}
              name="is_active"
              type="checkbox"
            />
            Integration active
          </label>
        </div>
        <button type="submit">
          <Save aria-hidden="true" size={18} />
          Save settings
        </button>
        {isSaved && <p className="success">Discord settings saved.</p>}
      </form>
    </main>
  );
}
