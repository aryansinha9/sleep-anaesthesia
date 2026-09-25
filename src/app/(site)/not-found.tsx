import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '96px var(--edge)', minHeight: '60vh' }}>
      <span className="kicker">Page not found</span>
      <h1 className="display">We couldn&apos;t find that page.</h1>
      <p className="sub">It may have moved. Try the home page, or get in touch and we&apos;ll help.</p>
      <div className="cta-row">
        <Link className="btn btn-primary" href="/">Go to the home page</Link>
        <Link className="btn btn-secondary" href="/contact">Contact us</Link>
      </div>
    </div>
  )
}
