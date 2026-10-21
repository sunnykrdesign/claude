import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="nf">
      <span className="eyebrow eyebrow--dark">Not found</span>
      <h1 className="d-h1">We couldn’t find that <span className="it" style={{ color: 'var(--red-bright)' }}>moment.</span></h1>
      <Link href="/" className="pill">Back to all posts<span className="arr arr--x">→</span></Link>
    </main>
  );
}
