'use client';

import { useEffect } from 'react';

/**
 * Reveals for the inner pages: `[data-rv]` blocks rise and un-blur, `[data-ln]`
 * headline lines slide up out of their mask, staggered 110ms within a heading.
 * Hidden states live in CSS behind `html.motion`, so this only flips `.is-in`.
 * Pass a changing `scanKey` when the list re-renders (e.g. a filter) so new items get observed.
 */
export function DetailReveal({ scanKey }: { scanKey?: string }) {
  useEffect(() => {
    if (!document.documentElement.classList.contains('motion')) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      const h = el.hasAttribute('data-ln') ? el.closest('h1,h2,h3') : null;
      const sib = h ? [...h.querySelectorAll('[data-ln]')].indexOf(el) : 0;
      el.style.transitionDelay = 120 + sib * 110 + 'ms';
      el.classList.add('is-in');
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.detail [data-ln]:not(.is-in), .detail [data-rv]:not(.is-in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [scanKey]);
  return null;
}
