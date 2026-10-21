import { initials, type Post } from '@/lib/posts';

// The LinkedIn post header and footer from the "Wall of Voices" Figma design (nodes 1377:3460, 1386:3603),
// used on the V3 post cards and the hero posts. Icons cut at 2× from the design.
const ICON = '/assets/li/';
// The first number in a count like "2,603", "171 comments" or "34 comments · 12 shares".
const count = (s: string) => s.match(/\d[\d,]*/)?.[0] ?? '';

// Picks the posters who get the Premium badge (stable per name).
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

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
