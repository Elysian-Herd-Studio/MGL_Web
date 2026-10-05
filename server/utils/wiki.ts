import { spawn } from 'node:child_process'
import { readdir, readFile, rm, mkdir, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { Marked, type Token } from 'marked'
import type { DocEntry, DocPage, DocTocEntry } from '../../shared/types/docs'
import { docsPath } from '../../shared/utils/docs'

export interface WikiEntry extends DocEntry {
  file: string
}

export interface WikiPage extends DocPage {
  file: string
}

interface WikiState {
  /** Coalesces concurrent syncs into a single git run. */
  inflight: Promise<void> | null
  /** Cached page index, invalidated after each successful sync. */
  entries: WikiEntry[] | null
}

// Nitro bundles server utils into one module instance per process, but dev HMR
// can re-evaluate the module, so state lives on globalThis to stay stable.
const state = ((globalThis as typeof globalThis & { __mglWiki?: WikiState }).__mglWiki ??= {
  inflight: null,
  entries: null
})

const GIT_TIMEOUT_MS = 60_000

/** Scheme (http:, mailto:, ...), protocol-relative, anchor, or site-absolute. */
const EXTERNAL_LINK = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i

export function slugify(name: string): string {
  return name
    .replace(/\.md$/i, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function decodeHref(href: string): string {
  try {
    return decodeURIComponent(href)
  } catch {
    return href
  }
}

function inlineText(tokens: Token[] = []): string {
  return tokens.map((token) => {
    if (token.type === 'html') return ''
    if (token.type === 'br') return ' '
    if ('tokens' in token && Array.isArray(token.tokens)) return inlineText(token.tokens)
    return 'text' in token && typeof token.text === 'string' ? token.text : ''
  }).join('')
}

function parseSource(markdown: string, file: string) {
  const renderer = new Marked()
  const tokens = renderer.lexer(markdown)
  const titleIndex = tokens.findIndex((token) => token.type !== 'space')
  const heading = tokens[titleIndex]
  const title = heading?.type === 'heading' && heading.depth === 1
    ? inlineText(heading.tokens).trim()
    : ''

  if (title) tokens.splice(titleIndex, 1)

  return { renderer, tokens, title: title || file.replace(/\.md$/i, '') }
}

function renderMarkdown(markdown: string, file: string) {
  const { renderer, tokens, title } = parseSource(markdown, file)
  const usedIds = new Set<string>()
  const toc: DocTocEntry[] = []

  renderer.use({
    walkTokens(token) {
      if (token.type !== 'link' || typeof token.href !== 'string') return
      if (EXTERNAL_LINK.test(token.href)) return

      const [, path = '', suffix = ''] = /^([^?#]*)(.*)$/.exec(token.href) ?? []
      const target = decodeHref(path).replace(/^\.\//, '')
      if (/\.[^/.]+$/.test(target) && !/\.md$/i.test(target)) return
      token.href = `${docsPath(slugify(target))}${suffix}`
    },
    renderer: {
      heading({ tokens, depth }) {
        const text = inlineText(tokens).trim()
        const base = text.toLowerCase()
          .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
          .replace(/\s/g, '-') || 'section'
        let id = base
        let count = 0
        while (usedIds.has(id)) id = `${base}-${++count}`
        usedIds.add(id)
        toc.push({ id, text, depth })

        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`
      }
    }
  })

  renderer.walkTokens(tokens, renderer.defaults.walkTokens!)
  return { title, html: renderer.parser(tokens), toc }
}

function buildEditUrl(repoUrl: string, file: string): string {
  const match = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\.wiki(?:\.git)?\/?$/i.exec(repoUrl)
  if (!match) return ''
  return `https://github.com/${match[1]}/${match[2]}/wiki/${encodeURIComponent(file.replace(/\.md$/i, ''))}/_edit`
}

function isPrerender(): boolean {
  return Boolean((import.meta as ImportMeta & { prerender?: boolean }).prerender)
}

function git(args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        GIT_ASKPASS: '',
        GCM_INTERACTIVE: 'never'
      }
    })

    let stdout = ''
    let stderr = ''

    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`git ${args[0]} timed out after ${GIT_TIMEOUT_MS}ms`))
    }, GIT_TIMEOUT_MS)

    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve(stdout)
      else reject(new Error(`git ${args.join(' ')} exited with ${code}: ${stderr.trim()}`))
    })
  })
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function hasMarkdown(dir: string): Promise<boolean> {
  try {
    const names = await readdir(dir)
    return names.some((name) => name.toLowerCase().endsWith('.md'))
  } catch {
    return false
  }
}

