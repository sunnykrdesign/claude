'use client';

import Link from 'next/link';
import { DetailReveal } from '@/components/DetailReveal';
import { FilterBar, facetAttrs, matches, useFilters, type Facet, type Facets } from '@/components/Filters';
import { FeedPost } from '@/components/PostCard';
import { CONVOCATIONS, CONVOCATION_CAMPUSES, CONVOCATION_PROGRAMMES, convPos, convocationHref } from '@/lib/convocations';
import { CONV_STRIP } from '@/lib/landing';

/** The LinkedIn posts from the landing page's convocation strip, each linking to its story. */
const POSTS = CONV_STRIP.flatMap(item => (item.kind === 'photo' && item.post ? [{ slug: item.slug, post: item.post }] : []));

const FACETS: Facet[] = [
  { key: 'campus', label: 'Campus', all: 'All campuses', options: CONVOCATION_CAMPUSES.map(c => ({ value: c, label: c })) },
  { key: 'programme', label: 'Programme', all: 'All programmes', options: CONVOCATION_PROGRAMMES.map(p => ({ value: p, label: p })) },
];
const FACETS_BY_SLUG = new Map<string, Facets>(CONVOCATIONS.map(c => [c.slug, { campus: c.campus, programme: c.programme }]));
const facetsOf = (slug: string) => FACETS_BY_SLUG.get(slug) ?? {};

/** The stories, filterable by campus and programme: photo cards in V1, the LinkedIn posts from V2 on. */
export function ConvocationStories() {
  const { picked, pick } = useFilters();
  const shown = (slug: string) => matches(facetsOf(slug), picked);
  return (
    <>
      <DetailReveal scanKey={JSON.stringify(picked)} />
      <FilterBar facets={FACETS} items={CONVOCATIONS.map(c => facetsOf(c.slug))} picked={picked} onPick={pick} />
      {/* V1: photo cards. */}
      <div className="ix__grid v1-only" data-facet-list="">
        {CONVOCATIONS.map((c, k) => shown(c.slug) && (
          <Link key={c.slug} data-rv="1" href={convocationHref(c.slug)} className="icard" {...facetAttrs(facetsOf(c.slug))}>
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
      <div className="masonry v2-only" data-facet-list="" style={{ columns: '3 300px', columnGap: 20 }}>
        {POSTS.map(({ slug, post }) => shown(slug) && (
          <Link key={slug} href={convocationHref(slug)} className="postlink" aria-label={`LinkedIn post by ${post.name}`} {...facetAttrs(facetsOf(slug))}>
            <FeedPost p={post} variant="card" reveal photoPos="center 30%" />
          </Link>
        ))}
      </div>
    </>
  );
}
