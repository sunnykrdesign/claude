// LinkedIn posts shown across the site. Engagement counts, dates and most of the
// people here are sample content from the design handoff: replace them with the
// real posts (each should link to its live original) before launch.

export type Post = {
  name: string;
  role: string;
  /** Avatar id in /assets/avatars, or null to show initials. */
  av: string | null;
  date: string;
  likes: string;
  comments: string;
  text: string;
  /** Path of an attached photo, if the post has one. */
  photo?: string | null;
};

export const avatarSrc = (av: string | null) => (av ? `/assets/avatars/${av}.png` : null);
export const initials = (name: string) => name.split(' ').map(s => s[0]).join('');

type Row = [name: string, role: string, av: string | null, date: string, likes: string, comments: string, text: string, photo?: string | null];
const rows = (r: Row[]): Post[] =>
  r.map(([name, role, av, date, likes, comments, text, photo]) => ({ name, role, av, date, likes, comments, text, photo: photo ? '/assets/' + photo : null }));

// Feed-style metadata cycled across posts that don't carry their own.
const META_DATE = ['2d', '5d', '1w', '1w', '2w', '3w'];
const META_LIKES = ['1,284', '962', '2,031', '1,756', '874', '1,412'];
const META_COMMENTS = ['64 comments', '41 comments', '118 comments', '93 comments', '37 comments', '72 comments'];
const withMeta = (p: Omit<Post, 'date' | 'likes' | 'comments'>, k: number): Post => ({
  ...p, date: META_DATE[k % 6], likes: META_LIKES[k % 6], comments: META_COMMENTS[k % 6],
});

type Raw = [name: string, role: string, av: string | null, text: string, photo?: string];

const RAW: Raw[] = [
  ['Harish Bhat', 'Data Engineer, PhonePe', 'a5', "A thank-you I've been putting off. When I enrolled I was sceptical. I'd tried online courses before and finished none of them. The difference this time was the mentor calls."],
  ['Arjun Saxena', 'Operations Manager, Delhivery', null, 'Honest review after finishing: the projects are the point. Skip the videos if you must, never skip the projects.'],
  ['Aditya Iyer', 'Supply Chain Manager, Reliance Retail', 'a0', 'Received my degree at the convocation ceremony today. Quietly proud.'],
  ['Ananya Nair', 'HR Business Partner, Wipro', null, "My buddy group from the programme still meets on a call every Sunday, eight months after graduating. That wasn't in the brochure."],
  ['Sneha Gupta', 'Operations Manager, Delhivery', 'a1', "If you're a working professional scared of quitting your job for a master's: this format works. I kept my salary, my role, and still finished."],
  ['Nikhil Iyer', 'Product Manager, Swiggy', 'a2', 'Six months ago I finished the programme. Today I got promoted to lead the team I used to report to.'],
  ['Neha Joshi', 'HR Business Partner, Wipro', 'a3', 'Just back from campus immersion week. Meeting 60 people from my cohort after a year of little squares on a screen. I did not expect it to matter this much. It did.'],
  ['Lakshmi Reddy', 'Data Engineer, PhonePe', 'a4', 'Walked the stage today. Two years of weekend classes, assignments submitted at midnight after putting the kids to bed, and one very patient family.'],
  ['Rohan Menon', 'Marketing Lead, Nykaa', 'a6', 'Meeting my cohort in person after a year on screen changed how I think about the whole programme.'],
  ['Lakshmi Iyer', 'Sales Head, Asian Paints', 'a7', 'Eight months after graduating, the study group is still the first chat I open in the morning.'],
  ['Nisha Nair', 'Growth Manager, Zomato', 'a8', 'People keep asking if the programme is worth it, so, publicly: yes, if you do the work. No, if you want a certificate to happen to you.'],
  ['Aditya Sharma', 'Scrum Master, Tech Mahindra', 'a2', 'Having someone check in every fortnight, who actually read my submissions, changed everything.'],
  ['Priya Raman', 'Product Analyst, Freshworks', 'a3', 'Finally got to ask the questions I had been saving up all term. Two hours with faculty on campus was worth more than a month of forum threads.', 'im-2.png'],
  ['Karan Malhotra', 'Consultant, Deloitte', 'a1', 'The mentor who marked every one of my assignments, answering my questions face to face. Strange and brilliant in equal measure.', 'im-3.png'],
  ['Meera Pillai', 'Founder, Studio Kaapi', 'a7', 'Did not expect the founders to show up and spend an hour listening to what our cohort is building. They took notes.', 'im-4.png'],
  ['Vikram Desai', 'Engineering Manager, Razorpay', 'a2', 'One week, one campus, and a group photo that finally has everyone in it. See you all at convocation.', 'im-5.png'],
  ['Harish Bhat', 'Data Engineer, PhonePe', 'a5', 'Met my study group in person for the first time at IIIT Bangalore. Eighteen months of late-night calls, and they are exactly who I thought they would be.', 'conv-l5.png'],
  ['Nisha Nair', 'Growth Manager, Zomato', 'a8', 'My parents flew in for this. They watched me study on a laptop for two years. Today they watched me walk across the stage at IIT Bombay.', 'conv-l2.png'],
  ['Rahul Verma', 'Business Analyst, Flipkart', null, 'Switched from operations to analytics at 34. The capstone project is what got me the interview. The interview is what got me the job.'],
  ['Divya Krishnan', 'UX Designer, Zoho', 'a4', 'Degree in hand. Framing this one.', 'conv-p2.png'],
  ['Sameer Khan', 'Finance Manager, HDFC Bank', 'a0', 'Career Crossroads meetup in Mumbai last night. Forty alumni, one room, and more honest career advice than I have had in ten years.', 'al3-crossroads.png'],
  ['Pooja Bansal', 'Marketing Manager, Tata Consumer', null, 'Studying at 11pm after the kids sleep is not glamorous. But it is possible, and that is what I want other parents to hear.'],
  ['Arvind Rao', 'Cloud Architect, Infosys', 'a6', 'Alumni mixer in Bengaluru. Ran into three people from my old cohort and two who are now hiring.', 'al3-mixers.png'],
  ['Kavya Menon', 'Data Scientist, Myntra', 'a3', 'The whole cohort, in one frame. Proud to be somewhere in the third row.', 'conv-l4.png'],
  ['Tarun Gill', 'Product Lead, CRED', null, 'My advice to anyone starting: book the mentor calls even when you think you do not need them. Especially then.'],
  ['Shreya Patel', 'Analytics Manager, Paytm', 'a8', 'Coffee, a counter, and twenty people who all signed up for the same reason. From the Ground Up was the best Saturday I have had this year.', 'cafe.png'],
];

