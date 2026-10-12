'use client';

import { useState } from 'react';
import { DetailReveal } from '@/components/DetailReveal';
import { FeedPost } from '@/components/PostCard';
import { ABROAD_STORY_POSTS, ABROAD_VIDEOS } from '@/lib/posts';

type Filter = 'All' | 'Videos' | 'LinkedIn posts';
type Item = { kind: 'post'; i: number } | { kind: 'video'; i: number };

const posts: Item[] = ABROAD_STORY_POSTS.map((_, i) => ({ kind: 'post', i }));
const videos: Item[] = ABROAD_VIDEOS.map((_, i) => ({ kind: 'video', i }));
// "All" interleaves a post, then a video.
const mixed: Item[] = Array.from({ length: Math.max(posts.length, videos.length) }, (_, i) => [posts[i], videos[i]]).flat().filter(Boolean);
const LISTS: Record<Filter, Item[]> = { All: mixed, Videos: videos, 'LinkedIn posts': posts };

export function AbroadStories() {
  const [f, setF] = useState<Filter>('All');
  return (
    <>
      <DetailReveal scanKey={f} />
      <div className="filters" role="group" aria-label="Filter stories">
        {(Object.keys(LISTS) as Filter[]).map(label => (
          <button key={label} type="button" className="filter" aria-pressed={label === f} onClick={() => setF(label)}>
            {label}<small>{LISTS[label].length}</small>
          </button>
        ))}
      </div>
      <div className="masonry" style={{ columns: '4 260px', columnGap: 20 }} aria-live="polite">
        {LISTS[f].map(it => {
          if (it.kind === 'post') {
            const p = ABROAD_STORY_POSTS[it.i];
            return <FeedPost key={'p' + it.i} p={p} variant="card" reveal photoPos="center 30%" />;
          }
          const v = ABROAD_VIDEOS[it.i];
          return (
            <div key={'v' + it.i} data-rv="1" className="vtile">
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
