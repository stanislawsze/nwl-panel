import HistoryIcon from '@mui/icons-material/History';
import {
  Chip,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useState } from 'react';

import { useAuditLogs } from '../../features/audit/use-audit-logs';
import { formatDate, title } from '../../lib/format';
import { useTenantPermissions } from '../../shared/auth/permissions';
import type { TenantAuditLog } from '../../types';
import { FormError } from '../FormError';

const auditEvents = [
  'tenant.created',
  'tenant.switched',
  'tenant.member_added',
  'tenant.member_role_updated',
  'tenant.member_removed',
  'tenant.invitation_created',
  'tenant.invitation_resent',
  'tenant.invitation_revoked',
  'tenant.invitation_accepted',
  'tenant.invitation_registered',
];

export function AuditLogPage() {
  const { canViewAuditLogs } = useTenantPermissions();
  const [eventFilter, setEventFilter] = useState<string | null>(null);
  const auditLogsQuery = useAuditLogs(eventFilter, canViewAuditLogs);
  const logs = auditLogsQuery.data ?? [];

  if (!canViewAuditLogs) {
    return (
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Security</p>
            <h1>Audit log</h1>
          </div>
        </div>
        <section className="panel">
          <h2>Permission required</h2>
          <p className="muted">
            Your current tenant role cannot view audit logs.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Security</p>
          <h1>Audit log</h1>
        </div>
        <Chip icon={<HistoryIcon />} label={`${logs.length} events`} />
      </div>

      <FormError error={auditLogsQuery.error} />

      <section className="panel">
        <div className="section-heading">
          <h2>Tenant activity</h2>
          <ToggleButtonGroup
            aria-label="Audit event filter"
            exclusive
            onChange={(_, value: string | null) => {
              setEventFilter(value === 'all' || value === null ? null : value);
            }}
            size="small"
            value={eventFilter ?? 'all'}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="tenant.invitation_created">
              Invites
            </ToggleButton>
            <ToggleButton value="tenant.member_added">Members</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <TextField
          label="Event"
          onChange={(event) => {
            setEventFilter(event.target.value || null);
          }}
          select
          size="small"
          value={eventFilter ?? ''}
        >
          <MenuItem value="">All events</MenuItem>
          {auditEvents.map((event) => (
            <MenuItem key={event} value={event}>
              {eventLabel(event)}
            </MenuItem>
          ))}
        </TextField>

        <div className="table">
          {logs.map((log) => (
            <article className="table-row audit-row" key={log.id}>
              <span>
                <strong>{eventLabel(log.event)}</strong>
                <small>{log.description}</small>
              </span>
              <span>
                {log.causer?.name ?? 'System'}
                <small>{log.causer?.email ?? 'No causer'}</small>
              </span>
              <span>
                {formatDate(log.created_at)}
                <small>{propertiesSummary(log)}</small>
              </span>
            </article>
          ))}
          {!auditLogsQuery.isLoading && logs.length === 0 && (
            <p className="muted">No audit events match this filter.</p>
          )}
          {auditLogsQuery.isLoading && (
            <p className="muted">Loading events...</p>
          )}
        </div>
      </section>
    </main>
  );
}

function eventLabel(event: string | null) {
  if (!event) {
    return 'Unknown event';
  }

  return title(event.replace(/^tenant\./, '').replace(/_/g, ' '));
}

function propertiesSummary(log: TenantAuditLog) {
  const values = [
    stringProperty(log, 'email'),
    stringProperty(log, 'member_email'),
    stringProperty(log, 'new_role'),
    stringProperty(log, 'role'),
  ].filter(Boolean);

  return values.length > 0 ? values.join(' - ') : `#${log.id}`;
}

function stringProperty(log: TenantAuditLog, key: string) {
  const value = log.properties[key];

  return typeof value === 'string' ? value : null;
}
