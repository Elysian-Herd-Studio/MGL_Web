export interface DocEntry {
  slug: string
  title: string
}

export interface DocTocEntry {
  id: string
  text: string
  depth: number
}

export interface DocPage extends DocEntry {
  html: string
  toc: DocTocEntry[]
  updatedAt: string
  editUrl: string
  prev: DocEntry | null
  next: DocEntry | null
}
