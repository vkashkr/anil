export const ALLOWED_CITY_SLUGS = ['ahmedabad'] as const;


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

// Single source of truth for a profile's real city — used to prevent the same
// profile from being served/indexed under an unrelated city (duplicate/doorway content).
export function getProfileCitySlug(profile: {
  city?: string;
  location?: string;
  state?: string;
  district?: string;
  place?: string;
}): string | null {
  const explicitCity = String(profile.city || '').toLowerCase();
  if (/ahmedabad/i.test(explicitCity)) return 'ahmedabad';

  const text = [profile.location, profile.state, profile.district, profile.place]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ');
  if (/(ahmedabad|gujarat)/i.test(text)) return 'ahmedabad';

  return null;
}

export function getProfileSlug(profile: { name?: string; seoTitle?: string }): string {
  return makeSlug(profile.seoTitle || profile.name || '');
}
