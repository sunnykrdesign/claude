import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces, Instrument_Serif } from 'next/font/google';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz', 'SOFT'], variable: '--font-fraunces', display: 'swap' });
const sans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'In their own words · upGrad',
  description: 'Real posts from upGrad learners, on their own profiles, in their own words.',
};

export const viewport: Viewport = { themeColor: '#0E0C0B' };

// Runs before first paint: opt in to the reveal motion only when it is allowed,
// so content is never hidden for no-JS or reduced-motion visitors.
// Design version (V1–V4): set before paint from the visitor's last choice, default V3.
const versionBoot = `try{var v=localStorage.getItem('tb-ver')}catch(e){}document.documentElement.dataset.ver=v==='1'||v==='2'||v==='4'?v:'3'`;

// The toggle is plain markup plus this delegated handler, so it also works without React.
const versionToggle = `document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-set-ver]');if(!b)return;var v=b.getAttribute('data-set-ver');document.documentElement.dataset.ver=v;try{localStorage.setItem('tb-ver',v)}catch(e){}document.querySelectorAll('[data-rv],[data-ln]').forEach(function(el){el.classList.add('is-in')});window.dispatchEvent(new Event('resize'))});`;

const motionGate = `try{if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${fraunces.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: versionBoot }} />
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body>
        {children}
        <div className="vtoggle" role="group" aria-label="Design version">
          <button type="button" data-set-ver="1">V1</button>
          <button type="button" data-set-ver="2">V2</button>
          <button type="button" data-set-ver="3">V3</button>
          <button type="button" data-set-ver="4">V4</button>
        </div>
        <script dangerouslySetInnerHTML={{ __html: versionToggle }} />
      </body>
    </html>
  );
}