function extractTitle(markdown: string, file: string): string {
  return parseSource(markdown, file).title
}

async function runSync(): Promise<void> {
  // Never touch the network while prerendering (nuxt generate would crawl /docs).
  if (isPrerender()) return

  const { wikiRepoUrl, wikiDir } = useRuntimeConfig()
  const hasRepo = await pathExists(join(wikiDir, '.git'))

  try {
    if (hasRepo) {
      await git(['fetch', '--depth', '1', '--no-tags', 'origin', 'HEAD'], wikiDir)
      await git(['reset', '--hard', 'FETCH_HEAD'], wikiDir)
    } else {
      await rm(wikiDir, { recursive: true, force: true })
      await mkdir(dirname(wikiDir), { recursive: true })
      await git(['clone', '--depth', '1', '--no-tags', wikiRepoUrl, wikiDir])
    }
  } catch (error) {
    // Keep serving the previous cache when the remote is unreachable.
    if (await hasMarkdown(wikiDir)) {
      console.warn('[wiki] sync failed, serving stale cache:', (error as Error).message)
      return
    }
    throw error
  }

  state.entries = null
}

export function syncWiki(): Promise<void> {
  if (state.inflight) return state.inflight
  state.inflight = runSync().finally(() => {
    state.inflight = null
  })
  return state.inflight
}

/** Sync on demand when the cache is empty (e.g. before the first timer tick). */
export async function ensureWikiReady(): Promise<void> {
  const { wikiDir } = useRuntimeConfig()
  if (!(await hasMarkdown(wikiDir))) await syncWiki()
}

async function loadEntries(): Promise<WikiEntry[]> {
  const { wikiDir } = useRuntimeConfig()

  if (state.entries) return state.entries

  const names = await readdir(wikiDir)
  const entries: WikiEntry[] = []

  for (const name of names) {
    if (!name.toLowerCase().endsWith('.md')) continue
    // `_Sidebar.md`, `_Footer.md`, `_Header.md` are GitHub wiki internals.
    if (name.startsWith('_')) continue

    const markdown = await readFile(join(wikiDir, name), 'utf8')
    entries.push({ slug: slugify(name), file: name, title: extractTitle(markdown, name) })
  }

  entries.sort((a, b) => {
    if (a.slug === 'home') return -1
    if (b.slug === 'home') return 1
    return a.title.localeCompare(b.title)
  })

  state.entries = entries
  return entries
}

export async function getWikiEntries(): Promise<WikiEntry[]> {
  await ensureWikiReady()
  return loadEntries()
}

export async function getWikiPage(slug: string): Promise<WikiPage | null> {
  await ensureWikiReady()
  const entries = await loadEntries()

  // Only ever resolve through the index; never join user input into a path.
  const index = entries.findIndex((item) => item.slug === slug)
  const entry = entries[index]
  if (!entry) return null

  const { wikiDir, wikiRepoUrl } = useRuntimeConfig()
  const markdown = await readFile(join(wikiDir, entry.file), 'utf8')
  const { title, html, toc } = renderMarkdown(markdown, entry.file)
  const updatedAt = await git(['log', '-1', '--format=%cI', '--', entry.file], wikiDir)
    .then((date) => date.trim())
    .catch(() => '')
  const toMeta = (item: WikiEntry | undefined): DocEntry | null => item
    ? { slug: item.slug, title: item.title }
    : null

  return {
    ...entry,
    title,
    html,
    toc,
    updatedAt,
    editUrl: buildEditUrl(wikiRepoUrl, entry.file),
    prev: toMeta(entries[index - 1]),
    next: toMeta(entries[index + 1])
  }
}
