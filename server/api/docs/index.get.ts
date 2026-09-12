import { getWikiEntries } from '../../utils/wiki'

export default defineEventHandler(async () => {
  try {
    const entries = await getWikiEntries()
    return entries.map(({ slug, title }) => ({ slug, title }))
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Wiki cache unavailable',
      data: { message: (error as Error).message }
    })
  }
})
