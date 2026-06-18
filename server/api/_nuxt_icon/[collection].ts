import { getIcons } from '@iconify/utils'
import type { IconifyJSON } from '@iconify/types'
import { createError, eventHandler, getQuery, getRouterParam } from 'h3'

const collectionLoaders: Record<string, () => Promise<IconifyJSON>> = {
    lucide: async () => (await import('@iconify-json/lucide')).icons,
    'simple-icons': async () => (await import('@iconify-json/simple-icons')).icons
}

export default eventHandler(async (event) => {
    const collectionName = getRouterParam(event, 'collection')?.replace(/\.json$/, '')
    const loadCollection = collectionName ? collectionLoaders[collectionName] : undefined

    if (!collectionName || !loadCollection) {
        throw createError({
            statusCode: 404,
            statusMessage: '未找到图标集合'
        })
    }

    const collection = await loadCollection()
    const queryIcons = getQuery(event).icons
    const icons = (Array.isArray(queryIcons) ? queryIcons : [queryIcons])
        .filter((icon): icon is string => typeof icon === 'string')
        .flatMap(icon => icon.split(','))
        .filter(Boolean)

    if (!icons.length) {
        return collection
    }

    return getIcons(collection, icons)
})
