import { getWikiPage, slugify } from '../../utils/wiki'

export default defineEventHandler(async (event) => {
  const slug = slugify(getRouterParam(event, 'slug') ?? 'home')

  let page
  try {
    page = await getWikiPage(slug)
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Wiki cache unavailable',
      data: { message: (error as Error).message }
    })
  }

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Wiki page not found' })
  }

  return page
})
