import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DetailReveal } from '@/components/DetailReveal';
import { FeedPost } from '@/components/PostCard';
import { SiteHeader } from '@/components/SiteHeader';
import { IMMERSIONS, immersionHref } from '@/lib/immersions';
import { POSTS_HREF, immersionPosts } from '@/lib/posts';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => IMMERSIONS.map(u => ({ slug: u.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const u = IMMERSIONS.find(x => x.slug === slug);
  return u ? { title: `${u.title} · upGrad`, description: u.desc } : {};
}

export default async function ImmersionDetail({ params }: Params) {
  const { slug } = await params;
  const u = IMMERSIONS.find(x => x.slug === slug);
  if (!u) notFound();
  const others = IMMERSIONS.filter(x => x !== u);
  const back = '/#p5-imm';

  return (
    <div className="root detail imd">
      <DetailReveal />
      <div className="grain" aria-hidden="true" />
      <SiteHeader back={back} label="All cities" tone="dark" />

      <main>
        <section className="d-hero">
          {/* Event card, styled after the Luma event card. */}
          <div data-rv="1" className="ecard">
            <div className="ecard__copy">
              <span className="ecard__brand" aria-hidden="true">luma<span>✦</span></span>
              <h1 className="ecard__title">{u.title}</h1>
              <a href={u.url} target="_blank" rel="noopener" className="ecard__rsvp">RSVP<span className="sr-only"> on Luma (opens in a new tab)</span></a>
            </div>
            <div className="ecard__poster">
              <img src="/assets/ftgu-poster.webp" alt={`From the Ground Up poster: learn coffee from a master roaster, ${u.city}`} data-kb="1" />
            </div>
          </div>
          <div className="d-facts">
            {u.facts.map(f => (
              <div key={f.k} data-rv="1" className="d-fact"><span>{f.k}</span><span>{f.v}</span></div>
            ))}
          </div>
        </section>

        <section className="d-section imd__plan">
          <div className="d-two">
            <div className="imd__col">
              <h2 data-rv="1" className="eyebrow" style={{ margin: 0 }}>01 · Here’s what’s brewing</h2>
              <ol className="imd__list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {u.brew.map(d => (
                  <li key={d.d} data-rv="1" className="imd__brew"><span>{d.d}</span><span>{d.t}</span></li>
                ))}
              </ol>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              <div className="imd__about">
                <h2 data-rv="1" className="eyebrow" style={{ margin: 0 }}>02 · About</h2>
                {u.about.map(p => <p key={p} data-rv="1">{p}</p>)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 data-rv="1" className="eyebrow" style={{ margin: 0 }}>03 · Good to know</h2>
                <dl className="imd__list" style={{ margin: 0 }}>
                  {u.info.map(a => (
                    <div key={a.d} data-rv="1" className="imd__info"><dt>{a.d}</dt><dd style={{ margin: 0 }}>{a.t}</dd></div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="d-section d-li" style={{ zIndex: 3 }} aria-labelledby="li-h">
          <div className="d-li__head">
            <div>
              <span data-rv="1" className="eyebrow">From LinkedIn</span>
              <h2 id="li-h" className="d-h2">
                <span className="ln"><span data-ln="1">What people said</span></span>
                <span className="ln"><span data-ln="1" className="soft">after the last one.</span></span>
              </h2>
            </div>
            <span data-rv="1"><Link href={POSTS_HREF} className="viewall">View all →</Link></span>
          </div>
          <div className="grid3">
            {immersionPosts(u.city).map(p => <FeedPost key={p.name} p={p} variant="card" reveal />)}
          </div>
        </section>

        <section className="d-more" style={{ zIndex: 4 }} aria-labelledby="more-h">
          <div className="d-more__head">
            <span data-rv="1" className="eyebrow eyebrow--dark">Other cities</span>
            <h2 id="more-h" className="d-h2">
              <span className="ln"><span data-ln="1">Not your city?</span></span>
              <span className="ln"><span data-ln="1" className="accent">Try another one.</span></span>
            </h2>
          </div>
          <div className="d-grid">
            {others.map(o => (
              <Link key={o.slug} data-rv="1" href={immersionHref(o.slug)} className="ocard">
                <div className="ocard__media"><img src={o.img} alt={o.alt} /></div>
                <span className="ocard__meta"><span>{o.place}</span><span aria-hidden="true">→</span></span>
                <span className="ocard__title">{o.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