export type PostTag = 'Convocation' | 'Immersion' | 'Career' | 'Learning';
export const POST_TAGS: PostTag[] = ['Convocation', 'Immersion', 'Career', 'Learning'];

const tagOf = (t: string): PostTag =>
  /convocation|walk across the stage|walked the stage|degree|cohort, in one frame/i.test(t) ? 'Convocation'
    : /campus|immersion|in person|meetup|mixer|from the ground up/i.test(t) ? 'Immersion'
      : /promot|salary|role|lead the team/i.test(t) ? 'Career'
        : 'Learning';

/** Every post, for the "Read all posts" page. */
export const ALL_POSTS: (Post & { tag: PostTag })[] = RAW.map(([name, role, av, text, photo], k) => ({
  ...withMeta({ name, role, av, text, photo: photo ? '/assets/' + photo : null }, k),
  tag: tagOf(text),
}));

/** The two marquee rows in "In their own words". */
export const MARQUEE_A: Post[] = RAW.slice(0, 6).map(([name, role, av, text], k) => withMeta({ name, role, av, text }, k));
export const MARQUEE_B: Post[] = RAW.slice(6, 12).map(([name, role, av, text], k) => withMeta({ name, role, av, text }, k + 3));

/** Posts on each convocation detail page. */
export const CONVOCATION_POSTS = rows([
  ['Nisha Nair', 'Growth Manager, Zomato', 'a8', '15 Mar 2026', '2,603', '171 comments', 'My parents flew in for this. They watched me study on a laptop for two years. Today they watched me walk across the stage at IIT Bombay.', 'conv-l2.png'],
  ['Lakshmi Reddy', 'Data Engineer, PhonePe', 'a4', '14 Mar 2026', '2,184', '146 comments', 'Walked the stage today. Two years of weekend classes, assignments submitted at midnight after putting the kids to bed, and one very patient family.', 'conv-l3.png'],
  ['Aditya Iyer', 'Supply Chain Manager, Reliance Retail', 'a0', '14 Mar 2026', '1,092', '58 comments', 'Received my degree at the convocation ceremony today. Quietly proud.', null],
  ['Harish Bhat', 'Data Engineer, PhonePe', 'a5', '21 Mar 2026', '1,947', '112 comments', 'Met my study group in person for the first time at IIIT Bangalore. Eighteen months of late-night calls, and they are exactly who I thought they would be.', 'conv-l5.png'],
  ['Divya Krishnan', 'UX Designer, Zoho', 'a3', '16 Mar 2026', '1,318', '74 comments', 'Degree in hand. Framing this one.', 'conv-p2.png'],
  ['Rohan Menon', 'Marketing Lead, Nykaa', 'a6', '16 Mar 2026', '1,362', '88 comments', 'Class of 2026, in one frame. A year of breakout rooms and late-night group calls, and today we finally stood next to each other.', 'conv-l4.png'],
]);

