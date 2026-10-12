// ⚠ The `desc`, `facts` and `about` copy below is placeholder from the design
// handoff and still needs real content.

export type Convocation = {
  slug: string;
  img: string;
  alt: string;
  /** Short label used on the landing strip and in the "more" grid. */
  label: string;
  place: string;
  title: string;
  desc: string;
  facts: [string, string][];
  about: string[];
  /** Intrinsic aspect ratio of the image, `w/h`. */
  ar: string;
};

export const CONVOCATIONS: Convocation[] = [
  {
    slug: 'iit-bombay-stage', img: '/assets/conv-l1.png', alt: 'Graduate at IIT Bombay convocation', ar: '670/436',
    label: 'IIT Bombay', place: 'IIT Bombay · 2026', title: 'Walking the stage at IIT Bombay',
    desc: 'Online learners who completed their programme travel to the IIT Bombay campus to receive their degree in person.',
    facts: [['Campus', 'IIT Bombay'], ['City', 'Mumbai'], ['Year', '2026']],
    about: [
      'Most of the programme happens on a laptop, late in the evening, after work. Convocation is the day it moves onto a real campus.',
      'Graduates are called up by name, receive their degree from the institute, and meet the faculty who taught them.',
    ],
  },
  {
    slug: 'annual-convocation', img: '/assets/conv-l3.png', alt: 'Graduate at the annual convocation', ar: '670/436',
    label: 'Annual convocation', place: 'Annual convocation · 2026', title: 'The annual convocation',
    desc: 'Once a year, the cohort that studied on screen gathers in one hall with their families.',
    facts: [['Held', 'Once a year'], ['Where', 'On campus'], ['Year', '2026']],
    about: [
      'Names are read out, degrees are handed over, and families see the result first-hand.',
      'For many learners it is the first time they meet their classmates in person.',
    ],
  },
  {
    slug: 'degree-in-hand', img: '/assets/conv-p2.png', alt: 'Graduate holding a degree folder', ar: '596/658',
    label: 'Degree in hand', place: 'Degree in hand · 2026', title: 'Degree in hand',
    desc: 'The folder is physical proof of months of evenings and weekends spent studying alongside work.',
    facts: [['Awarded by', 'Partner university'], ['Received', 'In person'], ['Year', '2026']],
    about: [
      'The degree is issued by the partner university, the same one on-campus students receive.',
      'It is handed over on stage at the ceremony.',
    ],
  },
  {
    slug: 'iiit-bangalore', img: '/assets/conv-l5.png', alt: 'Three graduates at IIIT Bangalore', ar: '670/436',
    label: 'IIIT Bangalore', place: 'IIIT Bangalore · 2026', title: 'Together at IIIT Bangalore',
    desc: 'Classmates who had only met in breakout rooms finally stand side by side on campus.',
    facts: [['Campus', 'IIIT Bangalore'], ['City', 'Bengaluru'], ['Year', '2026']],
    about: [
      'Study groups that formed online meet for the first time at convocation.',
      'The day ends with photos on the campus grounds.',
    ],
  },
  {
    slug: 'whole-cohort', img: '/assets/conv-l4.png', alt: 'Annual convocation group photograph', ar: '670/436',
    label: 'The whole cohort', place: 'The whole cohort · 2026', title: 'The whole cohort',
    desc: 'The group photograph: every graduate from the year in a single frame.',
    facts: [['Ceremony', 'Annual convocation'], ['Where', 'On campus'], ['Year', '2026']],
    about: [
      'The group photo is taken after the degrees are handed over.',
      'It is the one frame with the entire cohort in it.',
    ],
  },
  {
    slug: 'iit-bombay-2026', img: '/assets/conv-l2.png', alt: 'Graduate at IIT Bombay convocation', ar: '670/436',
    label: 'IIT Bombay', place: 'IIT Bombay · 2026', title: 'IIT Bombay, class of 2026',
    desc: 'A graduate on the IIT Bombay campus after the ceremony.',
    facts: [['Campus', 'IIT Bombay'], ['City', 'Mumbai'], ['Year', '2026']],
    about: [
      'After the ceremony, graduates and families spend the afternoon on campus.',
      'For many, it is the first time they have walked its grounds.',
    ],
  },
];

export const convocationHref = (slug: string) => `/convocation/${slug}/`;

/** The portrait degree-in-hand photo crops best a little above centre. */
export const convPos = (c: Convocation) => (c.slug === 'degree-in-hand' ? 'center 30%' : 'center');
