// Copy and data for the landing page. Entries flagged "sample" are placeholder
// content from the design handoff and should be replaced with real posts.

import type { Post } from './posts';

export const POST_COUNT = 6404;

export const NAV: [id: string, label: string][] = [
  ['p5-conv', 'Convocation'],
  ['p5-abroad', 'Study abroad'],
  ['p5-imm', 'Immersion'],
  ['p5-words', 'Voices'],
];

export type HeroPost = {
  name: string; role: string; date: string; ini: string; avBg: string; av: string;
  t1: string; t2: string; badge?: boolean; photo?: string; photoAlt?: string; likes: string; stats: string;
};

// Sample: David Chen, Nikita Menon, Apex Solutions and Aisha Okafor are not real learners.
export const HERO_POSTS: HeroPost[] = [
  { name: 'David Chen', role: 'Senior Project Manager @ TechCorp', date: '28 Jul 2025', ini: 'DC', avBg: '#2563eb', av: '/assets/showcase/avatars/david-chen.jpg', t1: 'Just completed my PMP certification! 6 months of hard work paid off. Grateful for the mentorship and support from @Sarah Jenkins and @TechCorp.', t2: 'Ready to tackle new project management challenges! #PMP #ProjectManagement', badge: true, likes: '218', stats: '34 comments · 12 shares' },
  { name: 'Nikita Menon', role: 'Engineering Lead · Building Data Platforms', date: '4 Aug 2025', ini: 'NM', avBg: '#7c3aed', av: '/assets/showcase/avatars/nikita-menon.jpg', t1: 'What a week at our annual engineering offsite! Three days of architecture deep-dives, hack sessions, and honest retrospectives.', t2: 'Proud of this team and everything we shipped this year. 🚀', photo: '/assets/showcase/media/team-offsite.jpg', photoAlt: 'Team offsite 2025', likes: '187', stats: '26 comments · 9 shares' },
  { name: 'Gunavardhan Dandi', role: 'Mendix Advanced Certified Developer', date: '12 Aug 2025', ini: 'GD', avBg: '#0e7490', av: '/assets/showcase/avatars/gunavardhan-dandi.jpg', t1: 'Thrilled to officially graduate with my Executive Post Graduate Diploma in Software Development from IIIT Bangalore.', t2: 'Balancing a full-time role with a rigorous architecture curriculum was hard, and worth every weekend it cost me.', photo: '/assets/showcase/media/graduation-ceremony.jpg', photoAlt: 'Graduation ceremony', likes: '342', stats: '41 comments · 18 shares' },
  { name: 'Apex Solutions Inc.', role: '12,481 followers', date: '18 Aug 2025', ini: 'AS', avBg: '#0f766e', av: '/assets/showcase/avatars/apex-solutions.svg', t1: 'Unlocking the potential of your data is closer than you think.', t2: "Join us for a free webinar on 'Advanced Data Analytics in Supply Chain Management'. Learn from industry experts and see real-world case studies. Register now! [Link]", photo: '/assets/showcase/media/data-analytics.jpg', photoAlt: 'Advanced Data Analytics', likes: '143', stats: '19 comments · 31 shares' },
  { name: 'Aisha Okafor', role: 'Full-Stack Developer · AI Enthusiast', date: '25 Aug 2025', ini: 'AO', avBg: '#be185d', av: '/assets/showcase/avatars/aisha-okafor.jpg', t1: 'We won! 🏆 Our team took first place at the Global AI Hackathon with an accessibility-first voice assistant.', t2: '48 hours, zero sleep, and one very proud team. Huge thanks to the organizers and my incredible teammates.', photo: '/assets/showcase/media/hackathon.jpg', photoAlt: 'Global AI Hackathon', likes: '296', stats: '52 comments · 24 shares' },
];

export const MANIFESTO: { w: string; em?: boolean }[] = [
  ...'6,404 learners wrote about their programme on LinkedIn.'.split(' ').map(w => ({ w })),
  ...'Nobody asked them to. Nobody paid them.'.split(' ').map(w => ({ w, em: true })),
  ...'We collected the posts, left every word as it was, and linked each one back to the original.'.split(' ').map(w => ({ w })),
];

