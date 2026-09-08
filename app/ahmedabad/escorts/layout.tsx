import type { Metadata } from 'next';

const BASE_URL = 'https://www.aliyaescort.com';

export const metadata: Metadata = {
  title: 'Escort Ahmedabad, Gujarat, India',
  description:
    'Browse verified Ahmedabad escort profiles. Independent adults in Ahmedabad available 24/7 for private companionship. Real photos and direct contact.',
  keywords: [
    'ahmedabad escort',
    'ahmedabad escorts',
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
    canonical: `${BASE_URL}/ahmedabad/escorts`,
  },
  openGraph: {
    title: 'Ahmedabad Escort Service | Verified Profiles',
    description:
      'Browse genuine, verified ahmedabad escort profiles. Independent call girls available 24/7. No advance payment. Real photos only.',
    url: `${BASE_URL}/ahmedabad/escorts`,
    siteName: 'Escort Ahmedabad',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmedabad Escort Service',
    description:
      'Verified Ahmedabad escort profiles with direct contact and private companionship availability.',
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
