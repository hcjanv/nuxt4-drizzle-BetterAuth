<script lang="ts" setup>
const starGithubRepo = () => useConfirmation({
    title: '打开 GitHub 仓库？',
    description: '将跳转到 GitHub 仓库页面。',
    color: 'neutral',
    icon: 'i-lucide-star',
    confirm: {
        label: '继续',
        icon: 'i-lucide-star',
        to: 'https://github.com/rasyidly/nuxt-saas-starter',
        target: '_blank',
        external: true
    }
})

useHead({
    title: '概览'
})
</script>

<template>
    <div class="flex flex-1 overflow-hidden">
        <UDashboardPanel>
            <template #header>
                <UDashboardNavbar title="概览">
                    <template #leading>
                        <UDashboardSidebarCollapse />
                    </template>
                </UDashboardNavbar>
            </template>
            <template #body>
                <UEmpty
                    icon="i-lucide-rocket"
                    title="即将上线"
                    description="这个功能正在开发中。"
                    variant="naked"
                    class="h-full"
                >
                    <template #actions>
                        <UButton
                            icon="i-lucide-github"
                            label="打开仓库"
                            variant="subtle"
                            @click="starGithubRepo()"
                        />
                    </template>
                </UEmpty>
            </template>
        </UDashboardPanel>
    </div>
</template>
