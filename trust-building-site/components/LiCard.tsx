import { moreFor } from '@/lib/postMore';
import { avatarSrc, initials, type Post } from '@/lib/posts';

// Icons cut at 2× from the "Wall of Voices" Figma design (nodes 1377:3460, 1386:3603).
const ICON = '/assets/li/';
// The first number in a count like "2,603", "171 comments" or "34 comments · 12 shares".
const count = (s: string) => s.match(/\d[\d,]*/)?.[0] ?? '';

// Photo heights vary from card to card, picked from the post itself so each post
// always gets the same height (and server and browser render agree).
const PHOTO_HEIGHTS = [160, 214, 186, 240, 172, 198, 228];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// In the fixed-height (507px) cards, the text gets whatever the photo leaves:
// 507 − 2 border − 75 header − 12 text padding and margin − 6 photo gap − 44 actions − 6 bottom = 362px, minus the photo.
const TEXT_SPACE = 362;
const LINE = 22;

/**
 * LinkedIn post card from the "Wall of Voices" design (V4). Header with avatar,
 * name, Premium badge and degree, headline and date; the post text; the photo;
 * and the action row with likes, comments and reactions.
 */
export function LiCard({ p, alt, photoPos, hidden, fixed, className = '' }: { p: Post; alt?: string; photoPos?: string; hidden?: boolean; fixed?: boolean; className?: string }) {
  const more = moreFor(p.text);
  const target = p.photo ? PHOTO_HEIGHTS[hash(p.name + p.text) % PHOTO_HEIGHTS.length] : 0;
  // Fixed cards: fit whole lines of text, then give the leftover (< one line) to the photo,
  // so every card has the same spacing around the photo. Without a photo the 6px gap is text space too.
  const lines = fixed ? Math.floor((TEXT_SPACE - (p.photo ? target : -6)) / LINE) : 7;
  const photoH = fixed && p.photo ? TEXT_SPACE - lines * LINE : target;
  return (
    <article className={`li ${className}`} aria-hidden={hidden || undefined}>
      <LiHead p={p} avatar={avatarSrc(p.av)} />
      <p className="li__text" style={{ WebkitLineClamp: lines, maxHeight: lines * LINE + 4 }}>{more ? `${p.text}\n\n${more}` : p.text}</p>
      {p.photo && (
        <div className="li__photo" style={{ height: photoH }}>
          <img src={p.photo} alt={alt ?? `Photo shared by ${p.name}`} draggable={false} style={photoPos ? { objectPosition: photoPos } : undefined} />
        </div>
      )}
      <LiActions p={p} />
    </article>
  );
}

/** The post header: avatar, name with the Premium badge and degree, headline and date, LinkedIn logo. */
export function LiHead({ p, avatar, className = '' }: { p: Pick<Post, 'name' | 'role' | 'date'>; avatar: string | null; className?: string }) {
  // Only some posters have Premium (about one card per rail), picked from the name so a person looks the same everywhere.
  const premium = hash(p.name) % 5 === 0;
  return (
    <header className={`li__head ${className}`}>
      <span className="li__avatar">{avatar ? <img src={avatar} alt="" draggable={false} /> : initials(p.name)}</span>
      <span className="li__who">
        <span className="li__nameRow">
          <span className="li__name">{p.name}</span>
          {premium && <img className="li__premium" src={ICON + 'premium.png'} alt="" width={16} height={16} />}
          <span className="li__degree">{' • 2nd'}</span>
        </span>
        <span className="li__headline">{p.role}</span>
        <span className="li__date">{p.date}</span>
      </span>
      <span className="li__logo"><img src={ICON + 'linkedin-logo.png'} alt="LinkedIn" /></span>
    </header>
  );
}

/** The footer row: likes, comments and the reaction icons. */
export function LiActions({ p, className = '' }: { p: Pick<Post, 'likes' | 'comments'>; className?: string }) {
  return (
    <div className={`li__actions ${className}`}>
      <span className="li__act"><img src={ICON + 'like.png'} alt="" width={20} height={20} /><span>{count(p.likes)}</span></span>
      <span className="li__act"><img src={ICON + 'comment.png'} alt="" width={20} height={20} /><span>{count(p.comments)}</span></span>
      <span className="li__spacer" />
      <img className="li__reacts" src={ICON + 'reactions.png'} alt="" width={40} height={23} />
    </div>
  );
}
