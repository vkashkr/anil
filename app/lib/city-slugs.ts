export const ALLOWED_CITY_SLUGS = ['ahmedabad', 'hyderabad'] as const;


export const makeSlug = (raw: string) =>
  String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const formatCityName = (raw: string) =>
  String(raw || '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');

export const resolveAllowedCitySlug = (raw: string): (typeof ALLOWED_CITY_SLUGS)[number] | null => {
  const slug = makeSlug(raw);
  return ALLOWED_CITY_SLUGS.includes(slug as (typeof ALLOWED_CITY_SLUGS)[number])
    ? (slug as (typeof ALLOWED_CITY_SLUGS)[number])
    : null;
};
