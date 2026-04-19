export function sanitize(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;')
    .replace(/;/g, '&#59;')
    .trim();
}