/** A photo card in the convocation strip; with `post` it renders as a LinkedIn post instead. */
export type ConvStripItem =
  | { kind: 'quote' }
  | { kind: 'photo'; slug: string; label: string; post?: Post & { alt: string } };

const convPost = (photo: string, alt: string, p: Omit<Post, 'photo'>) => ({ ...p, photo: '/assets/' + photo, alt });

export const CONV_STRIP: ConvStripItem[] = [
  { kind: 'photo', slug: 'iit-bombay-2026', label: 'IIT Bombay', post: convPost('conv-l2.png', 'Graduate at IIT Bombay convocation', { name: 'Nisha Nair', role: 'Growth Manager, Zomato', av: 'a8', date: '15 Mar 2026', likes: '2,603', comments: '171 comments', text: 'My parents flew in for this. They watched me study on a laptop for two years. Today they watched me walk across the stage at IIT Bombay.' }) },
  { kind: 'photo', slug: 'iit-bombay-stage', label: 'IIT Bombay' },
  { kind: 'photo', slug: 'annual-convocation', label: 'Annual convocation', post: convPost('conv-l3.png', 'Graduate at the annual convocation', { name: 'Lakshmi Reddy', role: 'Data Engineer, PhonePe', av: 'a4', date: '14 Mar 2026', likes: '2,184', comments: '146 comments', text: 'Walked the stage today. Two years of weekend classes, assignments submitted at midnight after putting the kids to bed, and one very patient family.' }) },
  { kind: 'quote' },
  { kind: 'photo', slug: 'iiit-bangalore', label: 'IIIT Bangalore', post: convPost('conv-l5.png', 'Three graduates at IIIT Bangalore', { name: 'Harish Bhat', role: 'Data Engineer, PhonePe', av: 'a5', date: '21 Mar 2026', likes: '1,947', comments: '112 comments', text: 'Met my study group in person for the first time at IIIT Bangalore. Eighteen months of late-night calls, and they are exactly who I thought they would be.' }) },
  { kind: 'photo', slug: 'degree-in-hand', label: 'Degree in hand' },
  { kind: 'photo', slug: 'whole-cohort', label: 'The whole cohort', post: convPost('conv-l4.png', 'Annual convocation group photograph', { name: 'Rohan Menon', role: 'Marketing Lead, Nykaa', av: 'a6', date: '16 Mar 2026', likes: '1,362', comments: '88 comments', text: 'Class of 2026, in one frame. A year of breakout rooms and late-night group calls, and today we finally stood next to each other.' }) },
];

/** Study abroad carousel: one post per learner, each with a video still. */
export const ABROAD_POSTS: (Post & { photoAlt: string })[] = [
  { name: 'Harish Bhat', role: 'Data Engineer, PhonePe', av: 'a5', date: '12 Aug 2026', likes: '1,528', comments: '78 comments', photo: '/assets/sa-v0.png', photoAlt: 'Learner speaking by a window', text: "A thank-you I've been putting off. When I enrolled I was sceptical. I'd tried online courses before and finished none of them. The difference this time was the mentor calls. Having someone check in every fortnight, who actually read my submissions, changed everything. I finished. First time ever." },
  { name: 'Neha Joshi', role: 'HR Business Partner, Wipro', av: 'a3', date: '3 Aug 2026', likes: '964', comments: '41 comments', photo: '/assets/sa-v3.png', photoAlt: 'Learner seated in a studio', text: 'Just back from campus immersion week. Meeting 60 people from my cohort after a year of little squares on a screen. I did not expect it to matter this much. It did.' },
  { name: 'Sneha Gupta', role: 'Operations Manager, Delhivery', av: 'a1', date: '28 Jul 2026', likes: '1,102', comments: '56 comments', photo: '/assets/sa-v5.png', photoAlt: 'Learner in a blue blazer', text: "If you're a working professional scared of quitting your job for a master's: this format works. I kept my salary, my role, and still finished." },
  { name: 'Nisha Nair', role: 'Growth Manager, Zomato', av: 'a8', date: '19 Jul 2026', likes: '2,310', comments: '134 comments', photo: '/assets/sa-v1.png', photoAlt: 'Learner sharing their story', text: 'People keep asking if the programme is worth it, so, publicly: yes, if you do the work. No, if you want a certificate to happen to you.' },
  { name: 'Lakshmi Reddy', role: 'Data Engineer, PhonePe', av: 'a4', date: '8 Jul 2026', likes: '1,847', comments: '92 comments', photo: '/assets/sa-v6.png', photoAlt: 'Learner sharing advice', text: 'Walked the stage today. Two years of weekend classes, assignments submitted at midnight after putting the kids to bed, and one very patient family.' },
];

