import Link from 'next/link'

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        {items.map((it, i) => (
          <li key={it.path}>{i === items.length - 1 ? <span aria-current="page">{it.name}</span> : <Link href={it.path}>{it.name}</Link>}</li>
        ))}
      </ol>
    </nav>
  )
}
