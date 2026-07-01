import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ClientCityRedirect from './ClientCityRedirect';
import { formatCityName, makeSlug, resolveAllowedCitySlug } from '@/app/lib/city-slugs';

const BASE_URL = 'https://www.aliyaescort.com';

export async function generateMetadata({ params }: { params?: any }): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const cityRaw = String(resolvedParams?.city ?? 'ahmedabad');
  const citySlug = resolveAllowedCitySlug(cityRaw) ?? 'ahmedabad';
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

export default async function CityEscortLayout({ children, params }: { children: React.ReactNode; params?: any }) {
  const resolvedParams = params ? await params : undefined;
  if (resolvedParams?.city) {
    const requested = makeSlug(String(resolvedParams.city));
    const canonical = resolveAllowedCitySlug(String(resolvedParams.city));
    if (!canonical) notFound();
    if (requested !== canonical) {
      redirect(`/${canonical}/escorts`);
    }
  }

  // `params` may be absent in some edge render paths; keep client fallback.
  const isServerParamMissing = !resolvedParams?.city;
  return (
    <>
      {isServerParamMissing && <ClientCityRedirect />}
      {children}
    </>
  );
}
