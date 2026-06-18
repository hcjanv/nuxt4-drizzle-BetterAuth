export default defineNuxtPlugin(async (nuxtApp) => {
    if (!nuxtApp.payload.serverRendered) {
        await useAuth().setup()
    } else {
        nuxtApp.hook('app:mounted', async () => {
            await useAuth().setup()
        })
    }
})
