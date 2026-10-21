import { avatarSrc, initials, type Post } from '@/lib/posts';

// Icons exported from the "Wall of Voices" Figma file (node 1377:3460).
const ICON = '/assets/li/';
const count = (s: string) => s.replace(/\D+$/, '').replace(/[^\d,]/g, '');

/** One vector layer of a reaction badge, placed by the inset Figma gives it (and an optional inner bleed). */
function Layer({ src, inset, bleed }: { src: string; inset: string; bleed?: string }) {
  return (
    <span className="li__layer" style={{ inset }}>
      {bleed ? <span className="li__layer" style={{ inset: bleed }}><img src={ICON + src} alt="" /></span> : <img src={ICON + src} alt="" />}
    </span>
  );
}

/** Like + love reaction badges, each built from the Figma vector layers. */
function Reactions() {
  return (
    <span className="li__reacts" aria-hidden="true">
      <span className="li__react">
        <Layer src="r-like-1.svg" inset="3.13% 3.13% 3.12% 3.13%" />
        <Layer src="r-ring.svg" inset="0 -0.04% 0 0.04%" />
        <Layer src="r-like-3.svg" inset="16.38% 20.16% 22.5% 20.23%" />
        <Layer src="r-like-4.svg" inset="23.25% 28.87% 25.62% 37.13%" />
        <Layer src="r-like-5.svg" inset="16.6% 20.29% 21.94% 20.14%" bleed="-5.08% -5.25%" />
      </span>
      <span className="li__react li__react--2">
        <Layer src="r-love-1.svg" inset="3.13% 3.13% 3.12% 3.12%" />
        <Layer src="r-ring.svg" inset="0 -0.04% 0 0.04%" />
        <Layer src="r-love-3.svg" inset="26.44% 20.12% 20.31% 20.6%" bleed="-5.87% -5.27% -8.3% -5.27%" />
        <Layer src="r-love-4.svg" inset="30.04% 23.52% 29.5% 23.52%" />
        <Layer src="r-love-5.svg" inset="26.38% 20.32% 20.62% 20.32%" bleed="-5.9% -5.26%" />
      </span>
    </span>
  );
}

/**
 * LinkedIn post card from the "Wall of Voices" design (V4). Header with avatar,
 * name, Premium badge and degree, headline and date; the post text; the photo;
 * and the action row with like, comment, repost, send and reactions.
 */
export function LiCard({ p, alt, photoPos, hidden, className = '' }: { p: Post; alt?: string; photoPos?: string; hidden?: boolean; className?: string }) {
  const av = avatarSrc(p.av);
  return (
    <article className={`li ${className}`} aria-hidden={hidden || undefined}>
      <header className="li__head">
        <span className="li__avatar">{av ? <img src={av} alt="" draggable={false} /> : initials(p.name)}</span>
        <span className="li__who">
          <span className="li__nameRow">
            <span className="li__name">{p.name}</span>
            <img className="li__premium" src={ICON + 'premium.svg'} alt="" width={16} height={16} />
            <span className="li__degree">{' • 2nd'}</span>
          </span>
          <span className="li__headline">{p.role}</span>
          <span className="li__date">{p.date}</span>
        </span>
        <span className="li__logo"><img src={ICON + 'linkedin-logo.png'} alt="LinkedIn" /></span>
      </header>
      <p className="li__text">{p.text}</p>
      {p.photo && (
        <div className="li__photo">
          <img src={p.photo} alt={alt ?? `Photo shared by ${p.name}`} draggable={false} style={photoPos ? { objectPosition: photoPos } : undefined} />
        </div>
      )}
      <div className="li__actions">
        <span className="li__act"><img src={ICON + 'like.svg'} alt="" width={20} height={20} /><span>{count(p.likes)}</span></span>
        <span className="li__act"><img src={ICON + 'comment.svg'} alt="" width={20} height={20} /><span>{count(p.comments)}</span></span>
        <span className="li__act"><img src={ICON + 'repost.svg'} alt="" width={20} height={20} /></span>
        <span className="li__act"><img src={ICON + 'send.svg'} alt="" width={20} height={20} /></span>
        <span className="li__spacer" />
        <Reactions />
      </div>
    </article>
  );
}
