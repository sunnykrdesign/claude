'use client';

import { useState } from 'react';
import { FeedPost } from '@/components/PostCard';
import { ALL_POSTS, POST_TAGS, type PostTag } from '@/lib/posts';

type Filter = 'All' | PostTag;

export function PostsFeed() {
  const [f, setF] = useState<Filter>('All');
  const posts = f === 'All' ? ALL_POSTS : ALL_POSTS.filter(p => p.tag === f);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter posts">
        {(['All', ...POST_TAGS] as Filter[]).map(label => (
          <button key={label} type="button" className="filter" aria-pressed={label === f} onClick={() => setF(label)}>{label}</button>
        ))}
      </div>
      <div className="masonry" style={{ columns: '3 320px', columnGap: 20 }} aria-live="polite">
        {posts.map(p => <FeedPost key={p.name + p.text.slice(0, 24)} p={p} variant="feed" />)}
      </div>
    </>
  );
}
