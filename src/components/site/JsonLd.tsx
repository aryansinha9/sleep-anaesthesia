// Renders structured data. `<` is escaped so content can never close the script tag.
export function JsonLd({ data }: { data: object | null | (object | null)[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean) as object[]
  return (
    <>
      {items.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />
      ))}
    </>
  )
}
