import type { Metadata } from 'next';
import Link from 'next/link';
import { DetailReveal } from '@/components/DetailReveal';
import { FeedPost } from '@/components/PostCard';
import { SiteHeader } from '@/components/SiteHeader';
import { CONVOCATIONS, convPos, convocationHref } from '@/lib/convocations';
import { CONV_STRIP } from '@/lib/landing';

export const metadata: Metadata = { title: 'Convocation stories · upGrad' };

/** The LinkedIn posts from the landing page's convocation strip, each linking to its story. */
const POSTS = CONV_STRIP.flatMap(item => (item.kind === 'photo' && item.post ? [{ slug: item.slug, post: item.post }] : []));

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
        {/* V1: photo cards. */}
        <div className="ix__grid v1-only">
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
        {/* V2: the LinkedIn posts from the convocation strip. */}
        <div className="masonry v2-only" style={{ columns: '3 300px', columnGap: 20 }}>
          {POSTS.map(({ slug, post }) => (
            <Link key={slug} href={convocationHref(slug)} className="postlink" aria-label={`LinkedIn post by ${post.name}`}>
              <FeedPost p={post} variant="card" reveal photoPos="center 30%" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
