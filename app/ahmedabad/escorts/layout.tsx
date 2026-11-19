import type { Metadata } from 'next';

const BASE_URL = 'https://www.aliyaescort.com';

export const metadata: Metadata = {
  title: 'Ahmedabad Escort & Companion Profiles | Aliya Escort',
  description:
    'Browse adult escort and companion profiles listed in Ahmedabad, Gujarat. Review each profile’s details and contact options, then confirm availability directly.',
  alternates: {
    canonical: `${BASE_URL}/ahmedabad/escorts`,
  },
  openGraph: {
    title: 'Ahmedabad Escort & Companion Profiles',
    description:
      'Explore adult escort and companion profiles listed in Ahmedabad. Profile details, contact options, and availability vary by listing.',
    url: `${BASE_URL}/ahmedabad/escorts`,
    siteName: 'Escort Ahmedabad',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmedabad Escort & Companion Profiles',
    description:
      'Review Ahmedabad profile details and contact options. Confirm availability directly with each listing.',
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

export default function AhmedabadEscortLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
