<script setup>
import { zh_cn } from '@nuxt/ui/locale'

useHead({
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
        { rel: 'icon', href: '/favicon.ico' }
    ],
    htmlAttrs: {
        lang: 'zh-CN'
    }
})

const config = useRuntimeConfig()

const title = `${config.public.appName} - SaaS 管理系统`
const description = '基于 Nuxt 4、Better Auth、Drizzle ORM 和 MySQL 构建的 SaaS 管理系统。'

useHead({
    titleTemplate: `%s - ${config.public.appName}`
})

useSeoMeta({
    title,
    description,
    ogImage: '/og-image.png',
    twitterImage: '/og-image.png',
    ogTitle: title,
    ogDescription: description
})
</script>

<template>
    <UApp
        :locale="zh_cn"
        :toaster="{ progress: false }"
        :tooltip="{ delayDuration: 0 }"
    >
        <NuxtLoadingIndicator />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
