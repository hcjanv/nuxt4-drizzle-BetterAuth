const nitroConfig = {
    experimental: {
        tasks: true
    }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/ui',
        '@vueuse/nuxt',
        // (process.env.NODE_ENV === 'production' ? 'nuxt-api-shield' : null)
        'nuxt-file-storage',
        '@nuxtjs/mdc'
    ],

    imports: {
        dirs: ['~~/shared/types']
    },

    devtools: {
        enabled: true
    },

    experimental: {
        appManifest: false
    },

    app: {
        layoutTransition: { name: 'fade', mode: 'out-in' },
        pageTransition: { name: 'fade', mode: 'out-in' }
    },

    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        public: {
            appUrl: process.env.NUXT_SITE_URL || 'http://localhost:3699',
            appName: process.env.NUXT_SITE_NAME || 'Nuxt SaaS 系统'
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || undefined,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || undefined
        },
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID || undefined,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || undefined
        },
        ai: {
            providerName: process.env.AI_PROVIDER_NAME || 'siliconflow',
            apiKey: process.env.AI_API_KEY || process.env.NUXT_OPENAI_API_KEY || undefined,
            baseURL: process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1',
            model: process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
        },
        openaiApiKey: process.env.NUXT_OPENAI_API_KEY || undefined
    },

    compatibilityDate: '2025-01-15',

    // @ts-expect-error Nuxt 4 currently omits nitro from user config types, but runtime still reads it.
    nitro: nitroConfig,

    eslint: {
        config: {
            stylistic: {
                indent: 4,
                commaDangle: 'never',
                braceStyle: '1tbs'
            }
        }
    },

    fileStorage: {
        mount: process.env.NUXT_STORAGE_PATH || './public/storage'
    },

    icon: {
        provider: 'server',
        fallbackToApi: false,
        serverBundle: {
            collections: ['lucide', 'simple-icons']
        }
    }
})
