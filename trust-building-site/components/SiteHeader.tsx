import Link from 'next/link';

/** Fixed header on the inner pages: logo home, plus a back link. */
export function SiteHeader({ back, label, tone }: { back: string; label: string; tone: 'light' | 'dark' }) {
  return (
    <header className={`dhdr dhdr--${tone}`}>
      <Link href="/" className="logo">upGrad</Link>
      <Link href={back} className="dhdr__back">← {label}</Link>
    </header>
  );
}
