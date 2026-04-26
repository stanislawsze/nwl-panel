export function formatDate(value: string | null): string {
  if (!value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function title(value: string | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}
