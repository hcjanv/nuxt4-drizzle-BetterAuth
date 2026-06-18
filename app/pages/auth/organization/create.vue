<script setup lang="ts">
definePageMeta({
    layout: 'auth'
})

const { setup, organizations, setActiveOrganization } = useAuth()

async function onAfterCreate() {
    await setup()
    await navigateTo('/')
}

const organization = ref(organizations.value[0]?.id)

async function switchOrganization() {
    if (organization.value) {
        await setActiveOrganization({
            organizationId: organization.value
        })
        await navigateTo('/')
    }
}

useHead({ title: '选择组织' })
</script>

<template>
    <UPageCard
        title="选择组织"
        description="请选择已有组织，或创建一个新的组织。"
        variant="naked"
        :ui="{ wrapper: 'text-center mx-auto mb-4', leading: 'mx-auto', title: 'text-xl' }"
    >
        <template #leading>
            <UButton
                icon="i-lucide-box"
                to="/"
                variant="link"
                size="xl"
                :ui="{ leadingIcon: 'size-8' }"
                class="mb-4"
            />
        </template>
        <UFormField
            v-if="organizations.length"
            label="选择已有组织"
        >
            <div class="flex gap-2">
                <USelectMenu
                    v-model="organization"
                    :items="organizations"
                    value-key="id"
                    label-key="name"
                    variant="soft"
                />
                <UButton
                    :label="'选择'"
                    :disabled="!organization"
                    variant="subtle"
                    @click="switchOrganization()"
                />
            </div>
        </UFormField>
        <USeparator
            v-if="organizations.length"
            label="或创建新组织"
            :ui="{ label: 'text-sm text-muted' }"
            class="py-2"
        />
        <AppOrganizationCreateForm @after-create="onAfterCreate" />
    </UPageCard>
</template>