/** Posts on each immersion detail page, mentioning that city. */
export const immersionPosts = (city: string) => rows([
  ['Shreya Patel', 'Analytics Manager, Paytm', 'a8', '2w', '1,412', '72 comments', `Coffee, a counter, and twenty people who all signed up for the same reason. From the Ground Up in ${city} was the best Saturday I have had this year.`, 'cafe.png'],
  ['Ankur Nagar', 'Product Manager, Swiggy', 'a2', '3w', '986', '48 comments', `It was a superb event! Learned more about where my morning coffee comes from in two hours than in ten years of drinking it. Thank you upGrad for bringing this to ${city}.`, 'im3-voices.png'],
  ['Meera Pillai', 'Founder, Studio Kaapi', 'a7', '1mo', '2,031', '118 comments', 'Watching the founder brew live, right at the counter, and then tasting the same beans three different ways. Already asking when the next one is.', 'im3-first.png'],
]);

/** Posts on the study abroad stories page. */
export const ABROAD_STORY_POSTS = rows([
  ['Harish Bhat', 'Data Engineer, PhonePe', 'a5', '12 Aug 2026', '1,528', '78 comments', "A thank-you I've been putting off. When I enrolled I was sceptical. I'd tried online courses before and finished none of them. The difference this time was the mentor calls. Having someone check in every fortnight, who actually read my submissions, changed everything. I finished. First time ever.", 'sa-v0.png'],
  ['Neha Joshi', 'HR Business Partner, Wipro', 'a3', '3 Aug 2026', '964', '41 comments', 'Just back from campus immersion week. Meeting 60 people from my cohort after a year of little squares on a screen. I did not expect it to matter this much. It did.', 'sa-v3.png'],
  ['Sneha Gupta', 'Operations Manager, Delhivery', 'a1', '28 Jul 2026', '1,102', '56 comments', "If you're a working professional scared of quitting your job for a master's: this format works. I kept my salary, my role, and still finished.", null],
  ['Nisha Nair', 'Growth Manager, Zomato', 'a8', '19 Jul 2026', '2,310', '134 comments', 'People keep asking if the programme is worth it, so, publicly: yes, if you do the work. No, if you want a certificate to happen to you.', 'sa-v5.png'],
  ['Lakshmi Reddy', 'Data Engineer, PhonePe', 'a4', '8 Jul 2026', '1,847', '92 comments', 'Walked the stage today. Two years of weekend classes, assignments submitted at midnight after putting the kids to bed, and one very patient family.', 'sa-v6.png'],
  ['Aman Kapoor', 'MS Data Science, Germany', 'a6', '2 Jul 2026', '1,231', '67 comments', 'First week in Berlin. The year I spent studying online before flying out meant I walked into class already knowing half the material.', 'sa-plane.png'],
  ['Riya Sethi', 'MBA candidate, Dublin', null, '24 Jun 2026', '876', '39 comments', 'Visa approved. Twelve months of evenings, one very long document checklist, and a counsellor who answered every one of my 2am emails.', null],
  ['Kunal Shah', 'MS Computer Science, USA', 'a0', '15 Jun 2026', '1,644', '88 comments', 'Started the programme from Pune. Finishing it in Arizona. Same laptop, very different view.', 'sa-v1.png'],
]);

/** The study abroad videos (thumbnails only for now). */
export const ABROAD_VIDEOS: { src: string; alt: string; desc: string }[] = [
  ['Learner speaking by a window', 'Why they chose to study abroad, and what finally made the move feel possible.'],
  ['Learner on being ghosted by a freelancer', 'The setback that nearly stopped them, and how they got back on track.'],
  ['Learner sharing a suggestion', 'The one piece of advice they would give anyone applying next year.'],
  ['Learner seated in a studio', 'What their first semester overseas was really like.'],
  ['Learner on handling visas and paperwork', 'How they handled visas, deadlines and the paperwork in between.'],
  ['Learner in a blue blazer', 'From admit letter to first day on campus, in their own words.'],
  ['Learner sharing advice', 'What they wish they had known before they left home.'],
].map(([alt, desc], i) => ({ src: `/assets/sa-v${i}.png`, alt, desc }));

export const POSTS_HREF = '/posts/';
export const ABROAD_HREF = '/study-abroad/';
