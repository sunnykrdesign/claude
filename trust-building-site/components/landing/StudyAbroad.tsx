import Link from 'next/link';
import { PostTile } from '@/components/PostCard';
import { ABROAD_POSTS } from '@/lib/landing';
import { ABROAD_HREF, ABROAD_VIDEOS } from '@/lib/posts';

type Props = { active: number; go: (i: number) => void; onPause: (paused: boolean) => void };

/** Position of a post relative to the active one, wrapped so the deck loops. */
const offset = (i: number, active: number, n: number) => {
  let o = i - active;
  if (o > n / 2) o -= n;
  if (o < -n / 2) o += n;
  return o;
};

export function StudyAbroad({ active, go, onPause }: Props) {
  const n = ABROAD_POSTS.length;
  return (
    <section id="p5-abroad" className="abroad" aria-labelledby="abroad-h">
      <div className="shead">
        <div data-lines="1" className="shead__titles">
          <span className="eyebrow eyebrow--lg">02</span>
          <h2 id="abroad-h" className="shead__h2"><span className="ln ln--loose"><span data-ln="1">Study abroad</span></span></h2>
          <p className="shead__sub"><span className="ln ln--loose"><span data-ln="1">When the classroom <span className="soft">got a passport.</span></span></span></p>
        </div>
        <p data-rv="1" className="shead__p">Some learners took their programme further than their desk. These are the posts they wrote from the other side.</p>
      </div>

      <div id="ab-panel" data-rv="1" className="panel">
        <div className="panel__backdrop" aria-hidden="true">
          <img id="ab-bg" className="panel__bg" src="/assets/sa-plane.png" alt="" />
          <div className="panel__shade" />
        </div>
        <Link href={ABROAD_HREF} className="viewall viewall--white panel__all">View all →</Link>
        <h3 className="panel__h3">They left for a degree. <em>They wrote home on LinkedIn.</em></h3>

        <div
          id="ab-stage"
          className="sa-stage"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="LinkedIn posts from learners who studied abroad. Use the left and right arrow keys to browse."
          onKeyDown={e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
          }}
          onMouseEnter={() => onPause(true)}
          onMouseLeave={() => onPause(false)}
          onFocus={() => onPause(true)}
          onBlur={() => onPause(false)}
        >
          {ABROAD_POSTS.map((p, i) => {
            const o = offset(i, active, n), a = Math.abs(o), sg = Math.sign(o);
            const x = sg * (a === 0 ? 0 : a === 1 ? 66 : 112);
            return (
              <div
                key={i}
                className="sa-slot"
                aria-hidden={a !== 0}
                onClick={() => { if (a !== 0) go(i); }}
                style={{
                  transform: `translate3d(-50%,-50%,0) translateX(${x}%) rotateY(${-sg * (a === 0 ? 0 : 18)}deg) scale(${a === 0 ? 1 : a === 1 ? 0.84 : 0.7})`,
                  opacity: a === 0 ? 1 : a === 1 ? 0.6 : 0,
                  filter: a === 0 ? 'none' : `blur(${a * 2}px)`,
                  zIndex: 10 - a * 3,
                  pointerEvents: a > 1 ? 'none' : 'auto',
                  cursor: a === 0 ? 'default' : 'pointer',
                  boxShadow: a === 0 ? '0 50px 90px -30px rgba(10,14,30,.6)' : '0 20px 40px -24px rgba(10,14,30,.4)',
                }}
              >
                <PostTile
                  p={p}
                  alt={p.photoAlt}
                  size="lg"
                  photoPos="center 30%"
                  cta={<Link href={ABROAD_HREF} className="pt__cta" tabIndex={a === 0 ? 0 : -1}>View story<span aria-hidden="true">→</span></Link>}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel-foot">
        <div className="subhead">
          <h3 data-lines="1" className="subhead__h3">
            <span className="ln"><span data-ln="1">Hear from the <span style={{ color: 'var(--red-deep)' }}>upGrad</span> learner</span></span>
          </h3>
          <p data-rv="1" className="subhead__p">Real voices, real struggles, and triumphs. Hear the unscripted stories of learners who forged lifelong friendships through late-night study sessions.</p>
        </div>
        <div data-drag="1" data-cur="Play" className="vrail">
          {ABROAD_VIDEOS.map(v => (
            <div key={v.src} data-ir="22" className="vcard">
              <img src={v.src} alt={v.alt} draggable={false} />
              <div className="vcard__shade" />
              <span className="vcard__play" aria-hidden="true">
                <svg viewBox="0 0 12 12" width="14" height="14" fill="#FFFFFF"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5Z" /></svg>
              </span>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
