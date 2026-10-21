// Imperative motion for the landing page: one rAF loop drives scroll-linked
// effects, the hero post carousel, the sticky immersion stage, marquees, drag
// rails. It touches the DOM directly
// (by id / data attribute) so React only re-renders on coarse state changes.

export type HeaderState = { solid: boolean; hide: boolean; sec: string };

export type MotionHooks = {
  onHeader: (s: HeaderState) => void;
  getSa: () => number;
  saGo: (i: number) => void;
  saCount: number;
  /** Skip the preloader (e.g. arriving on a #hash from a detail page). */
  skipPreload: boolean;
};

type Box = { el: HTMLElement; top: number; h: number; id: string };
type Rail = { el: HTMLElement; down: boolean; x: number; l: number; v: number; lx: number; moved: number };
type Marquee = { dir: number; x: number; sp: number; half: number; hover: boolean };

// Hero carousel keyframes by distance from the active card (0, 1, 2, 2.5+).
const SLOT_AT = [0, 1, 2, 2.5];
const SLOT = { x: [0, 300, 520, 600], y: [0, 14, 28, 35], z: [90, -220, -580, -760], ry: [0, 30, 38, 42], s: [1, 0.92, 0.84, 0.8], blur: [0, 2, 5, 6], op: [1, 0.86, 0.72, 0] };
const slotAt = (key: keyof typeof SLOT, a: number) => {
  const v = SLOT[key];
  if (a >= 2.5) return v[3];
  let j = 0;
  while (j < 2 && a > SLOT_AT[j + 1]) j++;
  return v[j] + ((v[j + 1] - v[j]) * (a - SLOT_AT[j])) / (SLOT_AT[j + 1] - SLOT_AT[j]);
};

type HeroCarousel = {
  st: HTMLElement; rig: HTMLElement; slots: HTMLElement[]; N: number; active: number;
  hovered: number | null; auto: boolean; hover: boolean; t: number; ready: boolean;
  off: (i: number) => number;
  /** Continuous position that eases toward `target`, so cards glide between slots. */
  pos: number; target: number; hv: number[]; readyAt: number; freed: boolean; veils: HTMLElement[];
};

