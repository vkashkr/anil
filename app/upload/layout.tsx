import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Upload',
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