/** The three sticky immersion steps. Step → city: Chennai, Chandigarh, Ahmedabad. */
export const IMM_STEPS = [
  { label: 'From the Ground Up', tag: 'Immersion · From the Ground Up', line: 'A week on campus turns classmates into a cohort you can shake hands with.', src: '/assets/im3-first.png', alt: "Saral Purohit's LinkedIn post, From the Ground Up", city: 'chennai' },
  { label: 'Mumbai & Hyderabad', tag: 'Mumbai · Hyderabad', line: 'Two cities, one format: a room full of people who had only met on screen.', src: '/assets/im3-cities.png', alt: 'Immersion meetups in Mumbai and Hyderabad', city: 'chandigarh' },
  { label: 'In their words', tag: 'Ankur Nagar, on LinkedIn', line: '“It was a superb event!”', src: '/assets/im3-voices.png', alt: "Ankur Nagar's LinkedIn post and WhatsApp messages from attendees of From the Ground Up, Mumbai", city: 'ahmedabad' },
];

/** The immersion rail: LinkedIn posts from the week on campus. */
export const IMM_CARDS: (Post & { alt: string; place: string; city: string })[] = [
  { name: 'Priya Raman', role: 'Product Analyst, Freshworks', av: 'a3', date: '9 Feb 2026', likes: '1,284', comments: '64 comments', text: 'Finally got to ask the questions I had been saving up all term. Two hours with faculty on campus was worth more than a month of forum threads.', photo: '/assets/im-2.png', alt: 'Speaker addressing learners at an immersion session', place: 'IIT Bombay', city: 'chennai' },
  { name: 'Karan Malhotra', role: 'Consultant, Deloitte', av: 'a1', date: '11 Feb 2026', likes: '962', comments: '41 comments', text: 'The mentor who marked every one of my assignments, answering my questions face to face. Strange and brilliant in equal measure.', photo: '/assets/im-3.png', alt: 'Mentor speaking with a microphone', place: 'IIT Bombay', city: 'chandigarh' },
  { name: 'Meera Pillai', role: 'Founder, Studio Kaapi', av: 'a7', date: '12 Feb 2026', likes: '2,031', comments: '118 comments', text: 'Did not expect the founders to show up and spend an hour listening to what our cohort is building. They took notes.', photo: '/assets/im-4.png', alt: 'upGrad founders together', place: 'IIT Bombay', city: 'ahmedabad' },
  { name: 'Vikram Desai', role: 'Engineering Manager, Razorpay', av: 'a2', date: '14 Feb 2026', likes: '1,756', comments: '93 comments', text: 'One week, one campus, and a group photo that finally has everyone in it. See you all at convocation.', photo: '/assets/im-5.png', alt: 'Immersion group photo', place: 'IIIT Bangalore', city: 'chennai' },
  { name: 'Ananya Nair', role: 'HR Business Partner, Wipro', av: null, date: '16 Feb 2026', likes: '874', comments: '37 comments', text: 'Met the team behind the programme today. You can tell they built it for people like us, juggling a job and a family.', photo: '/assets/im-1.png', alt: 'upGrad team at the office', place: 'IIT Bombay', city: 'chandigarh' },
];