const cl = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export class LandingMotion {
  private off: (() => void)[] = [];
  private timers: number[] = [];
  private raf = 0;
  private cRaf = 0;
  private pRaf = 0;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;

  private motion: boolean;
  private reduced: boolean;

  private sy = 0; private ly = 0; private hy = 0; private vel = 0; private saT = 0;
  private header: HeaderState = { solid: false, hide: false, sec: '' };
  private m: Record<string, Box | null> = {};
  private secs: Box[] = [];
  private words: HTMLElement[] = [];
  private cvImgs: { img: HTMLElement; x: number; w: number }[] = [];
  private mqs = new Map<HTMLElement, Marquee>();
  private rails: Rail[] = [];
  private docH = 0;
  private saPaused = false;
  private cache = new WeakMap<HTMLElement, Record<string, string>>();

  private sc?: HeroCarousel;

  constructor(private hooks: MotionHooks) {
    this.motion = document.documentElement.classList.contains('motion');
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private $ = (id: string) => document.getElementById(id);

  /** Write a style only when it changed, to keep the per-frame loop cheap. */
  private set(el: HTMLElement | null | undefined, k: string, v: string) {
    if (!el) return;
    let c = this.cache.get(el);
    if (!c) this.cache.set(el, (c = {}));
    if (c[k] !== v) { el.style.setProperty(k, v); c[k] = v; }
  }

  private on<K extends keyof WindowEventMap>(t: EventTarget | null, ev: K | string, fn: (e: any) => void, o?: AddEventListenerOptions | boolean) {
    if (!t) return;
    t.addEventListener(ev, fn, o);
    this.off.push(() => t.removeEventListener(ev, fn, o));
  }

  private later(fn: () => void, ms: number) { this.timers.push(window.setTimeout(fn, ms)); }

  start() {
    const on = this.on.bind(this);
    this.sy = this.ly = this.hy = scrollY;

    if (this.motion) {
      this.io = new IntersectionObserver(en => en.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        this.io!.unobserve(el);
        if (el.hasAttribute('data-lines')) el.querySelectorAll<HTMLElement>('[data-ln]').forEach((l, i) => { l.style.transitionDelay = i * 0.1 + 's'; l.classList.add('is-in'); });
        if (el.hasAttribute('data-rv') || el.hasAttribute('data-ir')) el.classList.add('is-in');
      }), { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('[data-lines]:not([data-lines="hero"]),[data-rv],[data-ir]').forEach(el => this.io!.observe(el));
    }

    on(window, 'resize', () => this.measure());
    on(window, 'load', () => this.measure());
    if ('ResizeObserver' in window) { this.ro = new ResizeObserver(() => this.measure()); const r = this.$('root'); if (r) this.ro.observe(r); }
    document.fonts?.ready.then(() => this.measure());

    this.bindRails();
    this.bindMarquees();
    this.bindSwipe();
    this.initHero();
    this.measure();

    let last = performance.now();
    const loop = (now: number) => { this.raf = requestAnimationFrame(loop); const dt = Math.min(64, now - last); last = now; this.frame(dt); };
    this.raf = requestAnimationFrame(loop);
    this.preload();
  }

  stop() {
    this.off.forEach(f => f());
    this.timers.forEach(t => clearTimeout(t));
    cancelAnimationFrame(this.raf); cancelAnimationFrame(this.cRaf); cancelAnimationFrame(this.pRaf);
    this.io?.disconnect(); this.ro?.disconnect();
  }

  setSaPaused(p: boolean) { this.saPaused = p; }
  resetSaTimer() { this.saT = 0; }

  /* ─────────── Preloader + intro ─────────── */

  private preload() {
    const pl = this.$('pre'), pct = this.$('pre-pct'), bar = this.$('pre-bar');
    if (!pl || !this.motion || this.hooks.skipPreload || getComputedStyle(pl).visibility === 'hidden') {
      if (pl) pl.style.display = 'none';
      return this.intro();
    }
    pl.style.animation = 'none';
    const T = 1400, t0 = performance.now();
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      cancelAnimationFrame(this.pRaf);
      if (pct) pct.textContent = '100';
      pl.style.transition = 'clip-path 1.15s cubic-bezier(.76,0,.24,1)';
      pl.style.clipPath = 'inset(0 0 100% 0)';
      pl.style.pointerEvents = 'none';
      this.later(() => this.intro(), 360);
      this.later(() => { pl.style.display = 'none'; }, 1250);
    };
    this.on(pl, 'click', finish);
    const f = (now: number) => {
      const p = cl((now - t0) / T), e = 1 - Math.pow(1 - p, 3);
      if (pct) pct.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (bar) bar.style.transform = 'scaleX(' + e.toFixed(4) + ')';
      if (p < 1) this.pRaf = requestAnimationFrame(f); else finish();
    };
    this.pRaf = requestAnimationFrame(f);
  }

  private intro() {
    document.querySelectorAll<HTMLElement>('[data-lines="hero"] [data-ln]').forEach((el, i) => { el.style.transitionDelay = i * 0.11 + 's'; el.classList.add('is-in'); });
    document.querySelectorAll<HTMLElement>('[data-hf]').forEach((el, i) => { el.style.transitionDelay = 0.5 + i * 0.1 + 's'; el.classList.add('is-in'); });
    this.heroIn();
    this.countUp();
  }

  private countUp() {
    const el = this.$('hero-count');
    if (!el || !this.motion) return;
    const T = 2000, t0 = performance.now() + 500, total = Number(el.dataset.total) || 0;
    el.textContent = '0';
    const f = (now: number) => {
      const p = cl((now - t0) / T), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(total * e).toLocaleString('en-IN');
      if (p < 1) this.cRaf = requestAnimationFrame(f);
    };
    this.cRaf = requestAnimationFrame(f);
  }

  /* ─────────── Hero post carousel ─────────── */

  private initHero() {
    const st = this.$('hero-stage'), rig = this.$('hero-rig');
    if (!st || !rig) return;
    const slots = [...st.querySelectorAll<HTMLElement>('[data-slot]')];
    const N = slots.length;
    const active = Math.floor(N / 2);
    const sc: HeroCarousel = this.sc = {
      st, rig, slots, N, active, hovered: null as number | null, auto: !this.reduced, hover: false, t: 0, ready: false,
      pos: active, target: active, hv: slots.map(() => 0), readyAt: 0, freed: false,
      veils: slots.map(el => el.querySelector<HTMLElement>('[data-veil]')!),
      off: (i: number): number => { let o = i - sc.active; if (o > N / 2) o -= N; if (o < -N / 2) o += N; return o; },
    };
    this.on(st, 'pointerenter', () => { sc.hover = true; });
    this.on(st, 'pointerleave', () => { sc.hover = false; });
    this.on(st, 'keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.scGo(sc.active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.scGo(sc.active - 1); }
    });
    slots.forEach((el, i) => {
      this.on(el, 'pointerenter', () => { if (sc.off(i) !== 0) { sc.hovered = i; this.scRender(); } });
      this.on(el, 'pointerleave', () => { if (sc.hovered === i) { sc.hovered = null; this.scRender(); } });
      this.on(el, 'click', () => { if (sc.off(i) !== 0) this.scGo(i); });
      el.querySelectorAll('img').forEach(img => this.on(img, 'error', () => { img.style.display = 'none'; }));
    });
    const surf = this.$('hero-swipe');
    let s0: { x: number; t: number; id: number } | null = null;
    this.on(surf, 'pointerdown', (e: PointerEvent) => {
      s0 = { x: e.clientX, t: performance.now(), id: e.pointerId };
      surf!.style.cursor = 'grabbing';
      try { surf!.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    });
    this.on(surf, 'pointerup', (e: PointerEvent) => {
      surf!.style.cursor = 'grab';
      if (!s0 || s0.id !== e.pointerId) return;
      const dx = e.clientX - s0.x, v = (dx / Math.max(performance.now() - s0.t, 1)) * 1000;
      s0 = null;
      if (dx < -50 || v < -400) this.scGo(sc.active + 1);
      else if (dx > 50 || v > 400) this.scGo(sc.active - 1);
    });
    this.on(surf, 'pointercancel', () => { s0 = null; surf!.style.cursor = 'grab'; });
    this.scRender();
  }

  private heroIn() {
    const sc = this.sc; if (!sc || sc.ready) return;
    sc.ready = true;
    sc.readyAt = performance.now();
    // The entrance uses CSS transitions (staggered fly-in); after that scPaint drives every frame.
    sc.slots.forEach((el, i) => { el.style.transitionDuration = '1.6s'; el.style.transitionDelay = 0.35 + Math.abs(sc.off(i)) * 0.14 + 's'; });
    this.scRender();
    const h = this.$('hero-halo'); if (h) { h.style.transitionDelay = '.6s'; h.style.opacity = '1'; }
  }

  private scRender() {
    const sc = this.sc; if (!sc) return;
    sc.slots.forEach((el, i) => {
      const o = sc.off(i);
      if (!sc.ready) el.style.opacity = '0';
      el.style.cursor = o === 0 ? 'default' : 'pointer';
      el.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
    });
  }

  /** Per-frame layout of the hero cards from the eased carousel position and hover amounts. */
  private scPaint(k: number) {
    const sc = this.sc; if (!sc || !sc.ready) return;
    if (!sc.freed && performance.now() - sc.readyAt > 2400) { sc.freed = true; sc.slots.forEach(el => { el.style.transition = 'none'; }); }
    sc.pos += (sc.target - sc.pos) * (this.reduced ? 1 : Math.min(1, 0.06 * k));
    if (Math.abs(sc.target - sc.pos) < 0.0005) sc.pos = sc.target;
    const N = sc.N;
    sc.slots.forEach((el, i) => {
      let o = i - sc.pos; o = ((o % N) + N) % N; if (o > N / 2) o -= N;
      const a = Math.abs(o), d = Math.sign(o);
      sc.hv[i] += ((sc.hovered === i ? 1 : 0) - sc.hv[i]) * Math.min(1, 0.12 * k);
      const hv = sc.hv[i];
      const x = d * slotAt('x', a) * (1 - 0.05 * hv), y = slotAt('y', a) * (1 - hv), z = slotAt('z', a) + 100 * hv;
      const ry = -d * slotAt('ry', a) * (1 - 0.5 * hv), s = slotAt('s', a) + 0.04 * hv;
      const bl = slotAt('blur', a) * (1 - hv), op0 = slotAt('op', a), op = op0 + (1 - op0) * hv * (a < 2.4 ? 1 : 0);
      this.set(el, 'transform', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(4)})`);
      this.set(el, 'opacity', op.toFixed(3));
      this.set(el, 'filter', bl > 0.05 ? `blur(${bl.toFixed(1)}px)` : 'none');
      this.set(el, 'z-index', String(Math.round(30 - a * 5 + hv * 5)));
      this.set(el, 'pointer-events', op < 0.05 ? 'none' : 'auto');
      this.set(sc.veils[i], 'opacity', (Math.min(1, a) * (0.3 + 0.14 * a) * (1 - hv)).toFixed(3));
    });
  }

  private scGo(i: number) {
    const sc = this.sc; if (!sc) return;
    sc.hovered = null; sc.t = 0;
    const N = sc.N, next = ((i % N) + N) % N;
    let dlt = next - sc.active;
    if (dlt > N / 2) dlt -= N;
    if (dlt < -N / 2) dlt += N;
    sc.target += dlt; sc.active = next;
    this.scRender();
  }

  private heroFrame(dt: number, p: number, k: number) {
    const sc = this.sc; if (!sc) return;
    const vw = innerWidth, T = 5200;
    if (sc.ready && sc.auto && !sc.hover && p < 0.6) { sc.t += dt; if (sc.t >= T) this.scGo(sc.active + 1); }
    this.scPaint(k);
    const s = Math.max(0.56, Math.min(1, vw / 1100));
    this.set(sc.rig, 'transform', `scale(${s.toFixed(3)}) rotateX(${(p * 20).toFixed(2)}deg)`);
    this.set(sc.st, 'transform', `translate3d(0,${(-p * 90).toFixed(1)}px,0) scale(${(1 - p * 0.1).toFixed(4)})`);
    this.set(sc.st, 'opacity', Math.max(0, 1 - p * 1.2).toFixed(3));
  }

  /* ─────────── Measure + frame ─────────── */

  private measure() {
    const g = (id: string): Box | null => { const el = this.$(id); if (!el) return null; const r = el.getBoundingClientRect(); return { id, el, top: r.top + scrollY, h: r.height }; };
    this.m = { hero: g('p5-hero'), words: g('man-words'), im: g('im-stage'), ab: g('ab-panel'), close: g('p5-close') };
    this.secs = ['p5-conv', 'p5-abroad', 'p5-imm', 'p5-words'].map(g).filter((b): b is Box => !!b);
    this.words = [...document.querySelectorAll<HTMLElement>('[data-w]')];
    const tr = this.$('cv-track');
    if (tr) this.cvImgs = [...tr.querySelectorAll<HTMLElement>('[data-cvimg="1"]')].map(img => { const f = img.closest<HTMLElement>('[data-cvcard]')!; return { img, x: f.offsetLeft, w: f.offsetWidth }; });
    this.mqs.forEach((o, el) => { o.half = el.scrollWidth / 2; });
    this.docH = document.documentElement.scrollHeight - innerHeight;
  }

  private frame(dt: number) {
    const $ = this.$, y = scrollY, vh = innerHeight, vw = innerWidth, m = this.m, k = dt / 16.67;
    this.sy = this.reduced ? y : this.sy + (y - this.sy) * Math.min(1, 0.1 * k);
    if (Math.abs(y - this.sy) < 0.1) this.sy = y;
    const sy = this.sy;
    this.vel += (y - this.ly - this.vel) * 0.12; this.ly = y;

    // Header: solid past the hero, hides on scroll down, tracks the current section.
    const heroH = m.hero ? m.hero.h : vh;
    const solid = y > heroH * 0.8;
    let hide = this.header.hide;
    if (Math.abs(y - this.hy) > 12) { hide = y > heroH && y > this.hy; this.hy = y; }
    if (y < heroH) hide = false;
    let sec = '';
    this.secs.forEach(s => { if (y + vh * 0.4 >= s.top && y + vh * 0.4 < s.top + s.h) sec = s.id; });
    if (solid !== this.header.solid || hide !== this.header.hide || sec !== this.header.sec) {
      this.header = { solid, hide, sec };
      this.hooks.onHeader(this.header);
    }
    this.set($('hdr-prog'), 'transform', `scaleX(${(this.docH > 0 ? cl(y / this.docH) : 0).toFixed(4)})`);

    if (m.hero && sy < heroH + 50) {
      const p = cl(sy / heroH);
      const c = $('hero-copy');
      this.set(c, 'transform', `translate3d(0,${(-p * 120).toFixed(1)}px,0)`);
      this.set(c, 'opacity', Math.max(0, 1 - p * 1.7).toFixed(3));
      this.heroFrame(dt, p, k);
    }

    // Manifesto: words light up as the paragraph scrolls through.
    if (m.words && this.words.length && !this.reduced) {
      const q = cl((sy + vh * 0.82 - m.words.top) / (vh * 0.45 + m.words.h * 0.7));
      const reach = q * (this.words.length + 6);
      this.words.forEach((w, i) => this.set(w, 'opacity', (0.14 + 0.86 * cl((reach - i) / 6)).toFixed(2)));
    }

    // Convocation strip: horizontal parallax inside each photo + progress bar.
    const cs = $('cv-scroll');
    if (cs) {
      const t = cl(cs.scrollLeft / Math.max(1, cs.scrollWidth - cs.clientWidth)), tx = -cs.scrollLeft;
      if (!this.reduced) this.cvImgs.forEach(o => { const r = (o.x + tx + o.w / 2 - vw / 2) / vw; this.set(o.img, 'transform', `translate3d(${(-r * 7).toFixed(2)}%,0,0) scale(1.16)`); });
      this.set($('cv-bar'), 'transform', `scaleX(${t.toFixed(4)})`);
    }

    this.pin(m.im, sy);

    if (m.ab && !this.reduced && sy + vh > m.ab.top && sy < m.ab.top + m.ab.h) {
      const q = cl((sy + vh - m.ab.top) / (vh + m.ab.h));
      this.set($('ab-bg'), 'transform', `translate3d(0,${((q - 0.5) * -110).toFixed(1)}px,0) scale(1.06)`);
    }
    if (m.close && !this.reduced) {
      const q = cl((sy + vh - m.close.top) / (vh * 0.9));
      this.set($('close-h'), 'transform', `scale(${(0.86 + 0.14 * q).toFixed(4)})`);
    }

    // Marquees: drift, speed up with scroll velocity, pause on hover.
    this.mqs.forEach((o, el) => {
      if (!o.half) return;
      const target = this.reduced || o.hover ? 0 : o.dir * (0.5 + Math.min(Math.abs(this.vel) * 0.32, 14));
      o.sp += (target - o.sp) * 0.08 * k;
      o.x += o.sp * k;
      if (o.x <= -o.half) o.x += o.half;
      if (o.x > 0) o.x -= o.half;
      this.set(el, 'transform', `translate3d(${o.x.toFixed(1)}px,0,0)`);
    });

    // Drag-rail inertia.
    this.rails.forEach(r => { if (!r.down && Math.abs(r.v) > 0.15) { r.el.scrollLeft -= r.v * k; r.v *= Math.pow(0.93, k); } });

    // Study-abroad carousel autoplays while on screen.
    const st = $('ab-stage');
    if (st) {
      const r = st.getBoundingClientRect(), D = 5600;
      if (!this.reduced && r.bottom > 0 && r.top < vh && !this.saPaused && !document.hidden) this.saT += dt;
      if (this.saT >= D) { this.saT = 0; this.hooks.saGo((this.hooks.getSa() + 1) % this.hooks.saCount); }
    }
  }

  /* ─────────── Sticky immersion stage ─────────── */

  private pin(mm: Box | null | undefined, sy: number) {
    if (!mm || !mm.h) return;
    const $ = this.$, vh = innerHeight;
    if (sy + vh * 1.5 < mm.top || sy > mm.top + mm.h + vh * 0.5) return;
    const N = Number(mm.el.dataset.n) || 3, span = Math.max(1, mm.h - vh);
    const t = cl((sy - mm.top) / span), raw = t * (N - 1);
    const k = Math.min(N - 2, Math.floor(raw)), f = raw - k;
    const e = (x: number) => { x = cl((x - 0.16) / 0.68); return x * x * (3 - 2 * x); };
    const seg = raw >= N - 1 ? N - 1 : k + e(f);
    const act = Math.round(seg);
    for (let i = 0; i < N; i++) {
      const d = seg - i, c = $('im-c' + i), tx = $('im-t' + i), s = $('im-s' + i);
      if (c) {
        if (d < 0) {
          const p = Math.min(1, -d);
          this.set(c, 'transform', `translate3d(0,${(p * 110).toFixed(2)}%,0) rotate(${(p * 5).toFixed(2)}deg) scale(${(1 + p * 0.06).toFixed(4)})`);
          this.set(c, 'filter', 'none'); this.set(c, 'opacity', '1');
        } else {
          const q = Math.min(1, d);
          this.set(c, 'transform', `translate3d(0,${(-q * 4).toFixed(2)}%,0) scale(${(1 - q * 0.08).toFixed(4)})`);
          this.set(c, 'filter', q > 0.002 ? `blur(${(q * 6).toFixed(2)}px)` : 'none');
          this.set(c, 'opacity', (1 - q * 0.5).toFixed(3));
        }
      }
      if (tx) {
        const a = cl(1 - Math.abs(d) * 2.4);
        this.set(tx, 'opacity', a.toFixed(3));
        this.set(tx, 'transform', `translate3d(0,${(-d * 32).toFixed(1)}px,0)`);
        this.set(tx, 'filter', a < 0.995 ? `blur(${((1 - a) * 8).toFixed(2)}px)` : 'none');
        this.set(tx, 'visibility', a > 0.01 ? 'visible' : 'hidden');
      }
      if (s) {
        s.classList.toggle('is-active', i === act);
        this.set(s.querySelector<HTMLElement>('[data-fill]'), 'transform', `scaleX(${cl(seg - i + 1).toFixed(4)})`);
      }
    }
    this.set($('im-roll'), 'transform', `translate3d(0,${(-seg).toFixed(4)}em,0)`);
    this.set($('im-bg'), 'transform', `scale(${(1.14 - t * 0.12).toFixed(4)})`);
  }

  /** Scroll the sticky stage to show step `i`. */
  goStep(i: number) {
    const st = this.$('im-stage'); if (!st) return;
    const N = Number(st.dataset.n) || 3, span = st.offsetHeight - innerHeight;
    scrollTo({ top: st.getBoundingClientRect().top + scrollY + span * (i / (N - 1)) + 2, behavior: this.reduced ? 'auto' : 'smooth' });
  }

  /* ─────────── Pointer niceties ─────────── */

  /** Mouse drag-to-scroll with inertia. A drag never triggers the click underneath. */
  private bindRails() {
    document.querySelectorAll<HTMLElement>('[data-drag]').forEach(el => {
      const r: Rail = { el, down: false, x: 0, l: 0, v: 0, lx: 0, moved: 0 };
      this.rails.push(r);
      this.on(el, 'pointerdown', (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        r.down = true; r.x = r.lx = e.clientX; r.l = el.scrollLeft; r.v = 0; r.moved = 0; el.style.cursor = 'grabbing';
      });
      this.on(window, 'pointermove', (e: PointerEvent) => {
        if (!r.down) return;
        const dx = e.clientX - r.x;
        r.moved = Math.max(r.moved, Math.abs(dx)); el.scrollLeft = r.l - dx; r.v = (e.clientX - r.lx) * 0.9; r.lx = e.clientX;
      });
      this.on(window, 'pointerup', () => { if (!r.down) return; r.down = false; el.style.cursor = 'grab'; });
      this.on(el, 'click', (e: MouseEvent) => { if (r.moved > 6) { e.preventDefault(); e.stopPropagation(); } r.moved = 0; }, true);
      this.on(el, 'dragstart', (e: DragEvent) => e.preventDefault());
    });
  }

  private bindMarquees() {
    document.querySelectorAll<HTMLElement>('[data-mq]').forEach(el => {
      const o: Marquee = { dir: Number(el.dataset.mq) || -1, x: 0, sp: 0, half: el.scrollWidth / 2, hover: false };
      if (o.dir > 0) o.x = -o.half / 2;
      this.mqs.set(el, o);
      this.on(el, 'mouseenter', () => { o.hover = true; });
      this.on(el, 'mouseleave', () => { o.hover = false; });
    });
  }

  private bindSwipe() {
    const st = this.$('ab-stage'); if (!st) return;
    let x0: number | null = null;
    this.on(st, 'pointerdown', (e: PointerEvent) => { x0 = e.clientX; });
    this.on(window, 'pointerup', (e: PointerEvent) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) this.hooks.saGo(this.hooks.getSa() + (dx < 0 ? 1 : -1));
    });
  }
}
