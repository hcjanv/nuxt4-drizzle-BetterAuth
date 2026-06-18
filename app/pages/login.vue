<script setup lang="ts">
definePageMeta({
    auth: false
})

const route = useRoute()

await navigateTo({
    path: '/auth/signin',
    query: route.query
}, { replace: true })
</script>

<template>
    <span />
</template>
