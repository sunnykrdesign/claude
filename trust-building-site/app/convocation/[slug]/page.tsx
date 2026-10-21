import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DetailReveal } from '@/components/DetailReveal';
import { FeedPost } from '@/components/PostCard';
import { SiteHeader } from '@/components/SiteHeader';
import { CONVOCATIONS, convPos, convocationHref } from '@/lib/convocations';
import { CONVOCATION_POSTS, POSTS_HREF } from '@/lib/posts';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => CONVOCATIONS.map(c => ({ slug: c.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = CONVOCATIONS.find(x => x.slug === slug);
  return c ? { title: `${c.title} · upGrad`, description: c.desc } : {};
}

/** "The day in photos" mosaic: [image, alt, rows, cols, object-position]. */
const PHOTOS: [string, string, number, number, string][] = [
  ['conv-l1.png', 'Graduate at IIT Bombay convocation', 2, 2, 'center'],
  ['conv-p2.png', 'Graduate holding a degree folder', 2, 1, 'center 30%'],
  ['conv-l3.png', 'Graduate at the annual convocation', 1, 1, 'center'],
  ['conv-l5.png', 'Three graduates at IIIT Bangalore', 1, 1, 'center'],
  ['conv-l4.png', 'Annual convocation group photograph', 1, 1, 'center'],
  ['conv-l2.png', 'Graduate at IIT Bombay convocation', 1, 1, 'center'],
];

export default async function ConvocationDetail({ params }: Params) {
  const { slug } = await params;
  const i = CONVOCATIONS.findIndex(x => x.slug === slug);
  if (i < 0) notFound();
  const c = CONVOCATIONS[i];
  const next = CONVOCATIONS[(i + 1) % CONVOCATIONS.length];
  const others = CONVOCATIONS.filter(x => x !== c);

  return (
    <div className="root root--cream detail cvd">
      <DetailReveal />
      <SiteHeader back="/convocation/" label="All stories" tone="light" />

      <main>
        <section className="d-hero">
          <div className="d-hero__grid">
            <div className="d-hero__copy">
              <span data-rv="1" className="eyebrow eyebrow--wide">Convocation · {c.place}</span>
              <h1 className="d-h1"><span className="ln"><span data-ln="1">{c.title}</span></span></h1>
              <p data-rv="1" className="d-lede">{c.desc}</p>
              <div data-rv="1" className="d-ctas">
                <Link href={convocationHref(next.slug)} className="pill cvd__next">Next moment<span className="arr arr--x">→</span></Link>
                <Link href="/#p5-conv" className="pill pill--ghost cvd__ghost">Back to convocation</Link>
              </div>
            </div>
            <div data-rv="1" className="cvd__photo">
              <div className="cvd__frame" style={{ background: 'var(--warm)' }}>
                <img src={c.img} alt={c.alt} data-kb="1" />
              </div>
            </div>
          </div>
          <div className="d-facts">
            {c.facts.map(([k, v]) => (
              <div key={k} data-rv="1" className="d-fact"><span>{k}</span><span>{v}</span></div>
            ))}
          </div>
        </section>

        <section className="d-section cvd__about">
          <div className="d-two">
            <h2 data-rv="1" className="eyebrow" style={{ margin: 0 }}>01 · The moment</h2>
            <div>{c.about.map(p => <p key={p} data-rv="1">{p}</p>)}</div>
          </div>
        </section>

        <section className="d-section cvd__photos" aria-labelledby="photos-h">
          <div className="d-more__head">
            <span data-rv="1" className="eyebrow">02 · The day in photos</span>
            <h2 id="photos-h" className="d-h2">
              <span className="ln"><span data-ln="1">Caps, gowns,</span></span>
              <span className="ln"><span data-ln="1" className="soft">and proud families.</span></span>
            </h2>
          </div>
          <div className="mosaic">
            {PHOTOS.map(([f, alt, rows, cols, pos]) => (
              <figure key={f} data-rv="1" style={{ gridRow: `span ${rows}`, gridColumn: `span ${cols}` }}>
                <img src={'/assets/' + f} alt={alt} loading="lazy" style={{ objectPosition: pos }} />
              </figure>
            ))}
          </div>
        </section>

        <section className="d-section d-li" style={{ zIndex: 4 }} aria-labelledby="li-h">
          <div className="d-li__head">
            <div>
              <span data-rv="1" className="eyebrow">03 · From LinkedIn</span>
              <h2 id="li-h" className="d-h2">
                <span className="ln"><span data-ln="1">Graduates,</span></span>
                <span className="ln"><span data-ln="1" className="soft">in their own words.</span></span>
              </h2>
            </div>
            <span data-rv="1"><Link href={POSTS_HREF} className="viewall">View all →</Link></span>
          </div>
          <div className="cols3 masonry">
            {CONVOCATION_POSTS.map(p => <FeedPost key={p.name + p.date} p={p} variant="card" reveal photoPos="center 30%" />)}
          </div>
        </section>

        <section className="d-more" style={{ zIndex: 5 }} aria-labelledby="more-h">
          <div className="d-more__head">
            <span data-rv="1" className="eyebrow eyebrow--dark">04 · More from convocation</span>
            <h2 id="more-h" className="d-h2">
              <span className="ln"><span data-ln="1">Every graduate,</span></span>
              <span className="ln"><span data-ln="1" className="accent">on stage.</span></span>
            </h2>
          </div>
          <div className="d-grid">
            {others.map(o => (
              <Link key={o.slug} data-rv="1" href={convocationHref(o.slug)} className="ocard">
                <div className="ocard__media" style={{ background: 'var(--warm)' }}>
                  <img src={o.img} alt={o.alt} style={{ objectPosition: convPos(o) }} />
                </div>
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
