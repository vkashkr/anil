import type { Metadata } from 'next';
import ClientCityRedirect from './ClientCityRedirect';

const BASE_URL = 'https://www.aliyaescort.com';

const makeSlug = (raw: string) =>
  String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const formatCityName = (raw: string) =>
  String(raw)
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');

export async function generateMetadata({ params }: { params?: any }): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const cityRaw = String(resolvedParams?.city ?? 'Hydrabad');
  const citySlug = makeSlug(cityRaw || 'Hydrabad');
  const cityDisplay = formatCityName(citySlug);

  const title = `Escorts ${cityDisplay}, India`;
  const description = `Browse 1000+ verified ${cityDisplay.toLowerCase()} escort profiles. Independent call girls in ${cityDisplay} available 24/7 for hotel & home service. No advance, 100% real photos. Book now.`;
  const url = `${BASE_URL}/${encodeURIComponent(citySlug)}/escorts`;

  return {
    title,
    description,
    keywords: [
      `${citySlug} escort`,
      `${citySlug} escorts`,
      `${citySlug} escort service`,
      `escort in ${citySlug}`,
      `call girls in ${citySlug}`,
      `${citySlug} call girls`,
      `independent escort ${citySlug}`,
      `female escort ${citySlug}`,
      `vip escort ${citySlug}`,
      `college girl escort ${citySlug}`,
      `housewife escort ${citySlug}`,
      `escort near me ${citySlug}`,
      `local call girls ${citySlug}`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${cityDisplay} Escorts | 1000+ Verified Profiles`,
      description,
      url,
      siteName: `Escorts ${cityDisplay}`,
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cityDisplay} Escorts`,
      description,
      site: '@AliyaEscort',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function CityEscortLayout({ children, params }: { children: React.ReactNode; params?: any }) {
  // `params` may be a promise; render client redirect when not provided server-side
  const isServerParamMissing = !params;
  return (
    <>
      {isServerParamMissing && <ClientCityRedirect />}
      {children}
    </>
  );
}
