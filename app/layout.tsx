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
  title: "Aliya escort",
  description: "Local girls for escort services in Ahmedabad, Gujarat. Contact us for companionship and adult services.",
  icons: {
    icon: '/A.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header style={{padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '2rem', background: '#ec1fb9'}}>Aliya-Escort</header>
          {children}
          <footer style={{position: 'fixed', left: 0, bottom: 0, width: '100%', background: '#fff', borderTop: '1px solid #eee', zIndex: 100}}>
            <div className="call-buttons">
              <a href="tel:+919974599843" className="call-btn call">Call Now</a>
              <a href="https://wa.me/919974599843?text=Hello, %20Aliya%20Escort%20 Ahmedabad" className="call-btn whatsapp">WhatsApp</a>
            </div>
            <div style={{marginTop: '0.5rem', fontSize: '0.95rem', color: '#555', textAlign: 'center', fontWeight: 'normal'}}>
              <strong>18+ DISCLAIMER:</strong> This website offers adult services intended for individuals 18 years and older.
            </div>
          </footer>
      </body>
    </html>
  );
}
