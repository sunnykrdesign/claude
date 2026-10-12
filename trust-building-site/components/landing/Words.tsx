import Link from 'next/link';
import { FeedPost } from '@/components/PostCard';
import { POST_COUNT } from '@/lib/landing';
import { MARQUEE_A, MARQUEE_B, POSTS_HREF, type Post } from '@/lib/posts';

const count = POST_COUNT.toLocaleString('en-IN');

export function Words() {
  return (
    <section id="p5-words" className="words" aria-labelledby="words-h">
      <div className="shead">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span className="eyebrow">04 · In their own words</span>
          <h2 id="words-h" data-lines="1" className="words__h2">
            <span className="ln"><span data-ln="1">{count} learners wrote about us.</span></span>
            <span className="ln"><span data-ln="1" className="soft">We didn’t edit a word.</span></span>
          </h2>
        </div>
        <span data-rv="1"><Link href={POSTS_HREF} className="words__all">Read all {count} posts →</Link></span>
      </div>
      <div className="words__rows">
        <MarqueeRow dir={-1} items={MARQUEE_A} />
        <MarqueeRow dir={1} items={MARQUEE_B} />
      </div>
    </section>
  );
}

/** Items are rendered twice so the loop can wrap seamlessly; the copy is hidden from assistive tech. */
function MarqueeRow({ dir, items }: { dir: number; items: Post[] }) {
  return (
    <div data-mq={dir} className="mq">
      {[...items, ...items].map((p, i) => <FeedPost key={i} p={p} variant="marquee" hidden={i >= items.length} />)}
    </div>
  );
}

export function Close() {
  return (
    <section id="p5-close" className="close" aria-labelledby="close-h">
      <div className="close__inner">
        <span data-rv="1" className="close__eyebrow">Your turn</span>
        <h2 id="close-h" data-lines="1" className="close__h2">
          <span className="ln"><span data-ln="1">The next post</span></span>
          <span className="ln"><span data-ln="1" className="it">could be yours.</span></span>
        </h2>
        <p data-rv="1" className="close__p">Tell us where you’re starting from and we’ll show you the programmes the people in these posts took.</p>
        <div data-rv="1" className="close__ctas">
          <a href="#" className="pill close__primary">Explore programmes<span className="arr arr--x">→</span></a>
          <Link href={POSTS_HREF} className="pill close__ghost">Read all {count} posts</Link>
        </div>
      </div>
    </section>
  );
}
