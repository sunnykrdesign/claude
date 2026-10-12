import Link from 'next/link';
import { PostTile } from '@/components/PostCard';
import { IMMERSIONS, immersionHref } from '@/lib/immersions';
import { IMM_CARDS, IMM_STEPS } from '@/lib/landing';

const cityName = (slug: string) => IMMERSIONS.find(u => u.slug === slug)?.city ?? slug;

export function Immersion({ goStep }: { goStep: (i: number) => void }) {
  const n = IMM_STEPS.length;
  return (
    <section id="p5-imm" className="imm" aria-labelledby="imm-h">
      <div id="im-stage" className="imm__stage" data-n={n}>
        <div className="imm__sticky">
          <img id="im-bg" className="imm__bg" src="/assets/cafe.png" alt="" />
          <div className="imm__shade" />
          <Link href="/immersion/" className="viewall viewall--dark imm__all">View all →</Link>
          <div className="imm__grid">
            <div className="imm__left">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div data-lines="1" className="shead__titles">
                  <span className="eyebrow eyebrow--lg">03</span>
                  <h2 id="imm-h" className="shead__h2"><span className="ln ln--loose"><span data-ln="1">Immersion</span></span></h2>
                  <p className="shead__sub"><span className="ln ln--loose"><span data-ln="1">When the course <span className="soft">stepped off the screen.</span></span></span></p>
                </div>
                <ol className="imm__steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {IMM_STEPS.map((s, i) => (
                    <li key={s.label} id={'im-s' + i} className={'imm-step' + (i === 0 ? ' is-active' : '')}>
                      <span data-fill="1" className="imm-step__fill" style={{ transform: `scaleX(${i === 0 ? 1 : 0})` }} />
                      <button type="button" className="imm-step__go" onClick={() => goStep(i)}>
                        <span>{'0' + (i + 1)}</span><span>{s.label}</span>
                      </button>
                      <Link
                        href={immersionHref(s.city)}
                        className="imm-step__pill"
                        aria-label={`View the ${cityName(s.city)} event`}
                        title="View event details"
                      >
                        <span className="imm-step__pilltxt" aria-hidden="true">View event</span><span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="imm__counter">
                <div className="imm__num" aria-hidden="true">
                  <span className="imm__numwin">
                    <span id="im-roll" className="imm__roll">{IMM_STEPS.map((_, i) => <span key={i}>{'0' + (i + 1)}</span>)}</span>
                  </span>
                  <span className="imm__total">/ {'0' + n}</span>
                </div>
                <div className="imm__texts">
                  {IMM_STEPS.map((s, i) => (
                    <div key={s.label} id={'im-t' + i} className="imm__text" style={{ opacity: i === 0 ? 1 : 0 }}>
                      <span>{s.tag}</span>
                      <p>{s.line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div id="im-media" className="imm__media" data-cur="View">
              {IMM_STEPS.map((s, i) => (
                <div key={s.label} id={'im-c' + i} className="imm__card" style={{ zIndex: i + 1, transform: i === 0 ? 'none' : 'translate3d(0,110%,0)' }}>
                  <img id={'im-i' + i} src={s.src} alt={s.alt} draggable={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="subhead">
        <h3 data-lines="1" className="subhead__h3">
          <span className="ln"><span data-ln="1">One week on campus,</span></span>
          <span className="ln"><span data-ln="1" className="accent">frame by frame.</span></span>
        </h3>
        <p data-rv="1" className="subhead__p">Faculty, mentors and founders in the same room as the learners they teach.</p>
      </div>
      <div data-drag="1" data-cur="Drag" className="irail">
        {IMM_CARDS.map(c => (
          <Link key={c.name} href={immersionHref(c.city)} draggable={false} className="tile tile--dark" aria-label={`LinkedIn post by ${c.name}`}>
            <PostTile p={c} alt={c.alt} size="sm" />
            <span className="tile__cap"><span>{c.name}, on LinkedIn</span><span>{c.place}</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
