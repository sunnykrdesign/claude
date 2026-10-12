import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'In their own words · upGrad',
  description: 'Real posts from upGrad learners, on their own profiles, in their own words.',
};

export const viewport: Viewport = { themeColor: '#0E0C0B' };

// Runs before first paint: opt in to the reveal motion only when it is allowed,
// so content is never hidden for no-JS or reduced-motion visitors.
const motionGate = `try{if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
