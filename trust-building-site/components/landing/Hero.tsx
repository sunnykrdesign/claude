import { LiActions, LiHead } from '@/components/LiParts';
import { HERO_POSTS, MANIFESTO, POST_COUNT, type HeroPost } from '@/lib/landing';

export function Hero({ onRead }: { onRead: (e: React.MouseEvent) => void }) {
  return (
    <section id="p5-hero" className="hero" aria-label="Introduction">
      <div id="hero-glow" className="hero__glow" aria-hidden="true" />
      <div className="hero__floor" aria-hidden="true" />

      <div id="hero-copy" className="hero__copy">
        <div data-hf="1" className="eyebrow eyebrow--wide eyebrow--pulse hero__eyebrow">Unedited · Unprompted · Unpaid</div>
        <h1 data-lines="hero" className="hero__h1">
          <span className="ln"><span data-ln="1">Don’t take our word for it.</span></span>
          <span className="ln"><span data-ln="1" className="accent">Take theirs.</span></span>
        </h1>
        <p data-hf="1" className="hero__lede">Real posts from upGrad learners, on their own profiles, in their own words.</p>
      </div>

      <div
        id="hero-stage"
        className="hero__stage"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Posts written by upGrad learners. Use the left and right arrow keys to browse."
      >
        <div id="hero-swipe" className="hero__swipe" />
        <div id="hero-rig" className="hero__rig">
          <div id="hero-halo" className="hero__halo" aria-hidden="true" />
          {HERO_POSTS.map((p, i) => (
            <div key={p.name} data-slot={i} className="hero__slot">
              <PostCard p={p} />
              <div data-veil="1" className="hero__veil" />
            </div>
          ))}
        </div>
      </div>

      <div data-hf="1" className="hero__foot">
        <div className="hero__count">
          <span id="hero-count" className="hero__num" data-total={POST_COUNT}>{POST_COUNT.toLocaleString('en-IN')}</span>
          <span className="hero__numlabel">Posts, all still live</span>
        </div>
        <span aria-hidden="true" />
        <a href="#p5-man" className="pill hero__cta" onClick={onRead}>Read their posts<span className="arr arr--y">↓</span></a>
      </div>
    </section>
  );
}

function PostCard({ p }: { p: HeroPost }) {
  return (
    <article data-card="1" className="lpost">
      <header className="lpost__head not-v3">
        <span className="lpost__av" style={{ background: p.avBg }}>
          <span>{p.ini}</span>
          <img src={p.av} alt="" draggable={false} />
        </span>
        <span className="lpost__who">
          <span className="lpost__name">{p.name}</span>
          <span className="lpost__role">{p.role}</span>
        </span>
        <span className="lpost__date">{p.date}</span>
      </header>
      <LiHead p={p} avatar={p.av} className="v3-only" />
      <div className="lpost__body">
        <p>{p.t1}</p>
        <p>{p.t2}</p>
      </div>
      {p.badge && (
        <div className="lpost__badge">
          <div className="lpost__shield">PMP</div>
          <small>Project Management Professional</small>
        </div>
      )}
      {p.photo && <img className="lpost__photo" src={p.photo} alt={p.photoAlt} draggable={false} />}
      <div className="lpost__stats not-v3">
        <span className="lpost__likes">
          <span className="reacts" aria-hidden="true">
            <span style={{ zIndex: 3, background: '#378fe9' }}>👍</span>
            <span style={{ zIndex: 2, background: '#df704d' }}>❤️</span>
            <span style={{ zIndex: 1, background: '#f5bb5c' }}>💡</span>
          </span>
          <b>{p.likes}</b>
        </span>
        <span>{p.stats}</span>
      </div>
      <LiActions p={{ likes: p.likes, comments: p.stats }} className="v3-only" />
      <footer className="lpost__foot">Read on LinkedIn <span aria-hidden="true">↗</span></footer>
    </article>
  );
}

export function Manifesto() {
  return (
    <section id="p5-man" className="man" aria-label="Why this page exists">
      <div className="man__inner">
        <span className="eyebrow eyebrow--dark">Why this page exists</span>
        <p id="man-words" className="man__text">
          {MANIFESTO.map(({ w, em }, i) => (
            <span key={i}>
              {em ? <em data-w="1">{w}</em> : <span data-w="1">{w}</span>}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
