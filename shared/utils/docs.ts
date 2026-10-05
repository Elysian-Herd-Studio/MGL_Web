export function docsPath(slug: string): string {
  return slug === 'home' ? '/docs' : `/docs/${encodeURIComponent(slug)}`
}
