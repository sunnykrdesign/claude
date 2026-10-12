import type { Metadata } from 'next';
import Link from 'next/link';
import { DetailReveal } from '@/components/DetailReveal';
import { SiteHeader } from '@/components/SiteHeader';
import { IMMERSIONS, immersionHref } from '@/lib/immersions';

export const metadata: Metadata = { title: 'Immersion events · upGrad' };

export default function ImmersionEvents() {
  return (
    <div className="ix detail">
      <DetailReveal />
      <SiteHeader back="/#p5-imm" label="Back" tone="light" />
      <main className="ix__body">
        <div className="ix__head">
          <div>
            <span data-rv="1" className="eyebrow">Immersion · All events</span>
            <h1 className="d-h1"><span className="ln"><span data-ln="1">Immersion</span></span></h1>
          </div>
        </div>
        <div className="ix__grid">
          {IMMERSIONS.map((u, k) => (
            <Link key={u.slug} data-rv="1" href={immersionHref(u.slug)} className="icard">
              <div className="icard__media" style={{ aspectRatio: '800/420' }}>
                <img src={u.img} alt={u.alt} />
                <span className="icard__cta" aria-hidden="true">View event<span>→</span></span>
              </div>
              <span className="icard__meta"><span>{u.place}</span><span>{String(k + 1).padStart(2, '0')}</span></span>
              <span className="icard__title">{u.title}</span>
              <span className="icard__desc">{u.desc}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
