import type { Immersion } from '@/lib/immersions';

/**
 * Compact version of the event card on the immersion detail page, used as a
 * thumbnail inside a link. It's decorative, so the poster carries no alt text
 * and the pill is a label rather than its own link.
 */
export function EventCardThumb({ u, className = '' }: { u: Immersion; className?: string }) {
  return (
    <div className={`ecard ecard--sm ${className}`}>
      <div className="ecard__copy">
        <span className="ecard__brand" aria-hidden="true">luma<span>✦</span></span>
        <span className="ecard__title">{u.title}</span>
        <span className="ecard__rsvp" aria-hidden="true">View event</span>
      </div>
      <div className="ecard__poster"><img src="/assets/ftgu-poster.webp" alt="" /></div>
    </div>
  );
}
