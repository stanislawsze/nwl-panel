import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  useDiscordIntegration,
  useSaveDiscordIntegration,
} from '../../features/discord/use-discord-integration';
import { useFeedback } from '../../shared/feedback/FeedbackProvider';
import {
  discordIntegrationFormSchema,
  type DiscordIntegrationFormValues,
} from '../../shared/forms/schemas';
import { FormError } from '../FormError';

export function DiscordPage() {
  const integrationQuery = useDiscordIntegration();
  const saveIntegrationMutation = useSaveDiscordIntegration();
  const { notify, notifyError } = useFeedback();
  const [error, setError] = useState<unknown>(null);
  const [isSaved, setIsSaved] = useState(false);
  const integration = integrationQuery.data ?? null;
  const form = useForm<DiscordIntegrationFormValues>({
    defaultValues: {
      guild_id: '',
      guild_name: '',
      oauth_client_id: '',
      oauth_client_secret: '',
      oauth_redirect_uri: '',
      bot_token: '',
      bot_enabled: false,
      is_active: false,
    },
    resolver: zodResolver(discordIntegrationFormSchema),
  });

  useEffect(() => {
    if (!integration) {
      return;
    }

    form.reset({
      guild_id: integration.guild_id ?? '',
      guild_name: integration.guild_name ?? '',
      oauth_client_id: integration.oauth.client_id ?? '',
      oauth_client_secret: '',
      oauth_redirect_uri: integration.oauth.redirect_uri ?? '',
      bot_token: '',
      bot_enabled: integration.bot_enabled,
      is_active: integration.is_active,
    });
  }, [form, integration]);

  async function submit(values: DiscordIntegrationFormValues) {
    setError(null);
    setIsSaved(false);

    try {
      await saveIntegrationMutation.mutateAsync(values);
      setIsSaved(true);
      notify('Discord settings saved.');
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not save Discord settings.');
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

      <FormError error={error ?? integrationQuery.error} />

      <Card
        component="form"
        className="settings-form"
        onSubmit={(event) => void form.handleSubmit(submit)(event)}
      >
        <CardContent className="grid gap-4">
          <div className="two-column">
            <TextField
              error={Boolean(form.formState.errors.guild_id)}
              helperText={form.formState.errors.guild_id?.message}
              label="Guild ID"
              required
              size="small"
              {...form.register('guild_id')}
            />
            <TextField
              error={Boolean(form.formState.errors.guild_name)}
              helperText={form.formState.errors.guild_name?.message}
              label="Guild name"
              required
              size="small"
              {...form.register('guild_name')}
            />
            <TextField
              error={Boolean(form.formState.errors.oauth_client_id)}
              helperText={form.formState.errors.oauth_client_id?.message}
              label="OAuth client ID"
              size="small"
              {...form.register('oauth_client_id')}
            />
            <TextField
              error={Boolean(form.formState.errors.oauth_redirect_uri)}
              helperText={form.formState.errors.oauth_redirect_uri?.message}
              label="OAuth redirect URI"
              size="small"
              type="url"
              {...form.register('oauth_redirect_uri')}
            />
            <TextField
              error={Boolean(form.formState.errors.oauth_client_secret)}
              helperText={form.formState.errors.oauth_client_secret?.message}
              label="OAuth client secret"
              placeholder={integration?.oauth.has_client_secret ? 'Stored' : ''}
              size="small"
              type="password"
              {...form.register('oauth_client_secret')}
            />
            <TextField
              error={Boolean(form.formState.errors.bot_token)}
              helperText={form.formState.errors.bot_token?.message}
              label="Bot token"
              placeholder={integration?.bot.has_token ? 'Stored' : ''}
              size="small"
              type="password"
              {...form.register('bot_token')}
            />
          </div>
          <div className="toggle-row">
            <Controller
              control={form.control}
              name="bot_enabled"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="Bot enabled"
                />
              )}
            />
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="Integration active"
                />
              )}
            />
          </div>
          <Button
            disabled={saveIntegrationMutation.isPending}
            startIcon={<SaveIcon />}
            type="submit"
          >
            Save settings
          </Button>
          {isSaved && <p className="success">Discord settings saved.</p>}
        </CardContent>
      </Card>
    </main>
  );
}
