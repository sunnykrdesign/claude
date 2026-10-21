'use client';

import { DetailReveal } from '@/components/DetailReveal';
import { FilterBar, facetAttrs, matches, useFilters, type Facet, type Facets } from '@/components/Filters';
import { FeedPost } from '@/components/PostCard';
import { ABROAD_PROGRAMMES, ABROAD_STORY_POSTS, ABROAD_VIDEOS } from '@/lib/posts';

type Item = { kind: 'post' | 'video'; i: number; facets: Facets };

const posts: Item[] = ABROAD_STORY_POSTS.map((p, i) => ({ kind: 'post', i, facets: { kind: 'post', programme: p.programme } }));
const videos: Item[] = ABROAD_VIDEOS.map((v, i) => ({ kind: 'video', i, facets: { kind: 'video', programme: v.programme } }));
// A post, then a video, and so on.
const ITEMS: Item[] = Array.from({ length: Math.max(posts.length, videos.length) }, (_, i) => [posts[i], videos[i]]).flat().filter(Boolean);

const FACETS: Facet[] = [
  { key: 'kind', label: 'Show', all: 'All', options: [{ value: 'video', label: 'Videos' }, { value: 'post', label: 'LinkedIn posts' }] },
  { key: 'programme', label: 'Programme', all: 'All programmes', options: ABROAD_PROGRAMMES.map(p => ({ value: p, label: p })) },
];

export function AbroadStories() {
  const { picked, pick } = useFilters();
  return (
    <>
      <DetailReveal scanKey={JSON.stringify(picked)} />
      <FilterBar facets={FACETS} items={ITEMS.map(it => it.facets)} picked={picked} onPick={pick} />
      <div className="masonry" data-facet-list="" style={{ columns: '4 260px', columnGap: 20 }} aria-live="polite">
        {ITEMS.filter(it => matches(it.facets, picked)).map(it => {
          if (it.kind === 'post') {
            const p = ABROAD_STORY_POSTS[it.i];
            return <div key={'p' + it.i} {...facetAttrs(it.facets)}><FeedPost p={p} variant="card" reveal photoPos="center 30%" /></div>;
          }
          const v = ABROAD_VIDEOS[it.i];
          return (
            <div key={'v' + it.i} data-rv="1" className="vtile" {...facetAttrs(it.facets)}>
              <div className="vtile__media">
                <img src={v.src} alt={v.alt} loading="lazy" />
                <span className="vtile__tag">Video</span>
                <span className="vtile__play" aria-hidden="true">▶</span>
              </div>
              <span className="vtile__desc">{v.desc}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
