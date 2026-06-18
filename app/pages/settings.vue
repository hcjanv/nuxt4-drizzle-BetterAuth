<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const navigations: NavigationMenuItem[][] = [[
    { label: '个人资料', icon: 'i-lucide-user', to: '/settings', exact: true },
    { label: '组织设置', icon: 'i-lucide-building', to: '/settings/organization', exact: true }
]]

useHead({
    title: '设置'
})
</script>

<template>
    <div class="flex flex-1 overflow-hidden">
        <UDashboardPanel>
            <template #header>
                <UDashboardNavbar title="设置">
                    <template #leading>
                        <UDashboardSidebarCollapse />
                    </template>
                </UDashboardNavbar>

                <UDashboardToolbar>
                    <UNavigationMenu
                        :items="navigations"
                        highlight
                        class="-mx-1 flex-1"
                    />
                </UDashboardToolbar>
            </template>

            <template #body>
                <NuxtPage />
            </template>
        </UDashboardPanel>
    </div>
</template>
