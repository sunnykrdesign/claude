// Mirrors each "From the Ground Up" Luma event page. Luma doesn't expose event
// dates, so none are shown; add a `date` field here once they're available.

export type Fact = { k: string; v: string };
export type Row = { d: string; t: string };

export type Immersion = {
  slug: string;
  city: string;
  place: string;
  title: string;
  img: string;
  alt: string;
  desc: string;
  facts: Fact[];
  brew: Row[];
  about: string[];
  info: Row[];
  url: string;
};

const lumaCover = (path: string) =>
  'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=800,height=420/event-social/' +
  path +
  '.png';

const brew: Row[] = [
  { d: '01', t: 'Discover how coffee travels from estates to your cup' },
  { d: '02', t: 'Watch the founder brew live, right at the counter' },
  { d: '03', t: 'Taste the same coffee brewed in different ways' },
  { d: '04', t: 'Meet interesting people and have a few good conversations' },
];

const facts: Fact[] = [
  { k: 'Duration', v: '2 hours' },
  { k: 'Where', v: 'A café counter' },
  { k: 'Spots', v: '20 only' },
];

const about = [
  'Ever wondered what happens between a coffee plant on an estate and the cup in your hand?',
  'Spend two hours at a café counter and get the full story, led by the founder of a specialty coffee spot who built the place from scratch.',
  'Come grab a cuppa, stay for the conversations, and leave knowing your coffee a little better.',
];

const surprise = 'The café and its name are a little surprise. You’ll find out once you’re in.';

const info = (city: string): Row[] => [
  { d: 'Registration', t: 'Approval required. Your registration is subject to host approval.' },
  { d: 'Location', t: city + ', India. The exact address is shared once you register.' },
  { d: 'Hosted by', t: 'Vedanshi and Saral Purohit' },
  { d: 'Presented by', t: 'upGrad' },
];

const events: [slug: string, city: string, lumaId: string, cover: string, hasSurprise: boolean][] = [
  ['chennai', 'Chennai', '2l8ql0s9', 'bl/99ff4190-9cb8-404a-9689-4e8f2cd89ce4', true],
  ['chandigarh', 'Chandigarh', '9pj9ynh8', '0u/c2703532-188f-4027-a271-4f11d5568f3d', true],
  ['ahmedabad', 'Ahmedabad', 'utusqyd1', '8g/8c145e69-aa81-43b0-9b92-4559527c0002', false],
];

export const IMMERSIONS: Immersion[] = events.map(([slug, city, id, cover, hasSurprise]) => ({
  slug,
  city,
  place: city + ', India · Food & Drink',
  title: 'From the Ground Up | ' + city,
  img: lumaCover(cover),
  alt: 'From the Ground Up ' + city + ' event cover',
  desc: 'Coffee, but make it an experience. Two hours at a café counter with the founder of a specialty coffee spot. 20 spots only.',
  facts,
  brew,
  about: hasSurprise ? [about[0], about[1], surprise, about[2]] : about,
  info: info(city),
  url: 'https://luma.com/' + id,
}));

export const immersionHref = (slug: string) => `/immersion/${slug}/`;
