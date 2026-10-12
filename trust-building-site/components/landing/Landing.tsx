'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LandingMotion, type HeaderState } from '@/lib/landingMotion';
import { ABROAD_POSTS, NAV, POST_COUNT } from '@/lib/landing';
import { Hero, Manifesto } from './Hero';
import { Convocation } from './Convocation';
import { StudyAbroad } from './StudyAbroad';
import { Immersion } from './Immersion';
import { Close, Words } from './Words';

export function Landing() {
  const [hdr, setHdr] = useState<HeaderState>({ solid: false, hide: false, sec: '' });
  const [sa, setSa] = useState(0);
  const saRef = useRef(0);
  const motion = useRef<LandingMotion | null>(null);

  const saGo = useCallback((i: number) => {
    const n = ABROAD_POSTS.length;
    saRef.current = ((i % n) + n) % n;
    motion.current?.resetSaTimer();
    setSa(saRef.current);
  }, []);

  useEffect(() => {
    const m = new LandingMotion({
      onHeader: setHdr,
      getSa: () => saRef.current,
      saGo,
      saCount: ABROAD_POSTS.length,
      skipPreload: location.hash.length > 1,
    });
    motion.current = m;
    m.start();
    return () => m.stop();
  }, [saGo]);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: smooth ? 'smooth' : 'auto' });
    history.replaceState(null, '', '#' + id);
  };

  return (
    <div id="root" className="root">
      <div id="pre" className="pre" aria-hidden="true">
        <div className="pre__top">
          <span className="logo">upGrad</span>
          <span className="pre__tag">In their own words</span>
        </div>
        <div className="pre__bottom">
          <div className="pre__row">
            <span id="pre-pct" className="pre__pct">000</span>
            <span className="pre__note">Collecting {POST_COUNT.toLocaleString('en-IN')} posts written by upGrad learners on their own LinkedIn.</span>
          </div>
          <div className="pre__track"><div id="pre-bar" className="pre__bar" /></div>
        </div>
      </div>

      <div className="grain" aria-hidden="true" />
      <div id="cur" className="cursor" aria-hidden="true"><span id="cur-l" /></div>

      <header className={`hdr${hdr.solid ? ' hdr--solid' : ''}${hdr.hide ? ' hdr--hidden' : ''}`}>
        <a href="#p5-hero" className="logo" onClick={e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }}>upGrad</a>
        <nav className="hdr__nav" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={'#' + id} className="hdr__link" aria-current={hdr.sec === id ? 'true' : undefined} onClick={goTo(id)}>{label}</a>
          ))}
        </nav>
        <a href="#" data-mag="1" className="hdr__cta">Explore programmes</a>
        <span id="hdr-prog" className="hdr__prog" />
      </header>

      <main>
        <Hero onRead={goTo('p5-man')} />
        <Manifesto />
        <Convocation />
        <StudyAbroad active={sa} go={saGo} onPause={p => motion.current?.setSaPaused(p)} />
        <Immersion goStep={i => motion.current?.goStep(i)} />
        <Words />
        <Close />
      </main>

      <footer className="foot">
        <span className="logo">upGrad</span>
        <p>Every post on this page links to the live original on its author’s profile. We didn’t edit a word.</p>
      </footer>
    </div>
  );
}
