import type { Metadata } from 'next';

const BASE_URL = 'https://aliyaescort.com';

export const metadata: Metadata = {
  title: 'Ahmedabad Escort Service | Call Girls in Ahmedabad | Aliya Escort',
  description:
    'Browse 1000+ verified ahmedabad escort profiles. Independent call girls in Ahmedabad available 24/7 for hotel & home service. No advance, 100% real photos. Book now.',
  keywords: [
    'ahmedabad escort',
    'ahmedabad escort service',
    'escort in ahmedabad',
    'call girls in ahmedabad',
    'ahmedabad call girls',
    'independent escort ahmedabad',
    'female escort ahmedabad',
    'vip escort ahmedabad',
    'college girl escort ahmedabad',
    'housewife escort ahmedabad',
    'escort near me ahmedabad',
    'local call girls ahmedabad',
  ],
  alternates: {
    canonical: `${BASE_URL}/Ahmedabad/escorts`,
  },
  openGraph: {
    title: 'Ahmedabad Escort Service | 1000+ Verified Profiles',
    description:
      'Browse genuine, verified ahmedabad escort profiles. Independent call girls available 24/7. No advance payment. Real photos only.',
    url: `${BASE_URL}/Ahmedabad/escorts`,
    siteName: 'Aliya Escort Ahmedabad',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmedabad Escort Service | Aliya Escort',
    description:
      '1000+ verified ahmedabad escort profiles. Book independent call girls in Ahmedabad 24/7.',
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
