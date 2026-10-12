import type { Metadata } from 'next';
import Link from 'next/link';
import { DetailReveal } from '@/components/DetailReveal';
import { SiteHeader } from '@/components/SiteHeader';
import { CONVOCATIONS, convPos, convocationHref } from '@/lib/convocations';

export const metadata: Metadata = { title: 'Convocation stories · upGrad' };

export default function ConvocationStories() {
  return (
    <div className="ix detail">
      <DetailReveal />
      <SiteHeader back="/#p5-conv" label="Back" tone="light" />
      <main className="ix__body">
        <div className="ix__head">
          <div>
            <span data-rv="1" className="eyebrow">Convocation · All stories</span>
            <h1 className="d-h1">
              <span className="ln"><span data-ln="1">Months on screen.</span></span>
              <span className="ln"><span data-ln="1" className="soft">One day on stage.</span></span>
            </h1>
          </div>
          <p data-rv="1" className="shead__p">Trade your virtual classroom for the campus grounds as you finally meet the peers you’ve studied alongside for months.</p>
        </div>
        <div className="ix__grid">
          {CONVOCATIONS.map((c, k) => (
            <Link key={c.slug} data-rv="1" href={convocationHref(c.slug)} className="icard">
              <div className="icard__media" style={{ aspectRatio: '4/3' }}>
                <img src={c.img} alt={c.alt} style={{ objectPosition: convPos(c) }} />
                <span className="icard__cta" aria-hidden="true">View story<span>→</span></span>
              </div>
              <span className="icard__meta"><span>{c.place}</span><span>{String(k + 1).padStart(2, '0')}</span></span>
              <span className="icard__title">{c.title}</span>
              <span className="icard__desc">{c.desc}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
