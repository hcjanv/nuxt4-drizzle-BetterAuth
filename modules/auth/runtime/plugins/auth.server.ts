export default defineNuxtPlugin({
    name: 'better-auth-fetch-plugin',
    enforce: 'pre',
    async setup(nuxtApp) {
        const ssrContext = nuxtApp.ssrContext as (typeof nuxtApp.ssrContext & {
            _payloadReducers?: Record<string, unknown>
            '~payloadReducers'?: Record<string, unknown>
        })

        if (ssrContext) {
            // Nitro dev output may mangle private Nuxt SSR fields to "~..." while Nuxt app plugins still use "_...".
            const payloadReducers = ssrContext._payloadReducers || ssrContext['~payloadReducers'] || Object.create(null)
            ssrContext._payloadReducers = payloadReducers
            ssrContext['~payloadReducers'] = payloadReducers
        }

        if (nuxtApp.payload.serverRendered && !nuxtApp.payload.prerenderedAt) {
            try {
                await useAuth().setup()
            } catch (error) {
                console.error('[Auth Plugin] Setup failed:', error)
            }
        }
    }
})
