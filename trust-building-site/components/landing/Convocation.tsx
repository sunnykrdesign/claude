import Link from 'next/link';
import { PostTile } from '@/components/PostCard';
import { CONVOCATIONS, convocationHref } from '@/lib/convocations';
import { CONV_STRIP } from '@/lib/landing';

export function Convocation() {
  return (
    <section id="p5-conv" className="conv" aria-labelledby="conv-h">
      <div className="conv__stage">
        <div className="conv__inner">
          <div className="shead">
            <div data-lines="1" className="shead__titles">
              <span className="eyebrow eyebrow--lg">01</span>
              <h2 id="conv-h" className="shead__h2"><span className="ln ln--loose"><span data-ln="1">Convocation</span></span></h2>
              <p className="shead__sub"><span className="ln ln--loose"><span data-ln="1">Months on screen. <span className="soft">One day on stage.</span></span></span></p>
            </div>
            <p data-rv="1" className="shead__p">Trade your virtual classroom for the campus grounds as you finally meet the peers you’ve studied alongside for months.</p>
            <span data-rv="1" className="conv__all"><Link href="/convocation/" className="viewall">View all →</Link></span>
          </div>

          <div id="cv-scroll" data-drag="1" className="conv__scroll">
            <div id="cv-track" className="conv__track">
              {CONV_STRIP.map((item, i) => {
                if (item.kind === 'quote') return <QuoteCard key="quote" />;
                const c = CONVOCATIONS.find(x => x.slug === item.slug)!;
                if (item.post) {
                  return (
                    <Link key={i} href={convocationHref(c.slug)} className="tile" draggable={false} aria-label={`LinkedIn post by ${item.post.name}`}>
                      <PostTile p={item.post} alt={item.post.alt} size="sm" />
                      <span className="tile__cap"><span>{item.post.name}, on LinkedIn</span><span>2026</span></span>
                    </Link>
                  );
                }
                return (
                  <Link key={i} href={convocationHref(c.slug)} className="cvcard" data-cvcard="1" draggable={false} aria-label={`View story: ${item.label}`}>
                    <div className="cvcard__media" style={{ aspectRatio: c.ar }}>
                      <div className="cvcard__zoom">
                        <img data-cvimg="1" src={c.img} alt={c.alt} draggable={false} style={{ objectFit: 'cover' }} />
                      </div>
                      <span className="cvcard__btn" aria-hidden="true">View story<span className="cvcard__btnarr">→</span></span>
                    </div>
                    <span className="cvcard__cap"><span>{item.label}</span><span>2026</span></span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="conv__meter" aria-hidden="true">
            <span>Convocation 2026</span>
            <div><div id="cv-bar" className="conv__bar" /></div>
            <span>Drag to explore</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteCard() {
  return (
    <figure className="cvquote">
      <blockquote>
        <span className="cvquote__mark" aria-hidden="true">“</span>
        <p>I didn’t tell anyone in my family I had enrolled. This post is how they found out I graduated.</p>
        <footer><b>Ramesh Iyer</b><span>Senior Manager, Tata Steel</span></footer>
      </blockquote>
      <figcaption><a href="#" className="textlink">Course details ↗</a></figcaption>
    </figure>
  );
}
