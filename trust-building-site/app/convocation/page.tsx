import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { ConvocationStories } from '@/components/pages/ConvocationStories';

export const metadata: Metadata = { title: 'Convocation stories · upGrad' };

export default function ConvocationStoriesPage() {
  return (
    <div className="ix detail">
      <SiteHeader back="/#p5-conv" label="Back" tone="light" />
      <main className="ix__body">
        <div className="ix__head">
          <div>
            <span data-rv="1" className="eyebrow">Convocation · All stories</span>
            <h1 className="d-h1">
              <span className="ln"><span data-ln="1">Months on screen.</span></span>
              <span className="ln"><span data-ln="1" className="soft">One day on stage.</span></span>
            </h1>
          </div>
          <p data-rv="1" className="shead__p">Trade your virtual classroom for the campus grounds as you finally meet the peers you’ve studied alongside for months.</p>
        </div>
        <ConvocationStories />
      </main>
    </div>
  );
}
