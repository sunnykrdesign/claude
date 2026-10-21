import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AbroadStories } from '@/components/pages/AbroadStories';

export const metadata: Metadata = { title: 'Study abroad stories · upGrad' };

export default function StudyAbroadStories() {
  return (
    <div className="ix detail">
      <SiteHeader back="/#p5-abroad" label="Back" tone="light" />
      <main className="ix__body">
        <div className="ix__head">
          <div>
            <span data-rv="1" className="eyebrow">Study abroad · All stories</span>
            <h1 className="d-h1">
              <span className="ln"><span data-ln="1">Study abroad</span></span>
              <span className="ln"><span data-ln="1" className="soft">When the classroom got a passport.</span></span>
            </h1>
          </div>
          <p data-rv="1" className="shead__p">Some learners took their programme further than their desk. These are the videos they recorded and the posts they wrote from the other side.</p>
        </div>
        <AbroadStories />
      </main>
    </div>
  );
}
