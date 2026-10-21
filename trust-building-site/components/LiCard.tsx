import { avatarSrc, initials, type Post } from '@/lib/posts';

// Icons cut at 2× from the "Wall of Voices" Figma design (nodes 1377:3460, 1386:3603).
const ICON = '/assets/li/';
const count = (s: string) => s.replace(/\D+$/, '').replace(/[^\d,]/g, '');

/**
 * LinkedIn post card from the "Wall of Voices" design (V4). Header with avatar,
 * name, Premium badge and degree, headline and date; the post text; the photo;
 * and the action row with likes, comments and reactions.
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
            <img className="li__premium" src={ICON + 'premium.png'} alt="" width={16} height={16} />
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
        <span className="li__act"><img src={ICON + 'like.png'} alt="" width={20} height={20} /><span>{count(p.likes)}</span></span>
        <span className="li__act"><img src={ICON + 'comment.png'} alt="" width={20} height={20} /><span>{count(p.comments)}</span></span>
        <span className="li__spacer" />
        <img className="li__reacts" src={ICON + 'reactions.png'} alt="" width={40} height={23} />
      </div>
    </article>
  );
}
