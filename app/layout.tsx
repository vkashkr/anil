import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ahmedabad.aliyaescort.com'),
  title: {
    default: "Call Girls in Ahmedabad | Premium Escort Service | Aliya Escort",
    template: "%s | Aliya Escort Ahmedabad",
  },
  description: "Looking for call girls in Ahmedabad? Aliya Escort provides genuine, independent, and high-profile call girls directly to your hotel or home. 100% safe & trusted service.",
  keywords: ["ahmedabad escort", "escort service ahmedabad", "call girls in ahmedabad", "ahmedabad call girls", "ahmedabad escort service", "independent call girls ahmedabad", "college girls ahmedabad", "housewife escort ahmedabad", "vip escort service", "russian call girls ahmedabad", "night out girls ahmedabad", "female escort ahmedabad", "local call girls ahmedabad", "escort girls ahmedabad", "cheap escort ahmedabad"],
  alternates: {
    canonical: 'https://ahmedabad.aliyaescort.com/',
  },
  openGraph: {
    title: "Call Girls in Ahmedabad | Aliya Escort Service",
    description: "Book specific verified call girls in Ahmedabad. No advance needed. 24/7 service available.",
    url: 'https://ahmedabad.aliyaescort.com/',
    siteName: 'Aliya Escort Ahmedabad',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Call Girls in Ahmedabad | Aliya Escort Service',
    description: 'Book verified call girls in Ahmedabad. No advance needed. 24/7 service available.',
    site: '@AliyaEscort',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Are your call girls in Ahmedabad real and verified?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, every profile on Aliya Escort is 100% genuine and manually verified. We conduct identity checks and ensure all photos are recent and unedited.' } },
    { '@type': 'Question', name: 'Is my privacy safe when booking an escort in Ahmedabad?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. We maintain strict confidentiality — your personal details, booking history, and contact information are never shared with anyone.' } },
    { '@type': 'Question', name: 'How fast can I book a call girl in Ahmedabad?', acceptedAnswer: { '@type': 'Answer', text: 'Our average delivery time is just 30 minutes within Ahmedabad city limits. We operate 24/7 including holidays.' } },
    { '@type': 'Question', name: 'What payment methods are accepted for Ahmedabad escort service?', acceptedAnswer: { '@type': 'Answer', text: 'We accept cash payment on delivery only. No advance payment or online transfer is required. You pay only when satisfied.' } },
    { '@type': 'Question', name: 'Do you offer both incall and outcall escort services in Ahmedabad?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, we offer both. Incall means you visit our private location. Outcall means the escort visits your hotel, home, or any private location of your choice in Ahmedabad.' } },
    { '@type': 'Question', name: 'What areas in Ahmedabad do you serve?', acceptedAnswer: { '@type': 'Answer', text: 'We serve all major areas including SG Highway, Satellite, Vastrapur, Prahlad Nagar, Bodakdev, Navrangpura, Maninagar, Ellisbridge, Paldi, Thaltej, Ambawadi, Chandkheda, Bopal, Gota, and more.' } },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ahmedabad.aliyaescort.com/#business",
  "name": "Aliya Escort Ahmedabad",
  "image": "https://ahmedabad.aliyaescort.com/aliya-logo-A-4-improved.svg",
  "description": "Premium call girl and escort agency in Ahmedabad offering independent and high-profile companions.",
  "url": "https://ahmedabad.aliyaescort.com/",
  "telephone": "+919974599843",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "SG Highway",
    "addressLocality": "Ahmedabad",
    "addressRegion": "Gujarat",
    "postalCode": "380054",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 23.0225,
    "longitude": 72.5714
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  ],
  "priceRange": "₹1000 - ₹10000"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD structured data in <head> for optimal crawler discovery */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-black via-fuchsia-950 to-gray-900`}
      >
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
