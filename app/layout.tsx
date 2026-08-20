import { getArenaEmailId } from '@/lib/arena-email'
import { ArenaEmailProvider } from '@/components/arena-email-provider'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Eventgroove Search to Content',
  description: 'Turn a keyword into an SEO article draft or an enrichment plan.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const emailId = await getArenaEmailId()

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-slate-800 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1"><ArenaEmailProvider emailId={emailId}>{children}</ArenaEmailProvider></div>
          <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-slate-400">
            Internal tool — Eventgroove SEO content pipeline
          </footer>
        </div>
      </body>
    </html>
  );
}
