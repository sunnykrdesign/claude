import type { Metadata } from 'next';
import { DetailReveal } from '@/components/DetailReveal';
import { SiteHeader } from '@/components/SiteHeader';
import { PostsFeed } from '@/components/pages/PostsFeed';
import { POST_COUNT } from '@/lib/landing';

export const metadata: Metadata = { title: 'All posts · upGrad', description: 'Every LinkedIn post upGrad learners wrote about their programme, unedited.' };

export default function AllPosts() {
  return (
    <div className="ix detail">
      <DetailReveal />
      <SiteHeader back="/#p5-words" label="Back" tone="light" />
      <main className="ix__body">
        <div className="ix__head">
          <div>
            <span data-rv="1" className="eyebrow">In their own words · All posts</span>
            <h1 className="d-h1">
              <span className="ln"><span data-ln="1">{POST_COUNT.toLocaleString('en-IN')} learners wrote about us.</span></span>
              <span className="ln"><span data-ln="1" className="soft">We didn’t edit a word.</span></span>
            </h1>
          </div>
        </div>
        <PostsFeed />
      </main>
    </div>
  );
}
