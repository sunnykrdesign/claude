import { LiCard } from '@/components/LiCard';
import { avatarSrc, initials, type Post } from '@/lib/posts';

function Avatar({ p, alt = '' }: { p: Post; alt?: string }) {
  const src = avatarSrc(p.av);
  return (
    <span className="avatar">
      {initials(p.name)}
      {src && <img src={src} alt={alt} draggable={false} />}
    </span>
  );
}

function Reactions({ p }: { p: Post }) {
  return (
    <span className="pc__likes">
      <span className="dots3" aria-hidden="true"><i style={{ background: '#378FE9' }} /><i style={{ background: '#DF704D' }} /><i style={{ background: '#6DAE4F' }} /></span>
      {p.likes}
    </span>
  );
}

type FeedProps = {
  p: Post;
  /**
   * `marquee`: clamped text, "see more" and the action row (landing marquee).
   * `feed`: full text and the action row (all-posts page).
   * `card`: full text, smaller header, no actions (detail and stories pages).
   */
  variant: 'marquee' | 'feed' | 'card';
  hidden?: boolean;
  reveal?: boolean;
  photoPos?: string;
};

/** A LinkedIn post laid out like the feed. */
export function FeedPost({ p, variant, hidden, reveal, photoPos }: FeedProps) {
  const actions = variant !== 'card';
  const card = (
    <article className={`pc pc--${variant} pre-v4`} aria-hidden={hidden || undefined}>
      <header className="pc__head">
        <Avatar p={p} alt={hidden ? '' : p.name} />
        <span className="pc__who">
          <span className="pc__name">{p.name}</span>
          <span className="pc__role">{p.role}</span>
          <span className="pc__date">{p.date}{actions && ' · Edited'}</span>
        </span>
        <span className="li-badge" aria-label="LinkedIn">in</span>
      </header>
      <p className="pc__text">{p.text}</p>
      {variant === 'marquee' && <span className="pc__more" aria-hidden="true">…see more</span>}
      {p.photo && (
        <div className="pc__photo">
          <img src={p.photo} alt={`Photo shared by ${p.name}`} loading="lazy" style={photoPos ? { objectPosition: photoPos } : undefined} />
        </div>
      )}
      <div className="pc__stats"><Reactions p={p} /><span>{p.comments}</span></div>
      {actions && (
        <div className="pc__actions" aria-hidden="true"><span>Like</span><span>Comment</span><span>Repost</span><span>Send</span></div>
      )}
    </article>
  );
  const both = <>{card}<LiCard p={p} hidden={hidden} photoPos={photoPos} className={`v4-only li--${variant}`} /></>;
  // The reveal sits on a wrapper so its settled `transform: none` can't override the hover lift.
  return reveal ? <div data-rv="1">{both}</div> : both;
}

type TileProps = {
  p: Post;
  alt: string;
  /** `sm`: rail tile (convocation strip, immersion rail). `lg`: study abroad carousel. */
  size: 'sm' | 'lg';
  /** V1 only: the pill in the photo corner, a link of its own or decorative when the whole tile is a link. */
  cta?: React.ReactNode;
  photoPos?: string;
};

/** A compact LinkedIn post with a photo filling the lower half. */
export function PostTile({ p, alt, size, cta, photoPos }: TileProps) {
  return (
    <>
    <LiCard p={p} alt={alt} photoPos={photoPos} className={`v4-only li--tile li--${size}`} />
    <article className={`pt pt--${size} pre-v4`}>
      <header className="pt__head">
        <Avatar p={p} />
        <span className="pt__who">
          <span className="pt__name">{p.name}</span>
          <span className="pt__role">{p.role} · {p.date}</span>
        </span>
        <span className="li-badge" aria-label="LinkedIn">in</span>
      </header>
      <p className="pt__text">{p.text}</p>
      <div className="pt__photo">
        {p.photo && <img src={p.photo} alt={alt} draggable={false} style={photoPos ? { objectPosition: photoPos } : undefined} />}
        {cta ?? <span className="pt__cta v1-only" aria-hidden="true">View story<span>→</span></span>}
      </div>
      <div className="pt__stats"><Reactions p={p} /><span>{p.comments}</span></div>
    </article>
    </>
  );
}
