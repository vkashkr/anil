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

// Single source of truth for a profile's real city — used to prevent the same
// profile from being served/indexed under an unrelated city (duplicate/doorway content).
export function getProfileCitySlug(profile: { city?: string; location?: string; state?: string }): string | null {
  const text = [profile.city, profile.location, profile.state]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())
    .join(' ');

  if (/(hyderabad|hydrabad|hyderbad|secunderabad|telangana)/i.test(text)) {
    return 'hyderabad';
  }
  if (/(ahmedabad|gujarat)/i.test(text)) {
    return 'ahmedabad';
  }

  const candidates = [profile.city, profile.location, profile.state]
    .filter(Boolean)
    .map((v) => String(v).split(/[|,/]/)[0]?.trim() || '')
    .map((v) => makeSlug(v))
    .filter(Boolean);

  return candidates[0] || null;
}
